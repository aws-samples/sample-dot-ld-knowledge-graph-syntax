# Basic DOT-LD Example

This is the simplest possible DOT-LD document, demonstrating all three core syntax elements in a minimal working example.

## Purpose

This example shows how to:
- Define a basic ontology with entity types
- Reference entities in natural language text
- Create relationships between entities

## The Complete Example

```markdown
# Simple Web Application

::config
// Define our entity types with visual styling
system: round-rectangle, #2196F3, 100
database: rectangle, #4CAF50, 90
component: ellipse, #FF9800, 80

// Assign types to our specific entities
WebServer: type=system
UserDatabase: type=database
Cache: type=component
::

## Architecture Overview

Our application uses a [[WebServer]] to handle web requests from users. 
The [[WebServer]] stores user data in a [[UserDatabase]] for persistence
and uses a [[Cache]] to improve response times.

The cache helps reduce database load by storing frequently accessed data
in memory.

## System Relationships

::rel WebServer -> UserDatabase [stores_data_in] ::
::rel WebServer -> Cache [uses] ::
::rel Cache -> UserDatabase [reads_from] ::
```

## What This Creates

### Entities Defined

| Entity | Type | Visual Style |
|--------|------|--------------|
| WebServer | system | Blue round-rectangle (100px) |
| UserDatabase | database | Green rectangle (90px) |
| Cache | component | Orange ellipse (80px) |

### Relationships

1. **WebServer → UserDatabase** with label `stores_data_in`
   - The web server persists data to the database

2. **WebServer → Cache** with label `uses`
   - The web server leverages the cache for performance

3. **Cache → UserDatabase** with label `reads_from`
   - The cache populates its data from the database

### Knowledge Graph

```
    ┌─────────────┐
    │  WebServer  │ (system)
    └──────┬──────┘
           │
      ┌────┴─────┐
      │          │
   [uses]   [stores_data_in]
      │          │
      v          v
  ┌───────┐  ┌──────────────┐
  │ Cache │  │ UserDatabase │
  └───┬───┘  └──────────────┘
      │             ^
      │             │
      └─[reads_from]┘
```

## Key Concepts Demonstrated

### 1. Configuration Block

```markdown
::config
system: round-rectangle, #2196F3, 100
database: rectangle, #4CAF50, 90
component: ellipse, #FF9800, 80

WebServer: type=system
UserDatabase: type=database
Cache: type=component
::
```

**Purpose**: Establish the ontology for the document
- Defines three entity types with visual properties
- Assigns each specific entity to a type
- Uses comments to document the structure

### 2. Entity References

```markdown
The [[WebServer]] stores user data in a [[UserDatabase]]...
```

**Purpose**: Mark entities within natural language
- Integrates naturally into prose
- Creates linkable semantic elements
- Maintains human readability

### 3. Distributed Relationship Notation

```markdown
::rel WebServer -> UserDatabase [stores_data_in] ::
::rel WebServer -> Cache [uses] ::
::rel Cache -> UserDatabase [reads_from] ::
```

**Purpose**: Define semantic connections
- Placed contextually near relevant content
- Uses descriptive labels
- Establishes directed relationships

## Human vs Machine View

### Human Reading Experience

When read as standard markdown, this document:
- Tells a clear story about the web application
- Describes components naturally
- Explains relationships in context
- Remains fully readable without special tools

### Machine Processing

When processed by DOT-LD tools, this document:
- Extracts formal ontology (3 types, 3 entities)
- Identifies entity references in text
- Builds knowledge graph (3 nodes, 3 edges)
- Enables visualization and querying
- Supports semantic validation

## Try It Yourself

### Modify This Example

**Add a New Entity**:
```markdown
::config
// Add to existing types
LoadBalancer: type=component
::

The [[LoadBalancer]] distributes traffic to the [[WebServer]].

::rel LoadBalancer -> WebServer [routes_traffic_to] ::
```

**Add a New Relationship**:
```markdown
::rel UserDatabase -> Cache [notifies] ::
// Cache invalidation on database updates
```

**Change Visual Styling**:
```markdown
::config
// Make database more prominent
database: rectangle, #4CAF50, 120  // Changed from 90 to 120
::
```

## Common Patterns from This Example

### Three-Tier Pattern

This example demonstrates a classic three-tier architecture:
1. **Presentation**: WebServer
2. **Caching**: Cache  
3. **Data**: UserDatabase

### Relationship Types

This example shows three common relationship types:
- **Usage**: `uses` (WebServer uses Cache)
- **Storage**: `stores_data_in` (WebServer stores in Database)
- **Data Flow**: `reads_from` (Cache reads from Database)

## Next Steps

After understanding this basic example:

1. **Review [HVAC System Example](02-hvac-system.md)** - More complex domain
2. **Explore [System Architecture](03-system-architecture.md)** - Software architecture patterns
3. **Read [Configuration Blocks Guide](../docs/config-blocks.md)** - Deep dive into config syntax
4. **Study [Relationship Patterns](../docs/relationships.md)** - Advanced relationship usage

## Validation Checklist

Use this checklist to verify your DOT-LD documents:

- [x] Config block has proper delimiters (`::config` and `::`)
- [x] All entity types are defined before use
- [x] Entity references use proper syntax (`[[EntityName]]`)
- [x] Relationships reference valid entities
- [x] Relationship arrows are correct (`->`, `<-`, `<->`)
- [x] Labels are descriptive and in square brackets
- [x] Document is readable as standard markdown

## Further Reading

- [Syntax Specification](../docs/syntax-specification.md) - Complete formal reference
- [Entity References](../docs/entity-references.md) - Detailed entity syntax guide
- [Use Cases](../docs/use-cases.md) - When to use DOT-LD
