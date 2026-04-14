# DOT-LD Syntax Specification

Complete formal reference for the DOT-LD markdown extension syntax.

**Version**: 1.0  
**Status**: Specification  
**Authors**: Adam Rendek, Ora Lassila, Adesoji Adeshina  
**Date**: March 2026

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overview](#2-overview)
3. [Configuration Blocks](#3-configuration-blocks)
4. [Entity References](#4-entity-references)
5. [Relationship Notation](#5-relationship-notation)
6. [Complete Grammar](#6-complete-grammar)
7. [Cross-Document Composition](#7-cross-document-composition)
8. [Processing Model](#8-processing-model)
9. [Compatibility](#9-compatibility)
10. [Examples](#10-examples)

---

## 1. Introduction

### 1.1 Purpose

This specification defines DOT-LD (DOT Linked Data), a markdown extension syntax that enables embedding formal knowledge graph structures within technical documentation. DOT-LD allows authors to create hybrid documents that are simultaneously human-readable and machine-processable.

### 1.2 Scope

This specification covers:
- The complete DOT-LD syntax grammar
- Semantic interpretation of DOT-LD elements
- Guidelines for implementing DOT-LD processors
- Best practices for authoring DOT-LD documents

This specification does NOT cover:
- Specific implementation algorithms
- Rendering or visualization approaches
- Translation to specific knowledge graph formats (RDF, OWL, etc.)

### 1.3 Notation Conventions

In this specification:
- `code` represents literal syntax elements
- **Bold** indicates important concepts
- *Italic* indicates variable names or placeholders
- Examples are shown in fenced code blocks

---

## 2. Overview

### 2.1 Design Principles

DOT-LD is designed around four core principles:

1. **Human-Readable First** - Natural language content is primary, structure is embedded
2. **Markdown Compatible** - Valid DOT-LD documents are valid markdown documents
3. **Progressive Enhancement** - Documents work without DOT-LD processing
4. **Composable** - Knowledge graphs can be assembled across multiple documents

### 2.2 Syntax Elements

DOT-LD adds three main syntactic elements to markdown:

1. **Configuration Blocks** (`::config ... ::`) - Define entity types and ontologies
2. **Entity References** (`[[EntityName]]`) - Mark entities within natural language text
3. **Relationship Notation** (`::rel ... ::`) - Define semantic relationships

### 2.3 Markdown Compatibility

DOT-LD syntax is designed to be invisible or minimally intrusive when rendered by standard markdown processors:

- Configuration blocks appear as plain text (can be hidden with CSS)
- Entity references render as plain text in double brackets
- Relationship blocks appear as plain text (can be hidden with CSS)

When processed by DOT-LD-aware tools, these elements enable knowledge graph extraction and enhanced functionality.

---

## 3. Configuration Blocks

### 3.1 Syntax

Configuration blocks are delimited by `::config` and `::` markers:

```
::config
[configuration content]
::
```

**Rules**:
- Opening marker: `::config` on its own line
- Closing marker: `::` on its own line
- Content: Between markers, consists of type definitions, entity assignments, and comments
- Whitespace: Leading/trailing whitespace on content lines is ignored
- Multiple blocks: Allowed within a single document (merged in order)

### 3.2 Type Definitions

Type definitions establish entity categories with visual styling:

```
type_name: shape, color, size
```

**Format**:
- **type_name**: Identifier for the entity type (alphanumeric, underscores, hyphens)
- **shape**: Visual shape identifier (see Shape Options below)
- **color**: Hex color code in format `#RRGGBB`
- **size**: Numeric value representing relative size (suggested range: 60-150)

**Shape Options**:
- `round-rectangle` - Rounded rectangular shape
- `rectangle` - Standard rectangular shape
- `ellipse` - Elliptical/oval shape
- `circle` - Circular shape
- `diamond` - Diamond/rhombus shape

**Example**:
```
::config
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 80
control: diamond, #FF9800, 90
::
```

### 3.3 Entity Assignments

Entity assignments associate specific entities with defined types:

```
EntityName: type=type_name
EntityName: type=type_name, property=value
```

**Format**:
- **EntityName**: Identifier for the entity (alphanumeric, can include spaces in some cases)
- **type=type_name**: Required type assignment
- **property=value**: Optional additional properties (comma-separated)

**Naming Rules for Entities**:
- Must start with a letter
- Can contain letters, numbers, underscores, hyphens
- Case-sensitive (ChillerSystem ≠ chillersystem)
- Should be descriptive and domain-appropriate

**Example**:
```
::config
// Type definitions
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 80

// Entity assignments
ChillerSystem: type=equipment
CoolingTower: type=equipment
Pump: type=component
Controller: type=control
::
```

### 3.4 Comments

Single-line comments are supported within configuration blocks:

```
// This is a comment
```

**Rules**:
- Comments start with `//`
- Comments extend to end of line
- Comments are ignored during processing
- Use comments to document ontology design decisions

### 3.5 Multiple Configuration Blocks

Multiple `::config` blocks are allowed within a single document:

```markdown
::config
equipment: round-rectangle, #2196F3, 120
ChillerSystem: type=equipment
::

[document content]

::config
component: ellipse, #4CAF50, 80
Pump: type=component
::
```

**Merging Rules**:
- Blocks are processed in document order
- Type definitions merge (later definitions override earlier ones)
- Entity assignments accumulate
- Conflicts: Later assignments override earlier ones for the same entity

### 3.6 Best Practices

- **Organize by domain**: Group related type definitions together
- **Comment your ontology**: Explain why types are structured as they are
- **Consistent naming**: Use clear, consistent naming conventions
- **Reasonable sizes**: Keep size values in the 60-150 range for visual consistency

---

## 4. Entity References

### 4.1 Syntax

Entity references mark entities within natural language text:

```
[[EntityName]]
```

**Rules**:
- Opening delimiter: `[[`
- Closing delimiter: `]]`
- No spaces between delimiters and entity name
- Entity name must match exactly (case-sensitive)

### 4.2 Naming Rules

Valid entity names:
- Must start with a letter (A-Z, a-z)
- Can contain: letters, numbers, underscores, hyphens
- Case-sensitive
- No leading or trailing whitespace
- Typical examples: `Server`, `ChillerSystem`, `API_Gateway`, `user-profile`

**Valid Examples**:
```markdown
[[Server]]
[[ChillerSystem]]
[[API_Gateway]]
[[user-profile]]
```

**Invalid Examples**:
```markdown
[[123Server]]         // Cannot start with number
[[Server Name]]       // Spaces not recommended (use underscores or hyphens)
[[ Server ]]          // No whitespace padding
```

### 4.3 Usage in Text

Entity references should integrate naturally into prose:

```markdown
The [[ChillerSystem]] provides cooling for the data center. It uses 
a [[Pump]] to circulate chilled water to the [[ComputeFloor]].
```

**Guidelines**:
- Use entities as nouns in sentences
- Maintain natural reading flow
- Reference entities consistently throughout document
- Entities can appear before or after they're defined in config

### 4.4 Undefined Entities

Entities can be referenced even if not explicitly assigned a type in configuration blocks:

```markdown
::config
equipment: round-rectangle, #2196F3, 120
ChillerSystem: type=equipment
::

The [[ChillerSystem]] connects to the [[UndefinedDevice]].
```

**Behavior**:
- Undefined entities are still valid references
- Processing tools should handle them gracefully
- May be assigned a default type or flagged for review
- Useful for progressive documentation development

### 4.5 Best Practices

- **Consistent naming**: Use the same entity name throughout
- **Meaningful names**: Choose descriptive, domain-appropriate names
- **Natural integration**: Don't force entities into unnatural phrasing
- **Define important entities**: At least define types for primary entities

---

## 5. Relationship Notation

### 5.1 Syntax

Relationship blocks define semantic connections between entities:

```
::rel SourceEntity -> TargetEntity [label] ::
```

**Rules**:
- Opening marker: `::rel`
- Closing marker: `::`
- Must be on a single line
- Whitespace around elements is flexible

### 5.2 Directional Arrows

Three arrow types express relationship directionality:

**Directed Forward** (`->`):
```
::rel Source -> Target [label] ::
```
Means: Source has relationship to Target

**Directed Backward** (`<-`):
```
::rel Source <- Target [label] ::
```
Means: Source receives relationship from Target (equivalent to `Target -> Source`)

**Bidirectional** (`<->`):
```
::rel Source <-> Target [label] ::
```
Means: Mutual relationship between Source and Target

### 5.3 Labels

Labels describe the nature of the relationship:

```
::rel ChillerSystem -> CoolingTower [requires] ::
::rel Server -> Database [stores_data_in] ::
::rel ServiceA <-> ServiceB [communicates_with] ::
```

**Label Guidelines**:
- Use square brackets: `[label]`
- Descriptive verbs or verb phrases
- Lowercase with underscores for multi-word labels
- Examples: `uses`, `requires`, `depends_on`, `communicates_with`, `is_part_of`

### 5.4 Placement

One of DOT-LD's key innovations is **distributed relationship notation** - relationships can be defined anywhere in the document where contextually relevant:

```markdown
# System Architecture

The [[Server]] handles web requests and stores data persistently.

::rel Server -> Database [stores_data_in] ::

It also uses a caching layer for performance optimization.

::rel Server -> Cache [uses] ::

The [[Cache]] reads from the [[Database]] to populate entries.

::rel Cache -> Database [reads_from] ::
```

**Philosophy**:
- Place relationships near the content that describes them
- Improves maintainability and comprehension
- Readers understand relationships in context
- Easier to keep documentation and semantics synchronized

### 5.5 Multiple Relationships

Same entities can have multiple relationships:

```markdown
::rel ChillerSystem -> Pump [uses] ::
::rel ChillerSystem -> Pump [monitors] ::
::rel ChillerSystem -> Pump [controls] ::
```

Or different relationships with different entities:

```markdown
::rel Server -> Database [stores_data_in] ::
::rel Server -> Cache [uses] ::
::rel Server -> LoadBalancer [receives_traffic_from] ::
```

### 5.6 Best Practices

- **Contextual placement**: Define relationships near related content
- **Descriptive labels**: Use clear, domain-appropriate relationship names
- **Consistent direction**: Maintain consistent directionality conventions
- **Avoid redundancy**: Don't define the same relationship multiple times
- **Natural clustering**: Group related relationships together when appropriate

---

## 6. Complete Grammar

### 6.1 EBNF Notation

```ebnf
(* DOT-LD Grammar in Extended Backus-Naur Form *)

dotld_document = markdown_content, { dotld_element };

dotld_element = config_block | relationship_block;

config_block = "::config", newline, 
               { config_line }, 
               "::", newline;

config_line = type_definition | entity_assignment | comment | empty_line;

type_definition = identifier, ":", shape, ",", color, ",", size, newline;

entity_assignment = identifier, ":", "type=", identifier, 
                    { ",", property }, newline;

property = identifier, "=", value;

relationship_block = "::rel", entity_ref, arrow, entity_ref, 
                     "[", label, "]", "::", newline;

entity_ref = identifier;

arrow = "->" | "<-" | "<->";

label = identifier | multi_word_label;

comment = "//", text, newline;

(* Basic elements *)
identifier = letter, { letter | digit | "_" | "-" };
shape = "round-rectangle" | "rectangle" | "ellipse" | "circle" | "diamond";
color = "#", hex_digit, hex_digit, hex_digit, hex_digit, hex_digit, hex_digit;
size = digit, { digit };
value = identifier | quoted_string;
letter = "A" | "B" | ... | "Z" | "a" | "b" | ... | "z";
digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
hex_digit = digit | "A" | "B" | "C" | "D" | "E" | "F" | 
            "a" | "b" | "c" | "d" | "e" | "f";
```

### 6.2 Validation Rules

A valid DOT-LD document must satisfy:

1. **Markdown Validity**: Must be valid markdown
2. **Block Delimiters**: All `::config` blocks must have matching `::` closers
3. **Type Before Use**: Referenced types in entity assignments should be defined
4. **Relationship Entities**: Entities in `::rel` blocks can be undefined (forward references allowed)
5. **Color Format**: Colors must be valid hex codes (#RRGGBB)
6. **Arrow Syntax**: Arrows must be one of: `->`, `<-`, `<->`

---

## 7. Cross-Document Composition

### 7.1 Shared Ontologies

Multiple DOT-LD documents can share ontological definitions:

**electrical-systems.md**:
```markdown
::config
equipment: round-rectangle, #2196F3, 120
PowerPanel: type=equipment
Transformer: type=equipment
::

The [[PowerPanel]] distributes power to the [[Transformer]].
::rel PowerPanel -> Transformer [supplies_power_to] ::
```

**mechanical-systems.md**:
```markdown
::config
equipment: round-rectangle, #2196F3, 120
ChillerSystem: type=equipment
::

The [[ChillerSystem]] requires power from the [[PowerPanel]].
::rel ChillerSystem -> PowerPanel [powered_by] ::
```

### 7.2 Entity Resolution

When composing multiple documents:

1. **Type definitions merge**: Consistent type definitions across documents should match
2. **Entities link by name**: `[[PowerPanel]]` in both documents refers to the same entity
3. **Relationships combine**: All relationships from all documents form unified graph

### 7.3 Graph Merging

The complete knowledge graph is assembled by:

1. Collecting all type definitions from all documents
2. Collecting all entity assignments from all documents
3. Collecting all relationships from all documents
4. Resolving entity references by name
5. Building unified graph structure

### 7.4 Best Practices

- **Consistent type definitions**: Use same shapes/colors for shared types
- **Shared ontology document**: Consider a common `ontology.md` that others import conceptually
- **Clear entity names**: Use unambiguous names to avoid entity confusion
- **Document dependencies**: Note which documents should be processed together

---

## 8. Processing Model

### 8.1 Parsing Order

Suggested processing order for DOT-LD documents:

1. **Parse markdown structure**: Identify document structure
2. **Extract configuration blocks**: Collect all `::config` blocks
3. **Build type catalog**: Create registry of defined types
4. **Build entity catalog**: Create registry of assigned entities
5. **Extract entity references**: Find all `[[Entity]]` references
6. **Extract relationships**: Collect all `::rel` blocks
7. **Validate references**: Check entity and type references
8. **Build knowledge graph**: Construct graph from relationships

### 8.2 Entity Catalog

The entity catalog maintains:
- Entity name
- Assigned type (if any)
- Properties (if any)
- Source locations (which config blocks)

### 8.3 Relationship Graph

The relationship graph consists of:
- Nodes: Entities from entity catalog and entity references
- Edges: Relationships from `::rel` blocks
- Edge labels: Relationship labels
- Edge directionality: From arrow types

### 8.4 Validation

Validation should check:
- Configuration block syntax correctness
- Color format validity
- Entity reference syntax
- Relationship syntax
- Undefined type warnings (optional)
- Undefined entity warnings (optional)
- Circular dependency detection (optional)

---

## 9. Compatibility

### 9.1 Markdown Processors

DOT-LD documents rendered by standard markdown processors:

- **Configuration blocks**: Appear as plain text (can be hidden with CSS)
- **Entity references**: Appear as `[[EntityName]]` in text
- **Relationship blocks**: Appear as plain text (can be hidden with CSS)

Example CSS to hide DOT-LD blocks:
```css
code:contains("::config"),
code:contains("::rel") {
    display: none;
}
```

### 9.2 Progressive Enhancement

DOT-LD follows progressive enhancement:

**Basic Level** (standard markdown):
- Document is readable
- Structure is present but not processed
- Content is accessible

**Enhanced Level** (DOT-LD processor):
- Entity references are linked/highlighted
- Knowledge graph is extracted
- Visualizations are generated
- Semantic queries are enabled

### 9.3 Version Compatibility

This specification (Version 1.0) establishes the baseline syntax. Future versions should:
- Maintain backward compatibility with 1.0 syntax
- Add new features as optional extensions
- Clearly mark deprecated features
- Provide migration guidance

---

## 10. Examples

### 10.1 Minimal Example

Simplest valid DOT-LD document:

```markdown
::config
thing: circle, #333333, 80
Item: type=thing
::

This document mentions [[Item]].
```

### 10.2 Complete Example

Full-featured DOT-LD document:

```markdown
# Data Center Cooling System

::config
// Equipment types
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 80
control: diamond, #FF9800, 90

// Entity assignments
ChillerSystem: type=equipment
CoolingTower: type=equipment
Pump: type=component
Controller: type=control
Valve: type=component
::

## System Overview

The [[ChillerSystem]] is the primary cooling equipment in the data center.
It uses a [[Pump]] to circulate chilled water through the building.

::rel ChillerSystem -> Pump [uses] ::

The system requires a [[CoolingTower]] for heat rejection to the atmosphere.

::rel ChillerSystem -> CoolingTower [requires] ::

## Control System

A [[Controller]] monitors and adjusts the [[Valve]] position to regulate flow.

::rel Controller -> Valve [controls] ::
::rel Controller -> ChillerSystem [monitors] ::
```

### 10.3 Cross-Document Example

**document-1.md**:
```markdown
::config
service: round-rectangle, #2196F3, 100
WebServer: type=service
::

The [[WebServer]] serves HTTP requests.
```

**document-2.md**:
```markdown
::config
service: round-rectangle, #2196F3, 100
Database: type=service
::

The [[Database]] is accessed by the [[WebServer]].
::rel WebServer -> Database [queries] ::
```

When composed, both documents contribute to a unified graph with WebServer and Database entities.

---

## Appendix A: Recommended Type Names

Common type naming patterns across domains:

**Software Architecture**:
- `service`, `api`, `database`, `cache`, `queue`, `interface`

**Infrastructure**:
- `server`, `network`, `storage`, `compute`, `security`

**Equipment/Facilities**:
- `equipment`, `component`, `sensor`, `control`, `monitor`

**Business Process**:
- `role`, `task`, `decision`, `document`, `system`

**Abstract/Generic**:
- `entity`, `concept`, `resource`, `actor`, `artifact`

---

## Appendix B: Recommended Relationship Labels

Common relationship patterns:

**Dependencies**:
- `depends_on`, `requires`, `needs`

**Usage**:
- `uses`, `utilizes`, `employs`

**Data Flow**:
- `sends_to`, `receives_from`, `reads_from`, `writes_to`

**Hierarchy**:
- `contains`, `part_of`, `belongs_to`, `child_of`

**Control**:
- `controls`, `manages`, `monitors`, `regulates`

**Communication**:
- `communicates_with`, `connects_to`, `interfaces_with`

---

*This specification is provided under the MIT-0 License.*
