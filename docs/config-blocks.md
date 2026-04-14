# Configuration Blocks

Configuration blocks are the foundation of DOT-LD documents, where you define your ontology, entity types, and visual styling.

## Overview

Configuration blocks serve three main purposes:

1. **Define entity types** - Establish categories for your entities
2. **Specify visual styling** - Set shapes, colors, and sizes for visualization
3. **Assign entity types** - Associate specific entities with their types

## Basic Syntax

Configuration blocks are delimited by `::config` and `::`:

```markdown
::config
[configuration content]
::
```

**Rules**:
- Opening marker `::config` must be on its own line
- Closing marker `::` must be on its own line
- Content between markers defines types and entities
- Multiple config blocks can exist in one document

## Type Definitions

### Syntax

Define entity types with visual styling:

```
type_name: shape, color, size
```

### Components

**Type Name**:
- Alphanumeric characters, underscores, hyphens
- Lowercase recommended for consistency
- Examples: `equipment`, `service`, `component`

**Shape**:
- `round-rectangle` - Rounded corners (common for systems)
- `rectangle` - Sharp corners (common for components)
- `ellipse` - Oval shape (common for processes)
- `circle` - Circular (common for end points)
- `diamond` - Diamond shape (common for decisions/control)

**Color**:
- Hex format: `#RRGGBB`
- Use consistent color schemes
- Consider accessibility (sufficient contrast)

**Size**:
- Numeric value (suggested: 60-150)
- Relative sizing for visual hierarchy
- Larger = more prominent in visualizations

### Examples

**Basic Types**:
```markdown
::config
system: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 80
::
```

**Extended Types**:
```markdown
::config
// Infrastructure types
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 80
control: diamond, #FF9800, 90
sensor: circle, #9C27B0, 70

// Software types
service: round-rectangle, #1976D2, 110
database: rectangle, #455A64, 100
cache: ellipse, #00897B, 85
::
```

## Entity Assignments

### Syntax

Assign specific entities to defined types:

```
EntityName: type=type_name
```

With optional properties:
```
EntityName: type=type_name, property=value, property2=value2
```

### Entity Names

**Rules**:
- Must start with a letter
- Can contain: letters, numbers, underscores, hyphens
- Case-sensitive (`Server` ≠ `server`)
- Use PascalCase or snake_case consistently

**Good Names**:
```markdown
ChillerSystem: type=equipment
WebServer: type=service
user_database: type=database
API-Gateway: type=service
```

**Avoid**:
```markdown
123System: type=equipment        // Starts with number
My Server: type=equipment        // Contains space
::
```

### Properties

Additional properties can be assigned:

```markdown
::config
equipment: round-rectangle, #2196F3, 120

ChillerSystem: type=equipment, capacity=500ton, status=active
CoolingTower: type=equipment, capacity=600ton
::
```

## Comments

Use `//` for single-line comments:

```markdown
::config
// Define equipment types
equipment: round-rectangle, #2196F3, 120

// Main chiller system
ChillerSystem: type=equipment

// Backup chiller system
ChillerBackup: type=equipment
::
```

**Best Practices**:
- Document design decisions
- Explain type hierarchies
- Note capacity or scale considerations
- Clarify ambiguous choices

## Multiple Configuration Blocks

### Allowing Multiple Blocks

You can have multiple config blocks in one document:

```markdown
::config
// Core infrastructure
equipment: round-rectangle, #2196F3, 120
ChillerSystem: type=equipment
::

## Introduction

[document content]

::config
// Software components
service: round-rectangle, #1976D2, 110
MonitoringService: type=service
::
```

### Merging Rules

When multiple blocks exist:

1. **Type definitions**: Later definitions override earlier ones
2. **Entity assignments**: Accumulate (all entities are kept)
3. **Conflicts**: Later entity assignments override earlier ones

**Example**:
```markdown
::config
thing: circle, #333333, 80
Item: type=thing
::

::config
thing: rectangle, #666666, 90  // Overrides earlier definition
Item: type=thing, status=updated  // Updates Item
NewItem: type=thing  // Adds new entity
::
```

Result:
- `thing` type: rectangle, #666666, 90 (overridden)
- `Item`: type=thing, status=updated (updated)
- `NewItem`: type=thing (added)

## Complete Example

```markdown
::config
// Equipment type definitions
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 80
control: diamond, #FF9800, 90

// Primary systems
ChillerSystem: type=equipment, capacity=500ton
CoolingTower: type=equipment, capacity=600ton

// Components
Pump: type=component, flow=1000gpm
Valve: type=component

// Control systems
Controller: type=control, model=Siemens-S7
Sensor: type=component, type_detail=temperature
::
```

## Organization Strategies

### By Domain

Organize types by functional domain:

```markdown
::config
// Mechanical systems
mech_equipment: round-rectangle, #2196F3, 120
mech_component: ellipse, #1976D2, 80

// Electrical systems
elec_equipment: round-rectangle, #F44336, 120
elec_component: ellipse, #C62828, 80

// Control systems
control: diamond, #FF9800, 90
::
```

### By Hierarchy

Organize by system hierarchy:

```markdown
::config
// Top-level systems
system: round-rectangle, #2196F3, 120

// Subsystems
subsystem: round-rectangle, #1976D2, 100

// Components
component: ellipse, #4CAF50, 80

// Subcomponents
subcomponent: circle, #66BB6A, 60
::
```

### By Lifecycle

Organize by operational status:

```markdown
::config
// Production
production: round-rectangle, #4CAF50, 110

// Development
development: round-rectangle, #FF9800, 110

// Deprecated
deprecated: rectangle, #757575, 90
::
```

## Best Practices

### Naming Conventions

✅ **DO**:
- Use consistent, descriptive type names
- Use lowercase for type names
- Use PascalCase for entity names
- Document naming conventions in comments

❌ **DON'T**:
- Mix naming styles inconsistently
- Use ambiguous abbreviations
- Create overly granular types

### Visual Design

✅ **DO**:
- Use distinct shapes for different categories
- Maintain color consistency across documents
- Consider colorblind-friendly palettes
- Use size to indicate hierarchy or importance

❌ **DON'T**:
- Use too many different colors
- Make sizes too extreme (< 60 or > 150)
- Rely solely on color for differentiation

### Organization

✅ **DO**:
- Group related definitions together
- Add comments to explain design choices
- Keep config blocks near relevant content
- Use multiple blocks for logical separation

❌ **DON'T**:
- Put all definitions in one massive block
- Mix unrelated types without organization
- Leave complex ontologies undocumented

## Common Patterns

### Three-Tier Architecture

```markdown
::config
// Presentation layer
frontend: round-rectangle, #2196F3, 110

// Business logic layer
backend: round-rectangle, #4CAF50, 110

// Data layer
data: rectangle, #FF9800, 110
::
```

### Equipment Hierarchy

```markdown
::config
// Major equipment
major_equipment: round-rectangle, #2196F3, 120

// Ancillary equipment
ancillary: round-rectangle, #1976D2, 100

// Components
component: ellipse, #4CAF50, 80

// Consumables
consumable: circle, #66BB6A, 60
::
```

### Process Flow

```markdown
::config
// Process steps
process: round-rectangle, #2196F3, 100

// Decision points
decision: diamond, #FF9800, 90

// Data stores
data: rectangle, #4CAF50, 100

// Actors
actor: ellipse, #9C27B0, 85
::
```

## Validation Tips

Check your configuration blocks for:

✅ **Syntax**:
- Opening `::config` and closing `::` on separate lines
- Proper comma separation in type definitions
- Valid hex colors (#RRGGBB format)
- Numeric size values

✅ **Semantics**:
- Entities reference defined types
- Type names are descriptive and consistent
- No duplicate entity definitions (unless intentional override)

✅ **Style**:
- Consistent indentation
- Meaningful comments
- Logical grouping
- Clear organization

## See Also

- [Syntax Specification](syntax-specification.md#3-configuration-blocks) - Complete formal reference
- [Entity References](entity-references.md) - How to use defined entities
- [Use Cases](use-cases.md) - Real-world configuration examples
