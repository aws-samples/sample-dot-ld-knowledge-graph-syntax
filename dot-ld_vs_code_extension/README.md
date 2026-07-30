# DOT-LD VS Code Extension

A Visual Studio Code extension that provides syntax highlighting and interactive graph visualization for DOT-LD (DOT Linked Data) markdown files.

## Features

### 🎨 Syntax Highlighting

Full syntax highlighting support for DOT-LD notation:

- **Configuration blocks** (`::config` ... `::`)
- **Entity type definitions** with colors and shapes
- **Entity references** (`[[EntityName]]`)
- **Relationship definitions** (`::rel Source -> Target [label] ::`)
- **Comments** (`//`)

### 📊 Interactive Graph Visualization

- Real-time graph visualization using Cytoscape.js
- Automatic layout with customizable node styles
- Live updates as you edit your document
- Interactive graph controls (fit, re-layout, zoom)

## Usage

### Writing DOT-LD Documents

Create a markdown file with DOT-LD notation:

```markdown
::config
// Style definitions: type: shape, color, size
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 100
control: diamond, #FF9800, 110

// Entity definitions
ChillerSystem: type=equipment
Pump: type=component
Controller: type=control
::

## System Overview

The [[ChillerSystem]] uses a [[Pump]] and is managed by a [[Controller]].

::rel ChillerSystem -> Pump [requires] ::
::rel Controller -> ChillerSystem [controls] ::
```

### View Graph Visualization

1. Open a markdown file with DOT-LD notation
2. Click the graph icon in the editor title bar, or
3. Run command: **DOT-LD: Graph View**

The graph will appear in a side panel and update automatically as you edit.

### Works Alongside the Built-in Markdown Preview

This extension does **not** take over the `.md` file association. Your Markdown
files keep the `markdown` language mode, so VS Code's built-in Markdown preview
button and all other Markdown tooling continue to work as normal.

The DOT-LD graph icon only appears for Markdown files that actually contain
DOT-LD notation (a `::config` block or a `::rel` statement), and it sits to the
right of the built-in preview icons. Plain Markdown files show only the standard
preview button.

Syntax highlighting is applied as an *injection* on top of the standard Markdown
grammar, so headings, code fences, and emphasis all still highlight correctly.

## DOT-LD Syntax Reference

### Configuration Block

Define entity types and their visual styles:

```markdown
::config
// type: shape, color, size
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 100

// Entity type assignments
ChillerSystem: type=equipment
Pump: type=component
::
```

**Supported shapes:**
- `round-rectangle`
- `ellipse`
- `diamond`
- `hexagon`
- `rectangle`
- `triangle`

### Entity References

Reference entities inline in your text using double brackets:

```markdown
The [[ChillerSystem]] connects to the [[CoolingTower]].
```

### Relationships

Define relationships between entities:

```markdown
::rel Source -> Target [label] ::
```

Example:
```markdown
::rel ChillerSystem -> Pump [uses] ::
::rel Controller -> ChillerSystem [controls] ::
```

## Extension Settings

This extension declares the following settings:

* `dotld.autoShowGraph`: Automatically show graph visualization when opening DOT-LD files (default: `false`)
* `dotld.graphLayout`: Default graph layout algorithm - `cose`, `circle`, `grid`, or `breadthfirst` (default: `cose`)

> **Note:** These settings are declared but not yet read by the extension, so
> changing them currently has no effect. Wiring them up is tracked as a known
> issue below.

## Commands

* `DOT-LD: Graph View` - Open the graph visualization panel
* `DOT-LD: Refresh Graph` - Refresh the current graph visualization

## Installation

### From VSIX (if packaged)

1. Download the `.vsix` file
2. Open VS Code
3. Go to Extensions view
4. Click "..." menu → Install from VSIX
5. Select the downloaded file

### From Source

1. Clone this repository
2. Run `npm install`
3. Run `npm run compile`
4. Press F5 to open a new VS Code window with the extension loaded

## Requirements

- Visual Studio Code version 1.75.0 or higher

## Known Issues

- Large graphs (>100 nodes) may experience performance issues
- Graph layout may need manual adjustment for complex hierarchies
- The `dotld.autoShowGraph` and `dotld.graphLayout` settings are declared in the
  manifest but are not yet consumed by the extension code

## Release Notes

### Unreleased

- Fixed: the extension no longer registers its own language for `.md`, which was
  overriding the `markdown` language mode and hiding VS Code's built-in Markdown
  preview button. Markdown files now keep their normal language mode and the
  built-in preview works alongside the DOT-LD graph view.
- The graph icon in the editor title bar is now only shown for Markdown files
  that actually contain DOT-LD notation.
- Syntax highlighting is now a pure injection into the Markdown grammar, so
  standard Markdown tokenization is preserved.
- Added the missing `tsconfig.json` required by `npm run compile`.

### 0.1.0

Initial release:
- Syntax highlighting for DOT-LD notation
- Interactive graph visualization
- Real-time document updates
- Customizable node styles

## About DOT-LD

DOT-LD (DOT Linked Data) is a markdown extension that enables embedding formal knowledge graphs directly within technical documentation. It combines human-readable content with machine-readable semantic structures.

For more information about DOT-LD, see the specification document.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT-0 License - See LICENSE file for details
