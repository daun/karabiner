# Personal Karabiner Elements Configuration

Forked from [mxstbr/karabiner](https://github.com/mxstbr/karabiner)

- Maintainable and type-safe Karabiner configuration
- Custom configuration DSL & generator
- Customize rules and sublayers in `rules.ts`

## Installation

1. Install & start [Karabiner Elements](https://karabiner-elements.pqrs.org/)
1. Clone this repository
1. Delete the default `~/.config/karabiner` folder
1. Create a symlink with `ln -s ~/personal/karabiner ~/.config` (where `~/personal/karabiner` is your local path to where you cloned the repository)
1. Restart Karabiner console user server with `` launchctl kickstart -k gui/`id -u`/org.pqrs.karabiner.karabiner_console_user_server ``

## Development

Install dependencies.

```sh
yarn install
```

Builds `karabiner.json` from `rules.ts`.

```sh
yarn run build
```

Watch TypeScript files and rebuild whenever they change.

```sh
yarn run watch
```

## License

[MIT](./LICENSE.md).
