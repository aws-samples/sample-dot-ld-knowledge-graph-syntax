# Entity References

Entity references allow you to mark and link entities within natural language text, creating connections between your prose and formal knowledge graph.

## Overview

Entity references serve to:
- **Mark entities** in natural language documentation
- **Create linkable elements** for knowledge graph extraction
- **Maintain readability** while adding semantic structure
- **Enable validation** of entity usage throughout documents

## Basic Syntax

Reference an entity using double square brackets:

```markdown
[[EntityName]]
```

**Example in text**:
```markdown
The [[ChillerSystem]] provides cooling for the data center. It uses a [[Pump]] to 
circulate chilled water and requires a [[CoolingTower]] for heat rejection.
```

## Naming Rules

### Valid Entity Names

Entity names must follow these rules:

**Starting Character**:
- Must start with a letter (A-Z, a-z)
- Cannot start with numbers or special characters

**Allowed Characters**:
- Letters (A-Z, a-z)
- Numbers (0-9)
- Underscores (_)
- Hyphens (-)

**Case Sensitivity**:
- Entity names are case-sensitive
- `Server` and `server` are different entities
- Be consistent throughout your documentation

### Valid Examples

```markdown
[[Server]]
[[ChillerSystem]]
[[API_Gateway]]
[[user-profile]]
[[WebServer1]]
[[DatabaseCluster_Primary]]
```

### Invalid Examples

```markdown
[[123Server]]         ❌ Cannot start with number
[[Server Name]]       ⚠️  Spaces not recommended (use underscores/hyphens)
[[ Server ]]          ❌ No whitespace padding allowed
[[Server.Name]]       ⚠️  Periods may cause issues in some processors
[[]]                  ❌ Empty entity name
```

## Usage in Natural Text

### Integration Patterns

Entity references should integrate naturally into your prose:

**As Subjects**:
```markdown
The [[WebServer]] handles incoming HTTP requests.
```

**As Objects**:
```markdown
Users connect to the [[WebServer]] to access content.
```

**In Complex Sentences**:
```markdown
When the [[LoadBalancer]] receives a request, it forwards the traffic to an 
available [[WebServer]], which then queries the [[Database]] for content.
```

### Maintaining Natural Flow

✅ **Good Integration**:
```markdown
The [[ChillerSystem]] is the primary cooling equipment in the facility. 
It consists of multiple [[Compressor]] units that work in parallel to 
provide adequate cooling capacity.
```

✅ **Natural Pluralization**:
```markdown
The system has three [[Pump]] units. Each [[Pump]] operates independently.
```

❌ **Awkward Forcing**:
```markdown
The [[Chiller]] [[System]] is the primary cooling [[Equipment]].
// Too many entity references disrupt reading
```

## Undefined Entities

### Forward References

Entities can be referenced before they're defined in configuration blocks:

```markdown
# Introduction

Our system uses a [[NewComponent]] that will be detailed later.

[... more content ...]

::config
component: ellipse, #4CAF50, 80
NewComponent: type=component
::
```

### Intentionally Undefined

You can reference entities without defining them in config blocks:

```markdown
::config
equipment: round-rectangle, #2196F3, 120
ChillerSystem: type=equipment
::

The [[ChillerSystem]] connects to the [[ExternalUtility]].
```

**Behavior**:
- `ChillerSystem` has explicit type (equipment)
- `ExternalUtility` is undefined but still a valid reference
- Processors should handle undefined entities gracefully
- Useful for external systems or progressive documentation

## Multiple References

### Consistency

Reference the same entity consistently throughout:

✅ **Consistent**:
```markdown
The [[WebServer]] handles requests. The [[WebServer]] is load-balanced.
```

❌ **Inconsistent**:
```markdown
The [[WebServer]] handles requests. The [[webserver]] is load-balanced.
// Different casing creates separate entities
```

### Frequency

Use entity references judiciously:

✅ **Balanced**:
```markdown
The [[ChillerSystem]] provides cooling for the data center. It uses a 
[[Pump]] to circulate chilled water. The chiller's efficiency depends 
on ambient conditions.
```

❌ **Overuse**:
```markdown
The [[ChillerSystem]] provides [[Cooling]] for the [[DataCenter]]. The 
[[ChillerSystem]] uses a [[Pump]] to circulate [[ChilledWater]].
// Too many brackets disrupt readability
```

## Best Practices

### Naming Strategy

**Use Clear, Descriptive Names**:
```markdown
✅ [[PrimaryDatabase]]
✅ [[BackupDatabase]]
❌ [[DB1]]
❌ [[DB2]]
```

**Consistent Conventions**:
```markdown
// Choose one style and stick with it
✅ PascalCase: [[WebServer]], [[LoadBalancer]]
✅ snake_case: [[web_server]], [[load_balancer]]
❌ Mixed: [[WebServer]], [[load_balancer]]
```

**Domain-Appropriate Names**:
```markdown
// Infrastructure
[[Server]], [[Router]], [[Switch]]

// Software
[[APIGateway]], [[AuthService]], [[UserDatabase]]

// Equipment
[[ChillerSystem]], [[CoolingTower]], [[Pump]]

// Business
[[OrderProcessor]], [[InventoryManager]], [[ShippingService]]
```

### Contextual Usage

**First Mention**:
```markdown
// Introduce entities clearly on first mention
The [[ChillerSystem]] is the primary cooling equipment in the facility.
```

**Subsequent Mentions**:
```markdown
// Can use pronouns after establishing entity
The [[ChillerSystem]] is located on the roof. It provides 500 tons of cooling.
```

**Critical References**:
```markdown
// Use entity references for formal relationships
::rel ChillerSystem -> CoolingTower [requires] ::
```

## Common Patterns

### System Documentation

```markdown
# Data Center Cooling System

The [[DataCenter]] cooling infrastructure consists of several key components.
The [[ChillerPlant]] houses the [[PrimaryChiller]] and [[BackupChiller]],
both connected to the [[CoolingTowerBank]].

::config
facility: round-rectangle, #2196F3, 120
equipment: round-rectangle, #1976D2, 100

DataCenter: type=facility
ChillerPlant: type=facility
PrimaryChiller: type=equipment
BackupChiller: type=equipment
CoolingTowerBank: type=equipment
::
```

### Software Architecture

```markdown
# Microservices Architecture

The [[APIGateway]] serves as the entry point for all client requests.
It routes traffic to the [[AuthService]] for authentication and the
[[UserService]] for user management. Both services connect to the
[[UserDatabase]] for data persistence.

::config
service: round-rectangle, #2196F3, 110
database: rectangle, #4CAF50, 100

APIGateway: type=service
AuthService: type=service
UserService: type=service
UserDatabase: type=database
::
```

### Process Flow

```markdown
# Order Fulfillment Process

When an [[Order]] is received, the [[OrderProcessor]] validates it
and sends it to the [[InventoryManager]]. If items are available,
the [[ShippingService]] is notified to prepare shipment.

::config
data: rectangle, #2196F3, 100
service: round-rectangle, #4CAF50, 110

Order: type=data
OrderProcessor: type=service
InventoryManager: type=service
ShippingService: type=service
::
```

## Troubleshooting

### Common Issues

**Issue**: Entity shows in text but not in graph
```markdown
// Missing from config block
The [[MysteryComponent]] is important.

// Solution: Add to config
::config
component: ellipse, #4CAF50, 80
MysteryComponent: type=component
::
```

**Issue**: Different entities created unintentionally
```markdown
// Case mismatch
The [[Server]] handles requests from [[server]].

// Solution: Use consistent casing
The [[Server]] handles requests. The [[Server]] responds quickly.
```

**Issue**: Entity name conflicts with markdown syntax
```markdown
// Problematic
[[Server-[Production]]]

// Better
[[Server_Production]]
```

## Integration with Relationships

Entity references work seamlessly with relationship notation:

```markdown
The [[WebServer]] stores session data in the [[Cache]] and persists user 
data to the [[Database]].

::rel WebServer -> Cache [stores_session_in] ::
::rel WebServer -> Database [persists_data_to] ::
```

**Key Points**:
- Entity names in `::rel` blocks must match entity references exactly
- Case-sensitive matching
- Entities can be referenced in text before relationships are defined
- Relationships can reference undefined entities

## Validation

### Check Your Entity References

✅ **Syntax**:
- Proper `[[` and `]]` delimiters
- No spaces around entity name within brackets
- Valid characters in entity name

✅ **Consistency**:
- Same entity spelled identically throughout
- Consistent casing (PascalCase, snake_case, etc.)
- Matches names in relationship blocks

✅ **Semantics**:
- Entity names are meaningful in context
- Important entities are defined in config blocks
- Entity references enhance rather than disrupt readability

## See Also

- [Syntax Specification](syntax-specification.md#4-entity-references) - Complete formal reference
- [Configuration Blocks](config-blocks.md) - How to define entity types
- [Relationships](relationships.md) - How to connect entities
- [Examples](../examples/) - Real-world entity reference patterns
