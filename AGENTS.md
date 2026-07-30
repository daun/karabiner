# Agent notes

## Commands

| Task | Command |
| --- | --- |
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
  direct Hyper shortcuts, fn keys, per-device modifications. Answer "which key
  does X?" by grepping this file.
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
