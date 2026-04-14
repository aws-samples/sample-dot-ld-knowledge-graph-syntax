# DOT-LD Use Cases

This document explores common scenarios where DOT-LD provides value and demonstrates practical patterns for different documentation needs.

## Overview

DOT-LD is particularly valuable when you need documentation that:
- Serves both human readers and automated systems
- Captures semantic relationships explicitly
- Enables knowledge graph generation
- Maintains natural language readability
- Supports cross-document composition

## Use Case 1: System Architecture Documentation

### The Challenge

Software architects need to document system architectures that:
- Are understandable by both technical and non-technical stakeholders
- Can be automatically validated against actual deployments
- Generate up-to-date architecture diagrams
- Track dependencies for impact analysis

### DOT-LD Solution

Embed architectural relationships within natural language design documents:

```markdown
::config
service: round-rectangle, #2196F3, 110
database: rectangle, #4CAF50, 100
::

## Architecture

The [[APIGateway]] routes requests to the [[UserService]].
The [[UserService]] queries the [[UserDatabase]] for user information.

::rel APIGateway -> UserService [routes_to] ::
::rel UserService -> UserDatabase [queries] ::
```

### Benefits

- **Human-readable** design docs remain the primary artifact
- **Automatic diagrams** generated from relationships
- **Dependency tracking** for impact analysis
- **Version control** friendly (text-based)
- **Composable** across multiple architecture documents

### When to Use

✅ Documenting microservices architectures
✅ Creating system design documents
✅ Maintaining architecture decision records
✅ Tracking service dependencies
✅ Onboarding new team members

## Use Case 2: API Documentation

### The Challenge

API documentation needs to:
- Describe endpoints and their purposes
- Show API dependencies and integration points
- Explain data flows between services
- Remain synchronized with actual implementations

### DOT-LD Solution

Document APIs with embedded dependency information:

```markdown
::config
api: round-rectangle, #2196F3, 110
external: round-rectangle, #FF5722, 100
::

The [[OrderAPI]] validates payments via [[PaymentAPI]] and
sends confirmations via [[SendGridAPI]].

::rel OrderAPI -> PaymentAPI [validates_payments_via] ::
::rel OrderAPI -> SendGridAPI [sends_notifications_via] ::
```

### Benefits

- **Clear dependencies** between APIs
- **Integration documentation** in context
- **Data flow visualization** from relationships
- **External service tracking** clearly marked
- **API versioning** can be modeled

### When to Use

✅ Documenting REST APIs
✅ GraphQL schema documentation
✅ gRPC service documentation
✅ API gateway configurations
✅ Third-party integration guides

## Use Case 3: Infrastructure & Equipment Documentation

### The Challenge

Facilities and infrastructure teams need documentation that:
- Describes physical equipment and components
- Shows equipment relationships and dependencies
- Supports maintenance planning
- Enables root cause analysis

### DOT-LD Solution

Document infrastructure with equipment relationships:

```markdown
::config
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 80
::

The [[ChillerSystem]] uses [[Pump]] to circulate water and
requires [[CoolingTower]] for heat rejection.

::rel ChillerSystem -> Pump [uses] ::
::rel ChillerSystem -> CoolingTower [requires] ::
```

### Benefits

- **Equipment relationships** explicitly captured
- **Dependency chains** for impact analysis
- **Maintenance planning** from dependency graphs
- **Troubleshooting support** via relationship mapping
- **Training materials** with visual aids

### When to Use

✅ Data center infrastructure documentation
✅ Manufacturing equipment documentation
✅ Facilities management documentation
✅ HVAC system documentation
✅ Electrical distribution documentation

## Use Case 4: Process & Workflow Documentation

### The Challenge

Business analysts and process owners need to:
- Document business processes clearly
- Show decision points and branching logic
- Identify actors and their responsibilities
- Enable process optimization and automation

### DOT-LD Solution

Document workflows with process relationships:

```markdown
::config
process: round-rectangle, #2196F3, 100
decision: diamond, #FF9800, 80
actor: ellipse, #4CAF50, 85
::

The [[OrderReceived]] process triggers [[ValidateOrder]].
If validation passes, proceed to [[ProcessPayment]].

::rel OrderReceived -> ValidateOrder [triggers] ::
::rel ValidateOrder -> ProcessPayment [if_valid] ::
```

### Benefits

- **Process flow** explicitly defined
- **Decision points** clearly marked
- **Actor responsibilities** documented
- **Automation opportunities** identified
- **Process metrics** can be tracked

### When to Use

✅ Order fulfillment processes
✅ Approval workflows
✅ Customer onboarding processes
✅ Incident management procedures
✅ Manufacturing workflows

## Use Case 5: Technical Specifications

### The Challenge

Engineering teams need specifications that:
- Define system requirements precisely
- Show requirement dependencies
- Enable traceability
- Support compliance verification

### DOT-LD Solution

Specifications with requirement relationships:

```markdown
::config
requirement: rectangle, #2196F3, 100
component: ellipse, #4CAF50, 80
::

[[REQ-001]] specifies that the [[Authentication System]]
must support multi-factor authentication.

::rel REQ-001 -> Authentication System [specifies] ::
```

### Benefits

- **Requirements traceability** from specs to implementation
- **Dependency tracking** between requirements
- **Compliance verification** via relationship graphs
- **Impact analysis** for requirement changes
- **Test coverage** mapping

### When to Use

✅ System requirements specifications
✅ Technical design specifications
✅ Compliance documentation
✅ Safety-critical system documentation
✅ Regulatory submissions

## Use Case 6: Knowledge Management

### The Challenge

Organizations need to:
- Connect information across documents
- Build organizational knowledge graphs
- Enable semantic search
- Support decision-making with context

### DOT-LD Solution

Distributed documentation with shared ontologies:

```markdown
// Document A
::config
concept: ellipse, #2196F3, 90
Microservices: type=concept
::

// Document B  
[[Microservices]] architecture enables [[Independent Deployment]].

::rel Microservices -> Independent Deployment [enables] ::
```

### Benefits

- **Cross-document linking** via shared entities
- **Knowledge graph assembly** across repositories
- **Semantic search** via relationship traversal
- **Context preservation** in natural language
- **Organizational memory** captured formally

### When to Use

✅ Corporate wikis
✅ Technical documentation repositories
✅ Research documentation
✅ Best practices repositories
✅ Lessons learned databases

## Common Patterns

### Pattern 1: Hierarchical Relationships

Document containment and hierarchy:

```markdown
::rel DataCenter -> Building A [contains] ::
::rel Building A -> Floor 1 [contains] ::
::rel Floor 1 -> Server Rack 1 [contains] ::
```

### Pattern 2: Data Flow

Document how data moves through systems:

```markdown
::rel Frontend -> API Gateway [sends_requests_to] ::
::rel API Gateway -> Backend Service [forwards_to] ::
::rel Backend Service -> Database [queries] ::
```

### Pattern 3: Dependencies

Document what depends on what:

```markdown
::rel Service A -> Service B [depends_on] ::
::rel Service A -> Database C [requires] ::
::rel Service A -> Cache D [uses] ::
```

### Pattern 4: Control Flow

Document control and management relationships:

```markdown
::rel Controller -> System [monitors] ::
::rel Controller -> Actuator [controls] ::
::rel Sensor -> Controller [reports_to] ::
```

### Pattern 5: Bidirectional Communication

Document mutual relationships:

```markdown
::rel Service A <-> Service B [communicates_with] ::
::rel Peer 1 <-> Peer 2 [synchronizes_with] ::
```

## Anti-Patterns to Avoid

### ❌ Over-Granular Entities

**Problem**: Too many entities disrupts readability

```markdown
// Too granular
[[The]] [[APIGateway]] [[receives]] [[HTTP]] [[requests]]
```

**Better**: Use entities for key concepts only

```markdown
The [[APIGateway]] receives HTTP requests
```

### ❌ Vague Relationships

**Problem**: Unclear relationship semantics

```markdown
::rel Service A -> Service B [relates_to] ::
```

**Better**: Use specific, meaningful labels

```markdown
::rel Service A -> Service B [authenticates_via] ::
```

### ❌ Centralized Relationship Dumps

**Problem**: All relationships in one place

```markdown
// End of document - 50 relationship definitions
::rel A -> B [x] ::
::rel C -> D [y] ::
...
```

**Better**: Distribute relationships contextually

```markdown
// Throughout document near relevant content
Section about A and B: ::rel A -> B [x] ::
Section about C and D: ::rel C -> D [y] ::
```

### ❌ Inconsistent Entity Names

**Problem**: Same entity referenced differently

```markdown
[[WebServer]] ... [[web-server]] ... [[Web Server]]
```

**Better**: Use consistent naming

```markdown
[[WebServer]] ... [[WebServer]] ... [[WebServer]]
```

## Decision Guide

### When to Use DOT-LD

✅ **Use DOT-LD when**:
- Documentation needs both human and machine audiences
- Relationships between entities are important
- Visual diagrams would be helpful
- Cross-document linking is valuable
- Knowledge graphs would provide insights

❌ **Don't use DOT-LD when**:
- Simple linear documentation suffices
- Relationships aren't important
- No automation or tooling planned
- Overhead outweighs benefits

### Choosing Granularity

**Fine-grained** (more entities, more relationships):
- Complex systems needing detailed mapping
- Compliance or audit requirements
- Automated validation needs

**Coarse-grained** (fewer entities, key relationships):
- High-level architecture documentation
- Executive summaries
- Quick reference documentation

## Getting Started

1. **Start simple** - Begin with basic examples
2. **Identify key entities** - What are the most important concepts?
3. **Define relationships** - How do entities connect?
4. **Iterate** - Refine as understanding grows
5. **Review** - Ensure it reads naturally

## See Also

- [Basic Example](../examples/01-basic-example.md) - Getting started
- [Syntax Specification](syntax-specification.md) - Complete reference
- [FAQ](faq.md) - Common questions
- [Examples](../examples/) - More detailed examples
