# Relationships

Relationship notation is the key innovation in DOT-LD that allows you to define semantic connections between entities contextually throughout your documentation.

## Overview

Relationships in DOT-LD:
- **Define connections** between entities
- **Express semantics** through labeled relationships
- **Maintain context** by placing definitions where relevant
- **Build knowledge graphs** automatically from distributed notation

## Basic Syntax

Define a relationship using `::rel` blocks:

```markdown
::rel SourceEntity -> TargetEntity [label] ::
```

**Components**:
- `::rel` - Opening marker
- `SourceEntity` - The source entity name
- `->` - Directional arrow (relationship direction)
- `TargetEntity` - The target entity name
- `[label]` - Relationship label in square brackets
- `::` - Closing marker

**Example**:
```markdown
::rel ChillerSystem -> Pump [uses] ::
::rel ChillerSystem -> CoolingTower [requires] ::
```

## Directional Arrows

DOT-LD supports three types of directional relationships:

### Forward Direction (`->`)

Indicates a relationship from source to target:

```markdown
::rel Server -> Database [stores_data_in] ::
```

**Meaning**: Server has a "stores_data_in" relationship with Database

**Use when**: The relationship naturally flows from left to right

### Backward Direction (`<-`)

Indicates a relationship from target to source:

```markdown
::rel Server <- LoadBalancer [receives_traffic_from] ::
```

**Equivalent to**: `::rel LoadBalancer -> Server [receives_traffic_from] ::`

**Use when**: The relationship reads more naturally right to left

### Bidirectional (`<->`)

Indicates a mutual relationship:

```markdown
::rel ServiceA <-> ServiceB [communicates_with] ::
```

**Meaning**: ServiceA and ServiceB have a mutual "communicates_with" relationship

**Use when**: The relationship is truly symmetric

## Relationship Labels

### Syntax

Labels are enclosed in square brackets and describe the nature of the relationship:

```markdown
[label_name]
```

### Naming Conventions

**Use Verbs or Verb Phrases**:
```markdown
✅ [uses]
✅ [requires]
✅ [depends_on]
✅ [communicates_with]
✅ [stores_data_in]
```

**Lowercase with Underscores**:
```markdown
✅ [sends_data_to]
✅ [is_part_of]
✅ [managed_by]
❌ [SendsDataTo]
❌ [sends-data-to]
```

**Descriptive and Specific**:
```markdown
✅ [stores_data_in]      // Clear what is stored
✅ [monitors]            // Clear action
❌ [has]                 // Too vague
❌ [relates_to]          // Not specific enough
```

### Common Label Patterns

**Dependencies**:
```markdown
[depends_on]
[requires]
[needs]
[relies_on]
```

**Usage**:
```markdown
[uses]
[utilizes]
[employs]
[leverages]
```

**Data Flow**:
```markdown
[sends_to]
[receives_from]
[reads_from]
[writes_to]
[stores_data_in]
[queries]
```

**Hierarchy**:
```markdown
[contains]
[part_of]
[belongs_to]
[child_of]
[parent_of]
[composed_of]
```

**Control**:
```markdown
[controls]
[manages]
[monitors]
[regulates]
[supervises]
```

**Communication**:
```markdown
[communicates_with]
[connects_to]
[interfaces_with]
[calls]
[invokes]
```

## Distributed Notation

### The Key Innovation

Unlike traditional graph languages that require centralized relationship definitions, DOT-LD allows you to place relationships **where they are contextually relevant**:

```markdown
# System Architecture

## Web Tier

The [[WebServer]] handles incoming HTTP requests from clients.

::rel WebServer -> LoadBalancer [receives_traffic_from] ::

It processes requests and stores session data in the [[SessionCache]].

::rel WebServer -> SessionCache [stores_session_in] ::

## Data Tier

For persistent storage, the [[WebServer]] queries the [[Database]].

::rel WebServer -> Database [queries] ::

The [[Database]] is replicated to the [[BackupDatabase]] for redundancy.

::rel Database -> BackupDatabase [replicates_to] ::
```

### Benefits of Distribution

**Improved Maintainability**:
- Relationships defined near describing content
- Updates to content and relationships happen together
- Easier to spot missing or incorrect relationships

**Enhanced Comprehension**:
- Readers understand relationships in context
- No need to cross-reference separate graph definitions
- Relationships reinforce the narrative

**Better Organization**:
- Relationships naturally grouped by topic/section
- Document structure mirrors relationship organization
- Easier to navigate large documents

## Placement Guidelines

### Where to Place Relationships

✅ **Near Description**:
```markdown
The [[ChillerSystem]] uses a [[Pump]] to circulate chilled water.

::rel ChillerSystem -> Pump [uses] ::
```

✅ **After Introduction**:
```markdown
## Cooling Tower

The [[CoolingTower]] is responsible for heat rejection. It receives hot 
water from the [[ChillerSystem]].

::rel CoolingTower -> ChillerSystem [receives_hot_water_from] ::
```

✅ **In Relevant Sections**:
```markdown
## Dependencies

The [[APIService]] depends on several infrastructure components:
- Authentication via [[AuthService]]
- Data storage in [[UserDatabase]]

::rel APIService -> AuthService [authenticates_via] ::
::rel APIService -> UserDatabase [stores_data_in] ::
```

❌ **Random Placement**:
```markdown
# Introduction

::rel ComponentA -> ComponentB [uses] ::

[document doesn't mention ComponentA or ComponentB anywhere nearby]
```

### Grouping Relationships

**Logical Clusters**:
```markdown
# Data Flow

The [[WebServer]] interacts with multiple backend services:

::rel WebServer -> AuthService [authenticates_with] ::
::rel WebServer -> UserService [queries_user_data_from] ::
::rel WebServer -> OrderService [submits_orders_to] ::
```

**By Topic**:
```markdown
# Cooling System Relationships

Primary cooling flow:
::rel ChillerSystem -> Pump [uses] ::
::rel Pump -> HeatExchanger [circulates_through] ::

Heat rejection:
::rel ChillerSystem -> CoolingTower [rejects_heat_to] ::
```

## Multiple Relationships

### Same Entities, Different Relationships

Entities can have multiple types of relationships:

```markdown
::rel Server -> Database [reads_from] ::
::rel Server -> Database [writes_to] ::
::rel Server -> Database [monitors] ::
```

**Or equivalently**:
```markdown
The [[Server]] interacts with the [[Database]] in several ways:
- Reads query results
- Writes transaction data  
- Monitors connection health

::rel Server -> Database [reads_from] ::
::rel Server -> Database [writes_to] ::
::rel Server -> Database [monitors] ::
```

### Different Entities, Same Relationship

```markdown
The [[LoadBalancer]] distributes traffic across multiple servers:

::rel LoadBalancer -> WebServer1 [routes_traffic_to] ::
::rel LoadBalancer -> WebServer2 [routes_traffic_to] ::
::rel LoadBalancer -> WebServer3 [routes_traffic_to] ::
```

## Best Practices

### Consistency

**Choose Direction Convention**:
```markdown
// Decide on a direction pattern and stick to it

// Option 1: Consumer -> Provider
::rel Server -> Database [queries] ::
::rel Client -> Server [requests_from] ::

// Option 2: Provider -> Consumer  
::rel Database <- Server [queries] ::
::rel Server <- Client [requests_from] ::

// Stay consistent throughout your documentation
```

**Use Consistent Labels**:
```markdown
✅ Consistent:
::rel ServerA -> DatabaseA [queries] ::
::rel ServerB -> DatabaseB [queries] ::

❌ Inconsistent:
::rel ServerA -> DatabaseA [queries] ::
::rel ServerB -> DatabaseB [accesses] ::
// Same relationship, different labels
```

### Avoid Redundancy

**Don't Repeat**:
```markdown
❌ Redundant:
::rel Server -> Database [queries] ::
::rel Server -> Database [queries] ::  // Duplicate

✅ Clean:
::rel Server -> Database [queries] ::
```

**But Different Labels are OK**:
```markdown
✅ Different relationships:
::rel Server -> Database [reads_from] ::
::rel Server -> Database [writes_to] ::  // Different relationship type
```

### Meaningful Labels

**Be Specific**:
```markdown
✅ Specific:
::rel WebServer -> UserDatabase [authenticates_users_against] ::
::rel WebServer -> SessionCache [stores_session_data_in] ::

❌ Vague:
::rel WebServer -> UserDatabase [uses] ::
::rel WebServer -> SessionCache [has] ::
```

**Match Domain Language**:
```markdown
// Infrastructure domain
::rel ChillerSystem -> CoolingTower [rejects_heat_to] ::

// Software domain  
::rel APIGateway -> AuthService [validates_tokens_with] ::

// Business domain
::rel OrderProcessor -> InventoryManager [checks_availability_with] ::
```

## Complete Examples

### System Architecture

```markdown
# E-commerce Architecture

::config
service: round-rectangle, #2196F3, 110
database: rectangle, #4CAF50, 100
cache: ellipse, #FF9800, 85

APIGateway: type=service
AuthService: type=service
ProductService: type=service
OrderService: type=service
ProductDB: type=database
OrderDB: type=database
RedisCache: type=cache
::

## Request Flow

Client requests first hit the [[APIGateway]], which handles routing
and rate limiting.

::rel APIGateway -> AuthService [validates_tokens_with] ::

For product queries, the gateway forwards to [[ProductService]]:

::rel APIGateway -> ProductService [routes_product_requests_to] ::

The [[ProductService]] checks the [[RedisCache]] first:

::rel ProductService -> RedisCache [checks_cache] ::

If not cached, it queries the [[ProductDB]]:

::rel ProductService -> ProductDB [queries] ::

## Order Processing

Order submissions go to the [[OrderService]]:

::rel APIGateway -> OrderService [routes_orders_to] ::
::rel OrderService -> OrderDB [persists_orders_to] ::
::rel OrderService -> ProductService [validates_inventory_with] ::
```

### HVAC System

```markdown
# Cooling System Documentation

::config
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 80
control: diamond, #FF9800, 90

ChillerSystem: type=equipment
CoolingTower: type=equipment
Pump: type=component
Valve: type=component
Controller: type=control
::

## Primary Cooling Loop

The [[ChillerSystem]] is the heart of the cooling system. It generates
chilled water that is circulated by the [[Pump]].

::rel ChillerSystem -> Pump [circulates_water_via] ::

The chilled water flows through the building, absorbing heat, and returns
to the [[ChillerSystem]] for cooling.

## Heat Rejection

Heat absorbed by the chiller must be rejected to the atmosphere via the
[[CoolingTower]].

::rel ChillerSystem -> CoolingTower [rejects_heat_to] ::

## Control System

The [[Controller]] monitors system parameters and adjusts the [[Valve]]
to maintain optimal performance.

::rel Controller -> Valve [modulates] ::
::rel Controller -> ChillerSystem [monitors] ::
::rel Controller -> Pump [monitors] ::
```

## Troubleshooting

### Common Issues

**Issue**: Relationship doesn't appear in graph
```markdown
// Typo in entity name
::rel Servre -> Database [queries] ::
//     ^ typo

// Solution: Match entity names exactly
::rel Server -> Database [queries] ::
```

**Issue**: Unclear relationship direction
```markdown
// Ambiguous
::rel Server -> Database [related_to] ::

// Better
::rel Server -> Database [queries] ::
```

**Issue**: Relationships scattered randomly
```markdown
// Poor organization
::rel A -> B [x] ::
[unrelated content]
::rel A -> C [y] ::

// Better grouping
[content about A's relationships]
::rel A -> B [x] ::
::rel A -> C [y] ::
```

## See Also

- [Syntax Specification](syntax-specification.md#5-relationship-notation) - Complete formal reference
- [Entity References](entity-references.md) - How entities are referenced
- [Configuration Blocks](config-blocks.md) - How to define entity types
- [Examples](../examples/) - Real-world relationship patterns
