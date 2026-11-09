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
- Live updates as you edit your document, keeping node positions stable
- Node details: type, properties and connections
- Search, layout switching, path finder and relationship-type filter
- Graph analysis: community detection, centrality and link suggestions
- PNG export

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

**Supported shapes** (spec §3.2): `round-rectangle`, `rectangle`, `ellipse`, `circle`, `diamond`.
Colors use `#RRGGBB` format. Entity assignments can add properties, which appear in the node details:

```markdown
Pump: type=component, vendor=Acme, model="CP 200"
```

Several `::config` blocks in one document are merged in order. Later definitions override earlier ones.

### Entity References

Reference entities inline in your text using double brackets:

```markdown
The [[ChillerSystem]] connects to the [[CoolingTower]].
```

Entity names start with a letter and contain only letters, digits, `_` or `-`.

### Relationships

Define relationships between entities:

```markdown
::rel Source -> Target [label] ::
```

Arrow directions: `->`, `<-` (stored as `Target -> Source`) and `<->` (drawn with arrowheads on both ends). The label is optional.

Example:
```markdown
::rel ChillerSystem -> Pump [uses] ::
::rel Controller -> ChillerSystem [controls] ::
::rel ServiceA <-> ServiceB [communicates_with] ::
```

DOT-LD syntax inside code fences and inline code is treated as example text and is not added to the graph.

## Extension Settings

* `dotld.graphLayout`: Default graph layout algorithm - `cose`, `circle`, `grid`, or `breadthfirst` (default: `cose`)
* `dotld.autoShowGraph`: Automatically show graph visualization when opening DOT-LD files (default: `false`). Declared but not yet read by the extension.

## Security

The graph panel treats document content as untrusted:

- The webview HTML is a fixed template. Graph data is sent to it with `postMessage` and rendered with DOM APIs and `textContent`, so entity names, labels and property values can't inject markup.
- A Content Security Policy (`default-src 'none'`) allows only this extension's own script and style files. Scripts also need a nonce that changes on every load. Inline scripts, inline event handlers, inline styles and network requests are blocked.
- Cytoscape.js is bundled with the extension as a pinned npm dependency instead of being loaded from a CDN. `localResourceRoots` limits the webview to the `media/` folder and the Cytoscape build.
- The parser accepts only valid DOT-LD names, shapes and `#RRGGBB` colors (spec §4.2 and §3.2).

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
2. Run `npm ci`
3. Run `npm run compile`
4. Press F5 to open a new VS Code window with the extension loaded

### Testing

```bash
npm test      # compiles, then runs the parser tests with node:test
npm run lint
npm audit
```

## Requirements

- Visual Studio Code version 1.75.0 or higher

## Known Issues

- Large graphs (>100 nodes) may experience performance issues
- Graph layout may need manual adjustment for complex hierarchies
- The `dotld.autoShowGraph` setting is declared in the manifest but is not yet read by the extension

## Release Notes

### Unreleased

- Markdown files keep their normal `markdown` language mode, so VS Code's built-in Markdown preview works alongside the DOT-LD graph view.
- The graph icon in the editor title bar appears only for Markdown files that contain DOT-LD notation.
- Syntax highlighting is a pure injection into the Markdown grammar, so standard Markdown tokenization is preserved.
- Full DOT-LD v1.0 support: `->`, `<-` and `<->` arrows, hyphenated names, multiple `::config` blocks, entity properties, the `circle` shape, and validation of names, shapes, colors and sizes.
- The graph panel uses a bundled Cytoscape.js, a strict Content Security Policy and DOM-only rendering (see Security).
- The `dotld.graphLayout` setting selects the initial layout.
- Node details show entity properties and connections.
- Parser tests (`npm test`).

### 0.1.0

Initial release:
- Syntax highlighting for DOT-LD notation
- Interactive graph visualization
- Real-time document updates
- Customizable node styles

## About DOT-LD

DOT-LD (DOT Linked Data) is a markdown extension that enables embedding formal knowledge graphs directly within technical documentation. It combines human-readable content with machine-readable semantic structures.

For more information about DOT-LD, see the [specification](../docs/syntax-specification.md).

## Third-party libraries

| Library | Version | License |
|---|---|---|
| [Cytoscape.js](https://js.cytoscape.org/) | 3.34.4 | MIT |

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT-0 License - See LICENSE file for details
