# Getting Started with DOT-LD VS Code Extension

This guide will help you get started with the DOT-LD extension for Visual Studio Code.

## Installation

### Option 1: Install from Source (Development)

1. Clone or download this repository
2. Open the folder in VS Code
3. Open the terminal (`` Ctrl+` ``) and run:
   ```bash
   npm install
   npm run compile
   ```
4. Press `F5` to launch a new VS Code window with the extension loaded

### Option 2: Install from VSIX (Production)

1. Package the extension:
   ```bash
   npm install -g @vscode/vsce
   vsce package
   ```
2. Install the generated `.vsix` file:
   - Open VS Code
   - Go to Extensions view (`Ctrl+Shift+X`)
   - Click "..." menu → "Install from VSIX..."
   - Select the `.vsix` file

## Quick Start

### 1. Create a DOT-LD Markdown File

Create a new file with `.md` extension and add DOT-LD notation:

```markdown
::config
// Define entity types with visual styling
service: round-rectangle, #2196F3, 120
database: ellipse, #4CAF50, 100

// Define entities
API: type=service
Database: type=database
::

# My System

The [[API]] connects to the [[Database]].

::rel API -> Database [queries] ::
```

### 2. View Syntax Highlighting

The editor will automatically highlight:
- 🔴 Configuration blocks (`::config` ... `::`)
- 🔵 Entity references (`[[EntityName]]`)
- 🟢 Relationships (`::rel ... ::`)
- 🟡 Entity type definitions
- 💭 Comments (`//`)

### 3. Open Graph Visualization

Click the graph icon (📊) in the editor title bar, or:
- Open Command Palette (`Ctrl+Shift+P`)
- Type "DOT-LD: Show Graph"
- Press Enter

The graph will appear in a side panel showing your entities and relationships.

### 4. Interact with the Graph

- **Click and drag** nodes to rearrange them
- **Fit** button - Fit all nodes in view
- **Re-layout** button - Recalculate node positions
- **Reset Zoom** button - Reset zoom level to 100%

The graph updates automatically as you edit your document!

## Example Files

Check out the example files in the `examples/` folder:
- [`hvac-system.md`](examples/hvac-system.md) - HVAC chiller system documentation
- [`microservices.md`](examples/microservices.md) - Microservices architecture

## DOT-LD Syntax Cheat Sheet

### Configuration Block
```markdown
::config
// Style: type: shape, color, size
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 100

// Entity type assignment
ChillerSystem: type=equipment
Pump: type=component
::
```

### Entity References
```markdown
The [[ChillerSystem]] uses the [[Pump]].
```

### Relationships
```markdown
::rel ChillerSystem -> Pump [uses] ::
::rel Controller -> ChillerSystem [controls] ::
```

## Supported Node Shapes

- `round-rectangle` - Rounded rectangular boxes
- `ellipse` - Ovals/circles
- `diamond` - Diamond shapes
- `hexagon` - Six-sided polygons
- `rectangle` - Standard rectangles
- `triangle` - Triangular nodes

## Tips and Tricks

### 1. Use Meaningful Type Names
```markdown
::config
system: round-rectangle, #2196F3, 130
subsystem: ellipse, #4CAF50, 100
component: hexagon, #FF9800, 90
::
```

### 2. Add Descriptive Relationship Labels
```markdown
::rel API -> Database [queries for user data] ::
::rel Cache -> Database [synchronizes with] ::
```

### 3. Use Tables for Specifications
```markdown
| Component | Type | Capacity |
|-----------|------|----------|
| [[Server]] | Hardware | 500GB |
| [[Storage]] | Hardware | 10TB |
```

### 4. Organize with Headings
Use markdown headings to structure your document. The graph notation can be distributed throughout sections where it makes the most sense contextually.

### 5. Keep Graphs Manageable
For large systems, create separate markdown files for different subsystems and link them together in your documentation.

## Troubleshooting

### Graph Not Showing
- Ensure your file contains `::config` blocks or `::rel` statements
- Check that entity types are defined before they're referenced
- Try clicking "Refresh Graph" button

### Syntax Highlighting Not Working
- Verify the file has `.md` extension
- Check that DOT-LD notation is correctly formatted
- Restart VS Code if needed

### TypeScript Compilation Errors
During development, if you see errors:
```bash
npm install
npm run compile
```

## Next Steps

- Explore the example files in `examples/`
- Read the full [README.md](README.md) for detailed documentation

## Feedback & Support

Found a bug or have a feature request? Please open an issue on the project repository.

Happy documenting! 🚀
