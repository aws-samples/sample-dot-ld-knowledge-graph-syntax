# DOT-LD: Markdown Extension for Knowledge Graph Notation

A lightweight markdown extension that enables embedding formal knowledge graph structures within technical documentation. DOT-LD (DOT Linked Data) allows authors to create hybrid documents that are both human-readable and machine-processable.

[![License: MIT-0](https://img.shields.io/badge/License-MIT--0-blue.svg)](LICENSE)

## What is DOT-LD?

DOT-LD transforms traditional technical documentation into hybrid documents containing both human-readable content and machine-readable knowledge graphs. It enables automatic generation of formal ontology-based graph representations from intuitive notation embedded directly in markdown text.

**Key Principle**: You write documentation in natural language, and DOT-LD syntax lets you embed formal semantic structure that both humans and machines can understand.

## Quick Example

```markdown
::config
// Define entity types with visual styling
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 80

// Assign types to entities
ChillerSystem: type=equipment
Pump: type=component
CoolingTower: type=equipment
::

# HVAC System Documentation

The [[ChillerSystem]] is the primary cooling equipment in the facility.
It uses a [[Pump]] to circulate chilled water throughout the building
and requires a [[CoolingTower]] for heat rejection.

::rel ChillerSystem -> Pump [uses] ::
::rel ChillerSystem -> CoolingTower [requires] ::
```

This creates:
- **Human-readable documentation** with clear, natural language
- **Machine-readable knowledge graph** with formal relationships
- **Automatic visualizations** from embedded structural data

## Syntax Elements

DOT-LD consists of three core syntax elements:

### 1. Configuration Blocks (`::config ... ::`)
Define your ontology and entity types:
```markdown
::config
// Type definitions: shape, color, size
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 80

// Entity type assignments
ChillerSystem: type=equipment
Pump: type=component
::
```

### 2. Entity References (`[[EntityName]]`)
Reference entities in natural language:
```markdown
The [[ChillerSystem]] connects to the [[CoolingTower]]...
```

### 3. Relationship Notation (`::rel ... ::`)
Define semantic relationships:
```markdown
::rel ChillerSystem -> CoolingTower [requires] ::
::rel ChillerSystem -> Pump [uses] ::
```

## Key Features

- ✅ **Human-Readable** - Natural language first, structure embedded
- ✅ **Machine-Processable** - Formal syntax enables automated processing
- ✅ **Markdown Compatible** - Works with standard markdown processors
- ✅ **Composable** - Build knowledge graphs across multiple documents
- ✅ **Domain-Agnostic** - Works for any technical documentation
- ✅ **Progressive Enhancement** - Basic markdown functionality preserved

## Use Cases

- **System Architecture** - Document components and dependencies
- **API Documentation** - Service relationships and data flow
- **Technical Specifications** - Equipment and component relationships
- **Process Documentation** - Workflows and procedures
- **Knowledge Management** - Cross-document semantic linking

## Documentation

### Core Reference
- **[Syntax Specification](docs/syntax-specification.md)** - Complete formal reference
- **[Configuration Blocks](docs/config-blocks.md)** - Ontology definition guide
- **[Entity References](docs/entity-references.md)** - Entity notation reference
- **[Relationships](docs/relationships.md)** - Relationship syntax guide

### Additional Resources
- **[Use Cases](docs/use-cases.md)** - Common patterns and applications
- **[FAQ](docs/faq.md)** - Frequently asked questions

## Examples

Explore practical examples in the [`examples/`](examples/) directory:

1. **[Basic Example](examples/01-basic-example.md)** - Simplest DOT-LD document
2. **[HVAC System](examples/02-hvac-system.md)** - Equipment documentation
3. **[System Architecture](examples/03-system-architecture.md)** - Software components
4. **[API Documentation](examples/04-api-documentation.md)** - Service dependencies
5. **[Process Workflow](examples/05-process-workflow.md)** - Business processes
6. **[Cross-Document Composition](examples/06-cross-document/)** - Multi-document graphs

## Getting Started

1. **Write your documentation** in standard markdown
2. **Add a config block** to define your entity types
3. **Reference entities** using `[[EntityName]]` notation
4. **Define relationships** using `::rel Source -> Target [label] ::`
5. **Process with DOT-LD tools** to generate knowledge graphs

See the [Basic Example](examples/01-basic-example.md) for a complete walkthrough.

## Why DOT-LD?

Traditional technical documentation faces a fundamental challenge:

- **Human-readable docs** lack formal structure → Hard to automate
- **Machine-readable formats** (XML, JSON-LD, RDF) → Hard for humans to author

DOT-LD bridges this gap by embedding formal semantic structures within natural language markdown that subject matter experts already know how to write.

### Advantages Over Existing Approaches

| Approach | DOT-LD Advantage |
|----------|------------------|
| **Markdown Extensions** (task lists, tables) | Formal ontology-based graph notation |
| **Graph Languages** (GraphML, DOT, Cytoscape) | Human-readable, embedded in natural text |
| **Documentation Tools** (Notion, Confluence) | Composable cross-document knowledge graphs |
| **RDF/OWL Authoring** (Protégé) | Lightweight syntax accessible to non-experts |

## Conference Presentation

DOT-LD will be presented at the **Knowledge Graph Conference 2026** in New York City.

## Authors

- **Adam Rendek** - Data Center Design Optimization Manager, AWS Data Centers
- **Ora Lassila** - Principal Applied Scientist, AWS
- **Adesoji Adeshina** - Senior Applied Scientist, AWS

## License

This project is licensed under the MIT-0 License - see the [LICENSE](LICENSE) file for details.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute and our code of conduct.

## Questions or Feedback?

- Open an issue on GitHub
- Reference the [FAQ](docs/faq.md) for common questions
- Review the [Syntax Specification](docs/syntax-specification.md) for technical details
