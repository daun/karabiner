import {
  type ManipulatorMap,
  type Modifier,
  type ToEvent,
  type ToKeyParam,
  to$,
  toKey,
} from "karabiner.ts";

const disabledMarker = Symbol("disabled");

export type Disabled = { [disabledMarker]: true };

export type Disableable<T> = T | Disabled;

export type DisableableManipulatorMap = Partial<
  Record<string | number, ToEvent | ToEvent[] | Disabled>
>;

/**
 * Mark a rule, mode, or single binding as inactive. It stays in the source for
 * reference but is left out of the generated configuration.
 */
export function disabled(_value?: unknown): Disabled {
  return { [disabledMarker]: true };
}

export function isDisabled(value: unknown): value is Disabled {
  return typeof value === "object" && value !== null && disabledMarker in value;
}

/** Drop disabled entries from a list of rules or manipulators. */
export function enabled<T>(items: Array<Disableable<T>>): T[] {
  return items.filter((item): item is T => !isDisabled(item));
}

/** Drop disabled entries from a key -> action map. */
export function enabledManipulators(
  manipulators: DisableableManipulatorMap,
): ManipulatorMap {
  return Object.fromEntries(
    Object.entries(manipulators).filter(([, action]) => !isDisabled(action)),
  ) as ManipulatorMap;
}

export function createDeviceConfiguration(
  { product_id, vendor_id }: { product_id: number; vendor_id: number },
  options: object,
): object {
  return {
    identifiers: {
      is_keyboard: true,
      product_id,
      vendor_id,
    },
    ...options,
  };
}

export function sortObjectKeys(_key: string, value: unknown) {
  if (Array.isArray(value)) return value;
  if (!(value instanceof Object)) return value;
  const object = value as Record<string, unknown>;
  return Object.keys(object)
    .sort()
    .reduce<Record<string, unknown>>((sorted, objectKey) => {
      sorted[objectKey] = object[objectKey];
      return sorted;
    }, {});
}

export function press(keyCode: ToKeyParam, modifiers?: Modifier[]): ToEvent {
  return toKey(keyCode, modifiers);
}

export function open(target: string): ToEvent {
  return to$(`open ${target}`);
}

export function raycast(command: string, background = false): ToEvent {
  const params = background ? "?launchType=background" : "";
  return to$(`open raycast://${command}${params}`);
}

export function window(name: string): ToEvent {
  return to$(
    `open -g raycast://extensions/raycast/window-management/${name}?launchType=background`,
  );
}

export function app(name: string): ToEvent {
  return open(`-a '${name}.app'`);
}

export function key(keyCode: string, to: object): object {
  return {
    from: { key_code: keyCode },
    to: [to],
  };
}
