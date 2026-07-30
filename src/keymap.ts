import { config } from "./rules";

/**
 * Prints every binding in the generated configuration as a flat, greppable
 * table. Each row is self-contained: `grep -i chrome` on the output returns the
 * full key sequence needed to trigger it.
 */

type ToEventLike = {
  key_code?: string;
  consumer_key_code?: string;
  apple_vendor_keyboard_key_code?: string;
  pointing_button?: string;
  shell_command?: string;
  modifiers?: string[];
  set_variable?: { name: string; value: unknown };
};

type ManipulatorLike = {
  from?: {
    key_code?: string;
    modifiers?: { mandatory?: string[]; optional?: string[] };
  };
  to?: ToEventLike[];
  to_if_alone?: ToEventLike[];
  conditions?: Array<{ type?: string; name?: string; value?: unknown }>;
};

type RuleLike = { description: string; manipulators: ManipulatorLike[] };

type Row = { keys: string; action: string };

const modifierSymbols: Record<string, string> = {
  command: "⌘",
  option: "⌥",
  control: "⌃",
  shift: "⇧",
};

const keyLabels: Record<string, string> = {
  up_arrow: "↑",
  down_arrow: "↓",
  left_arrow: "←",
  right_arrow: "→",
  spacebar: "Space",
  slash: "/",
  semicolon: ";",
  quote: "'",
  comma: ",",
  period: ".",
  equal_sign: "=",
  hyphen: "-",
  grave_accent_and_tilde: "`",
  non_us_backslash: "§",
  caps_lock: "Caps Lock",
  page_up: "Page Up",
  page_down: "Page Down",
};

function keyLabel(keyCode: string): string {
  if (keyLabels[keyCode]) return keyLabels[keyCode];
  if (keyCode.length === 1) return keyCode.toUpperCase();
  return keyCode;
}

function modifierLabel(modifiers?: string[]): string {
  if (!modifiers?.length) return "";
  const symbols = modifiers.map((modifier) => {
    const name = modifier.replace(/^(left|right)_/, "");
    return modifierSymbols[name] ?? name;
  });
  return [...new Set(symbols)].join("");
}

function describeShellCommand(command: string): string {
  const app = command.match(/open -a '(.+?)\.app'/);
  if (app) return `app: ${app[1]}`;

  const window = command.match(/window-management\/([^?'"]+)/);
  if (window) return `window: ${window[1]}`;

  const raycast = command.match(/raycast:\/\/([^?'"]+)/);
  if (raycast) return `raycast: ${raycast[1]}`;

  const url = command.match(/open (https?:\/\/\S+)/);
  if (url) return url[1];

  return `sh: ${command.length > 60 ? `${command.slice(0, 57)}…` : command}`;
}

/** Mode activation also fires the HUD notification, which is not a binding. */
function isModeHud(command: string): boolean {
  return command.includes("karabiner-mode") || command.includes("Hyper mode");
}

function describeToEvent(event: ToEventLike): string | null {
  if (event.set_variable) return null;
  if (event.shell_command) {
    if (isModeHud(event.shell_command)) return null;
    return describeShellCommand(event.shell_command);
  }

  const keyCode =
    event.key_code ??
    event.consumer_key_code ??
    event.apple_vendor_keyboard_key_code;
  if (keyCode) {
    const modifiers = modifierLabel(event.modifiers);
    return `key: ${modifiers ? `${modifiers} ` : ""}${keyLabel(keyCode)}`;
  }

  if (event.pointing_button) return `click: ${event.pointing_button}`;
  return null;
}

function describeActions(events?: ToEventLike[]): string {
  if (!events) return "";
  return events
    .map(describeToEvent)
    .filter((action): action is string => action !== null)
    .join(", ");
}

function modeVariable(manipulator: ManipulatorLike): string | null {
  const variable = manipulator.to?.find((event) =>
    event.set_variable?.name.startsWith("hyper_mode_"),
  );
  return variable?.set_variable?.name ?? null;
}

function hasCondition(manipulator: ManipulatorLike, name: string): boolean {
  return Boolean(manipulator.conditions?.some((c) => c.name === name));
}

function printTable(title: string, rows: Row[]): void {
  if (!rows.length) return;
  const width = Math.max(...rows.map((row) => row.keys.length));
  console.log(`\n${title}`);
  for (const row of rows) {
    console.log(`  ${row.keys.padEnd(width)}  ${row.action}`);
  }
}

const profile = config.profiles[0];
const rules = profile.complex_modifications.rules as unknown as RuleLike[];

for (const rule of rules) {
  const modeManipulator = rule.manipulators.find(modeVariable);
  const variable = modeManipulator ? modeVariable(modeManipulator) : null;

  if (modeManipulator && variable) {
    const modeKey = keyLabel(modeManipulator.from?.key_code ?? "?");
    const prefix = `Caps Lock + ${modeKey},`;
    const rows = rule.manipulators
      .filter((manipulator) => hasCondition(manipulator, variable))
      .map((manipulator) => ({
        keys: `${prefix} ${keyLabel(manipulator.from?.key_code ?? "?")}`,
        action: describeActions(manipulator.to),
      }))
      .filter((row) => row.action !== "");
    printTable(`${rule.description}  (hold Caps Lock + ${modeKey})`, rows);
    continue;
  }

  const rows = rule.manipulators.flatMap((manipulator) => {
    const keyCode = manipulator.from?.key_code;
    if (!keyCode) return [];

    const entries: Row[] = [];
    const isHyperKey = keyCode === "caps_lock";
    const keys = isHyperKey
      ? "Caps Lock (hold)"
      : `Caps Lock + ${keyLabel(keyCode)}`;
    const action = isHyperKey ? "Hyper ⌃⌥⇧⌘" : describeActions(manipulator.to);

    if (action) entries.push({ keys, action });

    const alone = describeActions(manipulator.to_if_alone);
    if (alone)
      entries.push({ keys: `${keyLabel(keyCode)} (alone)`, action: alone });

    return entries;
  });

  printTable(rule.description, rows);
}

const fnRows = (profile.fn_function_keys as unknown as ManipulatorLike[]).map(
  (manipulator) => ({
    keys: keyLabel(manipulator.from?.key_code ?? "?"),
    action: describeActions(manipulator.to),
  }),
);
printTable("Function keys", fnRows);

console.log(
  "\nDevice-specific simple modifications are defined in src/rules.ts.",
);
