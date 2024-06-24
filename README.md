# Beve Plugin

Beve - JSON Converter and Viewer for Visual Studio Code

This plugin allows you to easily view and edit `.beve` files by converting them to JSON format. It also allows you to save data in JSON format by converting it back to `.beve` format.

## Features

* **Automatic JSON Preview:** When you open `.beve` files, it automatically previews them in JSON format.
* **JSON Editing:** You can modify and save the JSON preview.
* **Convert Back to `.beve:`** You can easily convert the JSON you edited to.beve` format.
* Right Click Menu Integration:** You can perform conversion operations by right clicking in the file explorer or editor.
* **Command Palette Support:** You can also use conversion commands via the command palette.

## Requirements

* Visual Studio Code (1.90 or above)

## Installation

1. In VS Code, go to the extensions tab.
2. Search for "Beve" and install the plugin.



## Usage* **Automatic Preview:** When you open a `.beve` file, it is automatically previewed in JSON format.
**Manual Conversion:**
    **Beve to JSON:**  Right click on the `.beve` file and select "Convert Beve File to JSON". Or open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and run the "Convert Beve to JSON" command.
    **JSON to Beve:** Right click on the `.json` file and select "Convert JSON to Beve". Or open the command palette and run the command "Convert JSON File to Beve".

## Known Issues

* Very large `.beve` files may take some time to convert.* In some special cases, data in `.beve` format may not be fully converted to JSON.
## Contributing
Pull requests are accepted. Please open an issue to discuss what you want to do before making major changes.## License

MIT