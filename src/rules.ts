import fs from "node:fs";
import {
  type FromKeyParam,
  hyperLayer,
  ifVar,
  type LayerKeyParam,
  type ManipulatorMap,
  map,
  rule,
} from "karabiner.ts";
import {
  app,
  createDeviceConfiguration,
  key,
  open,
  press,
  raycast,
  sortObjectKeys,
  window,
} from "./utils";

const settings = {
  ask_for_confirmation_before_quitting: true,
  check_for_updates_on_startup: true,
  show_in_menu_bar: false,
  show_profile_name_in_menu_bar: false,
  unsafe_ui: false,
};

const hyperModifiers = "⌘⌥⌃⇧";

type HyperModeBehavior = "held" | "leader" | "sticky";

/**
 * Multi-key mode behavior:
 * - held: keep the mode key pressed while invoking actions (original behavior)
 * - leader: release the mode key, then invoke one action
 * - sticky: release the mode key and invoke actions until Escape or Caps Lock
 */
const defaultHyperModeBehavior: HyperModeBehavior = "held";

function withHyper(key: FromKeyParam) {
  return map(key, hyperModifiers, "any");
}

function hyperMode(
  key: LayerKeyParam,
  name: string,
  manipulators: ManipulatorMap,
  behavior: HyperModeBehavior = defaultHyperModeBehavior,
) {
  const mode = hyperLayer(key, `hyper_mode_${key}`).description(
    `Hyper mode - ${name}`,
  );

  if (behavior === "leader") mode.leaderMode();
  if (behavior === "sticky") mode.leaderMode({ sticky: true });

  return mode.notification(name).manipulators(manipulators);
}

function modeHudCommand(text: string) {
  const hammerspoonInstalled =
    '[ -d /Applications/Hammerspoon.app ] || [ -d "$HOME/Applications/Hammerspoon.app" ]';

  if (text === "") {
    return `if ${hammerspoonInstalled}; then /usr/bin/open -g 'hammerspoon://karabiner-mode'; fi`;
  }

  const hammerspoonUrl = `hammerspoon://karabiner-mode?name=${encodeURIComponent(text)}`;
  const appleScriptText = text.replaceAll("\\", "\\\\").replaceAll('"', '\\"');

  return `if ${hammerspoonInstalled}; then /usr/bin/open -g '${hammerspoonUrl}'; else /usr/bin/osascript -e 'display notification "${appleScriptText}" with title "Hyper mode"'; fi`;
}

function replaceModeNotifications<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(replaceModeNotifications) as T;
  }

  if (value === null || typeof value !== "object") return value;

  const object = value as Record<string, unknown>;
  const notification = object.set_notification_message;

  if (
    notification !== null &&
    typeof notification === "object" &&
    "text" in notification &&
    typeof notification.text === "string"
  ) {
    const { set_notification_message: _, ...rest } = object;
    return {
      ...rest,
      shell_command: modeHudCommand(notification.text),
    } as T;
  }

  return Object.fromEntries(
    Object.entries(object).map(([key, child]) => [
      key,
      replaceModeNotifications(child),
    ]),
  ) as T;
}

const ruleBuilders = [
  rule("Hyper Key (⌃⌥⇧⌘)").manipulators([
    map("caps_lock", { optional: "any" })
      .toHyper()
      .toIfAlone("escape")
      .condition(ifVar("__layer", 1).unless())
      .description("Caps Lock -> Hyper Key"),
  ]),

  rule("Direct Hyper shortcuts", ifVar("__layer", 1).unless()).manipulators([
    // Homerow keyboard navigation (already handled by actual Homerow shortcuts)
    // withHyper("spacebar").to(
    //   press("spacebar", ["right_control", "right_option", "right_command"]),
    // ),

    // // Homerow item search (already handled by actual Homerow shortcuts)
    // withHyper("semicolon").to(
    //   press("spacebar", ["right_shift", "right_option", "right_command"]),
    // ),

    // Arrow keys
    withHyper("h").to(press("left_arrow")),
    withHyper("j").to(press("down_arrow")),
    withHyper("k").to(press("up_arrow")),
    withHyper("l").to(press("right_arrow")),

    // Unicode symbol and menu-item search
    withHyper("u").to(raycast("extensions/mmazzarolo/unicode-symbols/index")),
    withHyper("slash").to(
      raycast("extensions/raycast/navigation/search-menu-items"),
    ),
  ]),

  hyperMode("b", "Browse", {
    g: open("https://github.com"),
    m: open("https://mondediplo.com"),
    n: open("https://www.theguardian.com/international"),
    r: open("https://reddit.com"),
    t: open("https://twitter.com"),
    y: open("https://news.ycombinator.com"),
  }),

  hyperMode("o", "Open", {
    1: app("1Password"),
    a: app("Figma"),
    b: app("Google Chrome"),
    c: app("Calendar"),
    d: app("Adobe InDesign 2024"),
    e: app("Spark"),
    f: app("Finder"),
    g: app("Tower"),
    i: app("iTerm"),
    m: app("Messages"),
    n: app("Notion"),
    p: app("Spotify"),
    r: app("Around"),
    s: app("Slack"),
    t: app("Things3"),
    v: app("Visual Studio Code"),
    z: app("zoom.us"),
  }),

  hyperMode("w", "Window", {
    // Arrows and HJKL: halves
    up_arrow: window("top-half"),
    down_arrow: window("bottom-half"),
    left_arrow: window("left-half"),
    right_arrow: window("right-half"),
    k: window("top-half"),
    j: window("bottom-half"),
    h: window("left-half"),
    l: window("right-half"),

    // Full and centered
    f: window("maximize"),
    c: window("reasonable-size"),

    // UIO: thirds
    u: window("first-third"),
    i: window("center-third"),
    n: window("first-two-thirds"),
    m: window("last-two-thirds"),
    o: window("last-third"),

    semicolon: window("maximize"),
    quote: window("almost-maximize"),
    equal_sign: window("make-larger"),
    hyphen: window("make-smaller"),
    comma: press("h", ["right_command"]),
  }),

  hyperMode("d", "Desktop", {
    // Move the window between desktops
    j: window("previous-desktop"),
    k: window("next-desktop"),
    // Go to the previous or next desktop
    h: press("left_arrow", ["right_control"]),
    l: press("right_arrow", ["right_control"]),
  }),

  hyperMode("s", "System", {
    u: press("volume_increment"),
    j: press("volume_decrement"),
    i: press("display_brightness_increment"),
    k: press("display_brightness_decrement"),
    l: press("q", ["right_control", "right_command"]),
    e: press("spacebar", ["right_control", "right_command"]),
    d: raycast("extensions/yakitrak/do-not-disturb/toggle"),
  }),

  hyperMode("v", "Move", {
    h: press("left_arrow"),
    j: press("down_arrow"),
    k: press("up_arrow"),
    l: press("right_arrow"),
    // Magicmove and scroll mode via homerow.app
    m: press("f", ["right_control"]),
    s: press("j", ["right_control"]),
    d: press("d", ["right_shift", "right_command"]),
    u: press("page_down"),
    i: press("page_up"),
  }),

  hyperMode("c", "Music", {
    p: press("play_or_pause"),
    n: press("fastforward"),
    b: press("rewind"),
  }),

  hyperMode("r", "Raycast", {
    a: raycast("extensions/abielzulio/chatgpt/ask"),
    c: raycast("extensions/raycast/system/open-camera"),
    e: raycast("extensions/raycast/emoji-symbols/search-emoji-symbols"),
    h: raycast("extensions/raycast/clipboard-history/clipboard-history"),
    n: raycast("script-commands/dismiss-notifications"),
    p: raycast("extensions/raycast/raycast/confetti"),
    u: raycast("extensions/mmazzarolo/unicode-symbols/index"),
  }),
];

const rules = replaceModeNotifications(
  ruleBuilders.map((builder) => builder.build()),
);

// Map function keys to re-enable brightness and volume controls
const fn_function_keys = [
  key("f1", { apple_vendor_keyboard_key_code: "brightness_down" }),
  key("f2", { apple_vendor_keyboard_key_code: "brightness_up" }),
  key("f3", { apple_vendor_keyboard_key_code: "mission_control" }),
  key("f4", { apple_vendor_keyboard_key_code: "spotlight" }),
  key("f5", { consumer_key_code: "dictation" }),
  key("f6", { key_code: "f13" }),
  key("f7", { consumer_key_code: "rewind" }),
  key("f8", { consumer_key_code: "play_or_pause" }),
  key("f9", { consumer_key_code: "fast_forward" }),
  key("f10", { consumer_key_code: "mute" }),
  key("f11", { consumer_key_code: "volume_decrement" }),
  key("f12", { consumer_key_code: "volume_increment" }),
];

// Swap [`] and [§] keys for external keyboards
const switch_accent_and_backslash = [
  key("grave_accent_and_tilde", { key_code: "non_us_backslash" }),
  key("non_us_backslash", { key_code: "grave_accent_and_tilde" }),
];

const macmini_customizations = createDeviceConfiguration(
  { product_id: 671, vendor_id: 76 },
  { simple_modifications: switch_accent_and_backslash },
);

const magic_keyboard_customizations = createDeviceConfiguration(
  { product_id: 801, vendor_id: 76 },
  { simple_modifications: switch_accent_and_backslash },
);

const macbook_customizations = createDeviceConfiguration(
  { product_id: 834, vendor_id: 1452 },
  { simple_modifications: switch_accent_and_backslash },
);

const profile = {
  name: "Default",
  selected: true,
  virtual_hid_keyboard: { keyboard_type_v2: "iso" },
  complex_modifications: { rules },
  fn_function_keys,
  devices: [
    macmini_customizations,
    magic_keyboard_customizations,
    macbook_customizations,
  ],
};

const config = {
  global: settings,
  profiles: [profile],
};

fs.writeFileSync(
  "build/karabiner.json",
  JSON.stringify(config, sortObjectKeys, 4),
);
