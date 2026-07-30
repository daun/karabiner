# Agent notes

Personal [Karabiner Elements](https://karabiner-elements.pqrs.org/) keyboard
configuration for macOS. TypeScript in `src/` is compiled by `karabiner.ts` into
`build/karabiner.json`, which Karabiner reads live from `~/.config/karabiner`.
Caps Lock acts as a Hyper key (⌃⌥⇧⌘); most bindings hang off it, either as
direct chords or as held "hyper modes". See `README.md` for the user-facing
version.

## Commands

| Task | Command |
| --- | --- |
| Print every binding as a table | `npm run keymap` |
| Build `build/karabiner.json` from source | `npm run build` |
| Type-check, lint, and build | `npm run verify` |
| Autofix formatting and lint | `npm run check:fix` |
| Build and reload Karabiner | `npm run deploy` |
| Reload Karabiner only | `npm run reload` |

After editing anything in `src/`, run `npm run check:fix` **before**
`npm run verify`. Biome enforces 80-column wrapping and 2-space indent that is
not worth matching by hand, and `verify` is `typecheck && check && build`, so a
formatting error also skips the build.

## Layout

- `src/rules.ts` — single source of truth for every binding: hyper modes,
  direct Hyper shortcuts, fn keys, per-device modifications. Exports `config`.
  Edit bindings here.
- `src/build.ts` — build entry point; writes `build/karabiner.json`.
- `src/keymap.ts` — renders `config` as a table. Run `npm run keymap` to answer
  "which key does X?" in one call: `npm run keymap | grep -i chrome` prints the
  full key sequence. Prefer this over reading `src/rules.ts` end to end.
- `src/utils.ts` — action helpers (`app`, `open`, `raycast`, `window`, `press`)
  and the `disabled` / `enabled` filtering used to switch bindings off.
- `build/karabiner.json` — generated output. Never edit, never grep. It is
  symlinked to `~/.config/karabiner` by chezmoi, so a build is live after
  `npm run reload`.
- `build/automatic_backups/` — stale Karabiner snapshots. Ignore.
- `node_modules/karabiner.ts/dist/index.d.ts` — all karabiner.ts types in one
  bundled declaration file. Grep it instead of searching for online docs.

Search scope for code questions is `src/`. Everything else in this repo is
either generated or vendored.

## Conventions

- Disable a rule, mode, or binding with `disabled(...)` rather than commenting
  it out. See README § Disabling rules.
- Rule order matters: earlier rules in `ruleBuilders` win. A direct Hyper
  shortcut on the same key as a hyper mode shadows that mode.
- Review `git diff src/`. `build/karabiner.json` is regenerated on every build
  and is frequently dirty for unrelated reasons.
