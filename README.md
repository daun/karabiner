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

### Hyper modes

Multi-key commands use held layers. Keep Caps Lock and the mode key pressed
while invoking one or more actions. For example:

- Hold Caps Lock + B, then press G to open GitHub.
- Hold Caps Lock + O, then press V to open Visual Studio Code.
- Hold Caps Lock + W, then press H, L, or F to try several window positions.

The active mode appears as a Karabiner notification and closes when its mode key
is released. Caps Lock can technically be released after the mode activates,
but the mode key must remain held.

The `defaultHyperModeBehavior` setting in `src/rules.ts` can switch all modes to
one-shot `leader` or persistent `sticky` behavior. Individual modes can also
override the default. Direct Hyper shortcuts such as Caps Lock + H/J/K/L remain
immediate chords.

Type-check, run Biome, and rebuild the generated configuration.

```sh
npm run verify
```

## License

[MIT](./LICENSE.md).
