import fs from "fs";
import { KarabinerRules } from "./types";
import { createHyperSubLayers, app, open, window, sortObjectKeys, press, raycast, key, createDeviceConfiguration } from "./utils";

const settings = {
  ask_for_confirmation_before_quitting: true,
  check_for_updates_on_startup: true,
  show_in_menu_bar: false,
  show_profile_name_in_menu_bar: false,
  unsafe_ui: false,
};

const rules: KarabinerRules[] = [
  // Define the Hyper key itself
  {
    description: "Hyper Key (⌃⌥⇧⌘)",
    manipulators: [
      {
        description: "Caps Lock -> Hyper Key",
        from: { key_code: "caps_lock", modifiers: { optional: ["any"] } },
        to: [{ set_variable: { name: "hyper", value: 1 } }],
        to_after_key_up: [{ set_variable: { name: "hyper", value: 0 } }],
        to_if_alone: [{ key_code: "escape" }],
        type: "basic",
      },
    ],
  },
  ...createHyperSubLayers({
    // spacebar: Homerow keyboard navigation
    spacebar: press("spacebar", ["right_control", "right_option", "right_command"]),

    // hjkl: map to arrow keys (currently conflicts with other layers' nested HJKL mappings)
    h: press("left_arrow"),
    j: press("down_arrow"),
    k: press("up_arrow"),
    l: press("right_arrow"),

    // u = [U]nicode symbol search (currently conflicts with other layers' nested U mappings)
    u: raycast("extensions/mmazzarolo/unicode-symbols/index"),

    // slash = Search menu items
    slash: raycast("extensions/raycast/navigation/search-menu-items"),

    // b = [B]rowse site
    b: {
      g: open("https://github.com"),
      m: open("https://mondediplo.com"),
      n: open("https://www.theguardian.com/international"),
      r: open("https://reddit.com"),
      t: open("https://twitter.com"),
      y: open("https://news.ycombinator.com"),
    },

    // o = [O]pen application
    o: {
      // "M"essages
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
      // p: app("Adobe Photoshop 2024"),
      r: app("Around"),
      s: app("Slack"),
      t: app("Things3"),
      v: app("Visual Studio Code"),
      z: app("zoom.us"),
    },

    // w = [W]indow Sizing via Raycast Window Management
    w: {
      // Arrows: halfs
      up_arrow: window("top-half"),
      down_arrow:  window("bottom-half"),
      left_arrow: window("left-half"),
      right_arrow: window("right-half"),

      // Semantic: full, center
      f: window("maximize"),
      c: window("reasonable-size"),

      // HJKL: halfs
      k: window("top-half"),
      j: window("bottom-half"),
      h: window("left-half"),
      l: window("right-half"),

      // UIO = thirds
      u: window("first-third"),
      i: window("center-third"),
      n: window("first-two-thirds"),
      m: window("last-two-thirds"),
      o: window("last-third"),

      // maximize, almost-maximize
      semicolon: window("maximize"),
      quote: window("almost-maximize"),

      // comma: hide window
      comma: press("h", ["right_command"]),
    },

    // w = (currently inactive) "Window" via Raycast Window Management
    // w: {
    //   // Previous tab
    //   u: press("tab", ["right_control", "right_shift"]),
    //   // Next tab
    //   i: press("tab", ["right_control"]),
    //   // Window: next
    //   n: press("grave_accent_and_tilde", ["right_command"]),
    //   // Window: back
    //   b: press("open_bracket", ["right_command"]),
    //   // Window: forward (no literal connection: f and n are already taken)
    //   m: press("close_bracket", ["right_command"]),
    //   // Window: Next display
    //   d: press("right_arrow", ["right_control", "right_option", "right_command"]),
    // },

    // d = "Desktop"
    d: {
      // j/k: Move window between desktops
      j: window("previous-desktop"),
      k: window("next-desktop"),
      // h/l: Go to previous/next desktop
      h: press("left_arrow", ["right_control"]),
      l: press("right_arrow", ["right_control"]),
    },

    // s = [S]ystem
    s: {
      // u/j: Volume
      u: press("volume_increment"),
      j: press("volume_decrement"),
      // i/k: Brightness
      i: press("display_brightness_increment"),
      k: press("display_brightness_decrement"),
      // l: Lock screen
      l: press("q", ["right_control", "right_command"]),
      // e: Emoji picker
      e: press("spacebar", ["right_control", "right_command"]),
      // d: Do not disturb toggle
      d: raycast("extensions/yakitrak/do-not-disturb/toggle"),
    },

    // (a = [A]ccessibility)
    // v = Mo[v]e which isn't "m" because we want it to be on the left hand
    // so that hjkl work like they do in vim
    v: {
      h: press("left_arrow"),
      j: press("down_arrow"),
      k: press("up_arrow"),
      l: press("right_arrow"),

      // Magicmove via homerow.app
      m: press("f", ["right_control"]),
      // Scroll mode via homerow.app
      s: press("j", ["right_control"]),
      d: press("d", ["right_shift", "right_command"]),
      u: press("page_down"),
      i: press("page_up"),
    },

    // c = Musi*c* which isn't "m" because we want it to be on the left hand
    c: {
      p: press("play_or_pause"),
      n: press("fastforward"),
      b: press("rewind"),
    },

    // r = "Raycast"
    r: {
      // a: raycast("extensions/raycast/raycast-ai/ai-chat"),
      a: raycast("extensions/abielzulio/chatgpt/ask"),
      c: raycast("extensions/raycast/system/open-camera"),
      e: raycast("extensions/raycast/emoji-symbols/search-emoji-symbols"),
      h: raycast("extensions/raycast/clipboard-history/clipboard-history"),
      // l: raycast("extensions/stellate/mxstbr-commands/create-mxs-is-shortlink"),
      n: raycast("script-commands/dismiss-notifications"),
      p: raycast("extensions/raycast/raycast/confetti"),
      // s: raycast("extensions/peduarte/silent-mention/index"),
      u: raycast("extensions/mmazzarolo/unicode-symbols/index"),
    },
  }),
];

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

// Special case for the Mac Mini external keyboard: swap [`] and [§] keys
const mac_mini_customizations = createDeviceConfiguration(
  {
    product_id: 671,
    vendor_id: 76
  },
  {
    simple_modifications: [
      key("grave_accent_and_tilde", { key_code: "non_us_backslash" }),
      key("non_us_backslash", { key_code: "grave_accent_and_tilde" }),
    ]
  }
);

const profile = {
  name: "Default",
  selected: true, // this is debatable
  complex_modifications: { rules },
  fn_function_keys,
  devices: [mac_mini_customizations]
};

const config = {
  global: settings,
  profiles: [profile]
};

fs.writeFileSync(
  "build/karabiner.json",
  JSON.stringify(config, sortObjectKeys, 4)
);
