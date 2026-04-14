# Frequently Asked Questions (FAQ)

Common questions about DOT-LD syntax and usage.

## General Questions

### What is DOT-LD?

DOT-LD (DOT Linked Data) is a markdown extension syntax that enables embedding formal knowledge graph structures within technical documentation. It allows authors to create documents that are simultaneously human-readable and machine-processable.

### Why "DOT-LD"?

The name combines:
- **DOT** - Graph description language heritage (like Graphviz DOT)
- **LD** - Linked Data, emphasizing semantic web and knowledge graph concepts

### Who created DOT-LD?

DOT-LD was created by Adam Rendek, Ora Lassila, and Adesoji Adeshina at Amazon Web Services.

### What problem does DOT-LD solve?

Traditional documentation faces a fundamental challenge:
- **Human-readable docs** lack formal structure → Hard to automate
- **Machine-readable formats** (XML, JSON-LD, RDF) → Hard for humans to author

DOT-LD bridges this gap by embedding formal semantic structures within natural language markdown.

## Syntax Questions

### Is DOT-LD compatible with standard markdown?

Yes! DOT-LD documents are valid markdown documents. When rendered by standard markdown processors:
- Configuration blocks appear as plain text (can be hidden with CSS)
- Entity references appear as `[[EntityName]]` in text
- Relationship blocks appear as plain text (can be hidden with CSS)

### Can I use DOT-LD with my existing markdown tools?

Yes. DOT-LD is designed as a progressive enhancement:
- **Basic level**: Works with any markdown processor
- **Enhanced level**: Special tooling extracts knowledge graphs

### Do I need to define all entities in configuration blocks?

No. Entities can be referenced without being defined. This is useful for:
- Forward references (defining entities later)
- External entities (from other documents)
- Progressive documentation (adding definitions over time)

### Can I have multiple configuration blocks?

Yes. Multiple `::config` blocks are allowed in a single document. They merge in order:
- Type definitions: Later definitions override earlier ones
- Entity assignments: Accumulate across blocks

### Are entity names case-sensitive?

Yes. `[[Server]]` and `[[server]]` are different entities. Choose a naming convention and be consistent.

### What shapes are supported?

Five shapes are currently supported:
- `round-rectangle` - Rounded rectangular shape
- `rectangle` - Standard rectangular shape
- `ellipse` - Oval/elliptical shape
- `circle` - Circular shape
- `diamond` - Diamond/rhombus shape

### What color format should I use?

Colors must be hex codes in the format `#RRGGBB`:
- `#2196F3` (blue)
- `#4CAF50` (green)
- `#FF9800` (orange)

### Can I use bidirectional relationships?

Yes. Use `<->` for bidirectional relationships:
```markdown
::rel ServiceA <-> ServiceB [communicates_with] ::
```

## Usage Questions

### When should I use DOT-LD?

Use DOT-LD when:
- Documentation serves both human and machine audiences
- Relationships between entities are important
- You want to generate visualizations
- Cross-document knowledge graphs would be valuable
- Semantic search or querying is desired

### How do I start with DOT-LD?

1. Review the [Basic Example](../examples/01-basic-example.md)
2. Read the [Syntax Specification](syntax-specification.md)
3. Try creating a simple document with 2-3 entities
4. Gradually add complexity as you become comfortable

### Can I use DOT-LD for non-technical documentation?

Yes! While examples focus on technical systems, DOT-LD works for:
- Business processes
- Organizational structures
- Product relationships
- Concept mapping
- Any domain with entities and relationships

### How detailed should my entity definitions be?

Start with key entities and relationships. You can always add detail later. Good rule of thumb:
- Define entities that appear multiple times
- Define relationships that are important for understanding
- Don't over-engineer with excessive granularity

### Should I put all relationships in one place?

No! DOT-LD's innovation is **distributed notation** - place relationships near the content that describes them. This improves:
- Readability
- Maintainability
- Context preservation

## Cross-Document Questions

### Can multiple documents share entities?

Yes. Documents can reference the same entities by name. When processed together, they form a unified knowledge graph.

### Do I need a shared ontology file?

Not required, but helpful for consistency. You can:
- Define types independently in each document
- Use a shared ontology document as a reference
- Maintain consistency through naming conventions

### How do I reference entities from other documents?

Simply use the same entity name:
```markdown
// In document-a.md
PowerPanel: type=equipment

// In document-b.md  
The [[ChillerSystem]] requires power from [[PowerPanel]].
```

## Processing Questions

### What tools can process DOT-LD?

DOT-LD is a new syntax. Tool support is growing. The specification enables:
- Knowledge graph extractors
- Diagram generators
- Validation tools
- Semantic search engines

### Can I validate my DOT-LD syntax?

Validation tools can check:
- Configuration block syntax
- Entity reference format
- Relationship syntax
- Type consistency

### How do I visualize the knowledge graph?

Processing tools can:
- Extract entities and relationships
- Generate graph visualizations (Graphviz, D3.js, etc.)
- Create interactive diagrams
- Export to various formats

### Can I convert DOT-LD to RDF/OWL?

Yes. DOT-LD can be translated to formal ontology formats:
- RDF triples
- OWL ontologies  
- JSON-LD
- Other semantic web formats

## Best Practices

### How should I name entities?

- **Be descriptive**: `PrimaryDatabase` not `DB1`
- **Be consistent**: Choose PascalCase or snake_case and stick with it
- **Be specific**: `UserAuthenticationService` not just `Service`
- **Avoid abbreviations**: Unless universally understood in your domain

### How should I name relationship labels?

- **Use verbs**: `connects_to`, `depends_on`, `manages`
- **Be specific**: `authenticates_via` not `uses`
- **Use lowercase with underscores**: `stores_data_in`
- **Match domain language**: Use terminology familiar to readers

### How do I organize large documents?

- Use multiple configuration blocks logically grouped
- Place relationships near relevant content
- Use headings to structure content
- Consider splitting into multiple documents

### Should I comment my configuration blocks?

Yes! Use `//` comments to:
- Explain design decisions
- Document type hierarchies
- Note capacity or scale
- Clarify ambiguous choices

## Troubleshooting

### My entity references aren't linking

Check:
- Spelling matches exactly (case-sensitive)
- Entity is defined in a config block (if required)
- Brackets are correct: `[[EntityName]]`

### My relationships aren't working

Check:
- Entity names match exactly
- Arrow syntax is correct: `->`, `<-`, or `<->`
- Label is in square brackets: `[label]`
- Line starts with `::rel` and ends with `::`

### My configuration block isn't parsing

Check:
- Opening marker is `::config` on its own line
- Closing marker is `::` on its own line
- Type definitions use format: `type: shape, #color, size`
- Entity assignments use format: `Entity: type=typename`

### How do I hide DOT-LD syntax in rendered markdown?

Use CSS to hide the markup:
```css
code:contains("::config"),
code:contains("::rel") {
    display: none;
}
```

## Contributing

### Can I propose syntax extensions?

DOT-LD is currently in its initial release. Feedback and suggestions are welcome through GitHub issues.

### Can I contribute examples?

Yes! Additional examples help demonstrate DOT-LD's versatility. Contribute via pull requests.

### How is DOT-LD versioned?

This is Version 1.0. Future versions will:
- Maintain backward compatibility where possible
- Mark deprecated features clearly
- Provide migration guidance

## Additional Resources

### Where can I learn more?

- **[Syntax Specification](syntax-specification.md)** - Complete formal reference
- **[Examples](../examples/)** - Practical usage examples
- **[Use Cases](use-cases.md)** - When and how to use DOT-LD
- **[Configuration Blocks](config-blocks.md)** - Entity type definition
- **[Entity References](entity-references.md)** - Entity notation
- **[Relationships](relationships.md)** - Relationship syntax

### How do I report issues or ask questions?

Open an issue on the GitHub repository with:
- Clear description of the issue or question
- Example code if applicable
- Expected vs actual behavior

### Is there a community?

DOT-LD will be presented at the **Knowledge Graph Conference 2026** in New York City. Join the discussion there!

## License

DOT-LD syntax specification is provided under the MIT-0 License, enabling free use, modification, and distribution.

---

**Still have questions?** Open an issue on GitHub or refer to the [complete documentation](syntax-specification.md).
