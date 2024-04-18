# Personal Karabiner Elements Configuration

Forked from [mxstbr/karabiner](https://github.com/mxstbr/karabiner)

- Maintainable and type-safe Karabiner configuration
- Custom configuration DSL & generator
- Customize rules and sublayers in `rules.ts`

## Installation

1. Install & start [Karabiner Elements](https://karabiner-elements.pqrs.org/)
2. Clone this repository
3. Run `npm install`
4. Delete the default `~/.config/karabiner` folder
5. Create a symlink using `npm run bootstrap` (or use the manual command below)
6. Reload Karabiner config using `npm run reload` (or use the manual command below)

<details>
  <summary>Create symlink manually</summary>

  ```sh
  ln -ns ~/personal/karabiner/build ~/.config
  ```

  Where `~/personal/karabiner` is your local path to where you cloned the repository.

</details>

<details>
  <summary>Reload Karabiner manually</summary>

  ```sh
  launchctl kickstart -k gui/`id -u`/org.pqrs.karabiner.karabiner_console_user_server
  ```

</details>

## Development

Install dependencies.

```sh
npm install
```

Builds `karabiner.json` from `rules.ts`.

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

## License

[MIT](./LICENSE.md).
