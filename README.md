# BEVE VS Code Extension

The BEVE extension allows you to easily view and edit `.beve` files by converting them to JSON format. It also allows you to save data in JSON format by converting it back to `.beve` format. All conversions use the official Rust [**beve**](https://crates.io/crates/beve) crate.

## Features

- Automatic JSON preview when opening `.beve` files.
- Bi-directional conversion commands for `.beve` ⇄ `.json`.
- Context menu actions in the editor and Explorer for quick conversions.
- Command Palette entries (`Ctrl+Shift+P` / `Cmd+Shift+P`) for all conversion actions.
- WebAssembly-powered conversions for reliable numeric, string, matrix, and typed-array support.
- Built-in localization (English by default, with Turkish available and room for more locales).

## Requirements

- Visual Studio Code 1.90 or newer

## Usage

- **Automatic preview:** Open a `.beve` file to view its JSON representation instantly.
- **BEVE → JSON:** Right-click a `.beve` file and choose “Convert BEVE to JSON”, or run the `BEVE: Convert BEVE to JSON` command from the Command Palette.
- **JSON → BEVE:** Right-click a `.json` file and choose “Convert JSON to BEVE”, or run the `BEVE: Convert JSON to BEVE` command.
- **In-place editing:** Edit the JSON output; saving the preview will persist changes back to the `.beve` source when you trigger the conversion command.

## Localization

Localization automatically follows your VS Code display language. English (`en`) is the default, with Turkish (`tr`) translations available today. To try another language, change the Display Language in VS Code (`Preferences: Configure Display Language`), and the extension will fall back to English when a translation is not yet provided. Contributions for additional languages are welcome.

## Development

```bash
npm install
npm test
```

The test suite builds the Rust WebAssembly package, compiles the TypeScript sources, and exercises the extension commands end to end.

## Caveats

- Very large `.beve` files may take a while to convert.

## Contributing

Pull requests are welcome. Please open an issue beforehand for major changes or new features so we can discuss the approach.

## License

MIT
