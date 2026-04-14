# Cross-Document Composition Example

This directory demonstrates how DOT-LD enables knowledge graph composition across multiple documents with shared ontologies.

## Overview

In large projects, documentation is often split across multiple files. DOT-LD allows these documents to share entity definitions and create unified knowledge graphs.

## Example Structure

This example consists of three documents:
1. **electrical-systems.md** - Power distribution documentation
2. **mechanical-systems.md** - Cooling system documentation

Each document can be read independently, but together they form a complete knowledge graph of the data center facility.

## Shared Ontology

All documents share common entity types:

```markdown
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 80
```

This consistency allows entities from different documents to be recognized as compatible when graphs are merged.

## Cross-Document References

Documents can reference entities defined in other documents:

**In electrical-systems.md**:
```markdown
PowerPanel: type=equipment
```

**In mechanical-systems.md**:
```markdown
The [[ChillerSystem]] requires power from the [[PowerPanel]].
::rel ChillerSystem -> PowerPanel [powered_by] ::
```

Even though `PowerPanel` is defined in a different document, the reference creates a valid cross-document relationship.

## Knowledge Graph Assembly

When processing multiple DOT-LD documents together:

1. **Type definitions merge** - Shared types use the same visual styling
2. **Entities link by name** - Same entity names across documents refer to the same entity
3. **Relationships combine** - All relationships form a unified graph
4. **Provenance maintained** - Track which document defined each element

## Complete Example

See the individual files in this directory:
- [electrical-systems.md](electrical-systems.md) - Electrical infrastructure
- [mechanical-systems.md](mechanical-systems.md) - Mechanical cooling
- [integrated-view.md](integrated-view.md) - How they interact

## Benefits of Composition

### Modular Documentation
- Each system documented by subject matter experts
- Updates isolated to relevant documents
- Easier to maintain and review

### Unified Understanding
- Complete system view across documents
- Dependency analysis across domains
- Impact assessment for changes

### Scalable Documentation
- Add new documents without modifying existing ones
- Documents can reference entities not yet defined
- Flexible organization as projects grow

## Best Practices

### Consistent Type Definitions
Use the same type definitions across all documents:

✅ **Consistent**:
```markdown
// In all documents
equipment: round-rectangle, #2196F3, 120
```

❌ **Inconsistent**:
```markdown
// Document A
equipment: round-rectangle, #2196F3, 120

// Document B  
equipment: ellipse, #FF9800, 100
```

### Clear Entity Names
Use unambiguous names to avoid entity confusion:

✅ **Clear**:
- `PrimaryChiller` vs `BackupChiller`
- `ElectricalRoom1` vs `ElectricalRoom2`

❌ **Ambiguous**:
- `System1` vs `System2`
- `Equipment` vs `Equipment2`

### Document Dependencies
Note which documents should be processed together:

```markdown
# Related Documents
- [Electrical Systems](electrical-systems.md)
- [Mechanical Systems](mechanical-systems.md)

This document references entities from both electrical and mechanical systems.
```

## See Also

- [Syntax Specification](../../docs/syntax-specification.md#7-cross-document-composition) - Formal composition rules
- [Use Cases](../../docs/use-cases.md) - When to use multi-document approaches
