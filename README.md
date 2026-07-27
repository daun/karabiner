# Personal Karabiner Elements Configuration

Forked from [mxstbr/karabiner](https://github.com/mxstbr/karabiner)

- Maintainable and type-safe Karabiner configuration
- Rules generated with `karabiner.ts`
- Customize rules and leader modes in `src/rules.ts`

## Installation

1. Install & start [Karabiner Elements](https://karabiner-elements.pqrs.org/)
2. Clone this repository
3. Run `npm install`
4. Let chezmoi link `build` to `~/.config/karabiner`
5. Build and reload the configuration using `npm run deploy`

<details>
  <summary>Reload Karabiner manually</summary>

```sh
launchctl kickstart -k gui/$(id -u)/org.pqrs.service.agent.karabiner_console_user_server
```

</details>

## Development

Use Node.js 26 (the exact version is in `.node-version`) and npm 12, then install
dependencies.

```sh
npm ci
```

Builds `karabiner.json` from `src/rules.ts`.

```sh
npm run build
```

Watch TypeScript files and rebuild whenever they change.

```sh
npm run watch
```

Reload Karabiner config by restarting the user server.

```sh
npm run reload
```

Build the config and reload the config in a single command.

```sh
npm run deploy
```

### Leader modes

Multi-key commands use one-shot leader modes. Press Caps Lock together with a
leader key, release them, and then press the action key. For example:

- Caps Lock, B, G opens GitHub.
- Caps Lock, O, V opens Visual Studio Code.
- Caps Lock, W, H moves the current window to the left half.

The active leader appears as a Karabiner notification and closes after a
successful action. Press Escape or Caps Lock to cancel it. Direct Hyper
shortcuts such as Caps Lock + H/J/K/L remain immediate chords.

Type-check, run Biome, and rebuild the generated configuration.

```sh
npm run verify
```

## License

[MIT](./LICENSE.md).
