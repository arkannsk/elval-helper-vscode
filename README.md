# ElVal Helper for VS Code

![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**ElVal Helper** is a Visual Studio Code extension that provides syntax highlighting and autocomplete support for **[ElVal](https://github.com/arkannsk/elval)** validation annotations and **OpenAPI** documentation comments in Go files.

It helps developers read and write validation rules and API documentation directly in code comments, making development faster and more enjoyable.

## ✨ Features

*   🎨 **Smart Syntax Highlighting**: Distinguishes between directives (`@evl:`, `@oa:`), parameters (`required`, `min:`), and values (`uuid`, `100`).
*   ⚡ **IntelliSense Autocomplete**: Suggests available validation parameters and OpenAPI keys as you type `@`.
*   🎛 **Customizable Colors**: Easily adjust highlighting colors to match your theme via a convenient UI or settings.
*   🚀 **Lightweight & Fast**: Written in TypeScript, it runs instantly without performance overhead.

## 📸 Screenshots

![ElVal Helper Demo](./assets/demo.png)

> *Screenshot showing syntax highlighting for `@evl:validate` and `@oa:description` annotations with the default color scheme.*

## 🚀 Installation

### From VSIX File
1.  Download the latest `.vsix` release from the [Releases](https://github.com/arkannsk/elval-helper-vscode/releases) page.
2.  In VS Code, open the Extensions view (`Ctrl+Shift+X`).
3.  Click the `...` menu in the top right corner and select **"Install from VSIX..."**.
4.  Select the downloaded file.

### From Source
1.  Clone the repository:
    ```bash
    git clone https://github.com/arkannsk/elval-helper-vscode.git
    cd elval-helper-vscode
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Compile the project:
    ```bash
    npm run compile
    ```
4.  Press `F5` in VS Code to launch the extension in Debug Mode.

## 🎨 Customizing Colors

The extension uses a pleasant default palette compatible with themes like Dracula or One Dark. However, you can easily customize colors to suit your preference.

### Method 1: Via Command Palette (Recommended)
1.  Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on macOS).
2.  Type: `ElVal: Change Highlighting Colors & Styles`.
3.  Select the element you want to modify (e.g., "Directives" or "Values").
4.  Enter a new HEX color (e.g., `#FF5733`) or choose a style from the list.

### Method 2: Via Settings
1.  Open VS Code Settings (`Ctrl+,`).
2.  Search for `elval.helper`.
3.  Modify the `colors.*` or `styles.*` properties as needed.

### Default Colors

| Element | Example | Color (HEX) | Description |
| :--- | :--- | :--- | :--- |
| **Directives** | `@evl:validate` | `#61AFEF` (Blue) | Start of an annotation |
| **Simple Params** | `required` | `#98C379` (Green) | Boolean flags |
| **KV Params** | `min:` | `#E5C07B` (Yellow) | Parameters with values |
| **Values** | `uuid` | `#56B6C2` (Cyan) | Parameter values |
| **OA Keys** | `@oa:description` | `#E06C75` (Red) | OpenAPI keys |
| **Locations** | `query` | `#61AFEF` (Blue) | HTTP parameter locations |
| **Param Names** | `page` | `#ABB2BF` (White) | Variable names after `@oa:in` |

## 📝 Supported Annotations

### ElVal Validation
*   `@evl:validate`: Supports `required`, `email`, `uuid`, `min:10`, `max:100`, `pattern:regex`, and more.
*   `@evl:decor`: Supports `uuid-gen`, `time-now`.

### OpenAPI Documentation
*   `@oa:in`: Supports `query`, `header`, `path`, `cookie`.
*   `@oa:description`: Field description text.
*   `@oa:format`: Supports `uuid`, `date-time`, `email`, etc.
*   `@oa:title`, `@oa:example`, `@oa:minimum`, `@oa:maximum`, and other specification keys.

## 🛠 Development

This project is written in **TypeScript** using the **VS Code Extension API**.

Project Structure:
```text
src/
├── extension.ts          # Entry point
├── completionProvider.ts # Autocomplete logic
├── decorators.ts         # Color and style management
├── utils.ts              # Parsing helper functions
└── handlers/
    ├── evlHandler.ts     # ElVal annotation parser
    └── oaHandler.ts      # OpenAPI annotation parser
```

To build the package:
```bash
npm run compile
vsce package --allow-missing-repository
```

---
