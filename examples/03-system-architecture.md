# System Architecture Documentation

This example demonstrates using DOT-LD to document a microservices-based web application architecture.

## Architecture Overview

::config
// Service tier definitions
service: round-rectangle, #2196F3, 110
gateway: round-rectangle, #1976D2, 120
database: rectangle, #4CAF50, 100
cache: ellipse, #FF9800, 85
queue: rectangle, #9C27B0, 90

// API Gateway
APIGateway: type=gateway

// Core services
AuthService: type=service
UserService: type=service
ProductService: type=service
OrderService: type=service
NotificationService: type=service

// Data stores
UserDatabase: type=database
ProductDatabase: type=database
OrderDatabase: type=database
SessionCache: type=cache

// Message queues
OrderQueue: type=queue
NotificationQueue: type=queue
::

## Request Flow

### Entry Point

All client requests first hit the [[APIGateway]], which serves as the single entry 
point for the application. The gateway handles:
- Request routing
- Rate limiting
- SSL termination
- Request logging

::rel APIGateway -> AuthService [validates_tokens_with] ::

### Authentication

The [[AuthService]] is responsible for user authentication and token management.
It maintains user sessions in the [[SessionCache]] for fast token validation.

::rel AuthService -> SessionCache [stores_sessions_in] ::
::rel AuthService -> UserDatabase [validates_credentials_against] ::

## Core Services

### User Management

The [[UserService]] manages user profiles and preferences. It provides user information
to other services and handles profile updates.

::rel APIGateway -> UserService [routes_user_requests_to] ::
::rel UserService -> UserDatabase [reads_from] ::
::rel UserService -> UserDatabase [writes_to] ::

### Product Catalog

The [[ProductService]] maintains the product catalog and handles product queries.
To improve performance, it uses the [[SessionCache]] for frequently accessed products.

::rel APIGateway -> ProductService [routes_product_requests_to] ::
::rel ProductService -> SessionCache [caches_products_in] ::
::rel ProductService -> ProductDatabase [queries] ::

When product data is updated, the service invalidates the cache:

::rel ProductService -> SessionCache [invalidates] ::

### Order Processing

The [[OrderService]] handles order creation, processing, and tracking. It validates
orders against the product catalog before accepting them.

::rel APIGateway -> OrderService [routes_orders_to] ::
::rel OrderService -> ProductService [validates_products_with] ::

Orders are persisted to the [[OrderDatabase]]:

::rel OrderService -> OrderDatabase [stores_orders_in] ::

For async processing, orders are placed in the [[OrderQueue]]:

::rel OrderService -> OrderQueue [publishes_to] ::

## Asynchronous Processing

### Order Queue

The [[OrderQueue]] decouples order submission from order fulfillment, allowing
the system to handle spikes in order volume.

::rel OrderQueue -> NotificationService [triggers] ::

### Notifications

The [[NotificationService]] sends order confirmations, shipping updates, and other
customer communications. It reads from the [[NotificationQueue]] to process messages
asynchronously.

::rel NotificationQueue -> NotificationService [consumed_by] ::
::rel NotificationService -> OrderDatabase [reads_order_details_from] ::
::rel NotificationService -> UserService [retrieves_contact_info_from] ::

## Data Layer

### User Database

The [[UserDatabase]] stores:
- User credentials (hashed passwords)
- Profile information
- Preferences and settings
- Authentication history

::rel UserDatabase -> SessionCache [populated_into] ::

### Product Database

The [[ProductDatabase]] contains:
- Product catalog
- Inventory levels
- Pricing information
- Product metadata

### Order Database

The [[OrderDatabase]] maintains:
- Order records
- Order status
- Transaction history
- Fulfillment tracking

## Caching Strategy

The [[SessionCache]] improves performance by caching:
- User session tokens
- Frequently accessed products
- User preferences

Multiple services read from the cache:

::rel UserService -> SessionCache [reads_from] ::
::rel ProductService -> SessionCache [reads_from] ::

## Scaling Considerations

### Horizontal Scaling

All services can scale horizontally:
- [[APIGateway]]: Multiple instances behind load balancer
- [[AuthService]], [[UserService]], [[ProductService]], [[OrderService]]: Stateless, scalable
- [[NotificationService]]: Multiple workers consuming from queue

### Database Replication

Databases use read replicas for query scaling (not shown in this document for simplicity).

### Cache Distribution

The [[SessionCache]] uses a distributed cache implementation (Redis) to share state
across service instances.

## Resilience Patterns

### Circuit Breaker

The [[APIGateway]] implements circuit breaker patterns for downstream services,
preventing cascading failures.

### Retry Logic

Services retry failed operations with exponential backoff:
- Database queries
- Cache operations
- Inter-service calls

### Graceful Degradation

If the [[SessionCache]] is unavailable:
- [[AuthService]] falls back to database validation
- [[ProductService]] serves directly from database

::rel AuthService -> UserDatabase [falls_back_to] ::
::rel ProductService -> ProductDatabase [falls_back_to] ::

## Monitoring and Observability

All services emit metrics and logs for:
- Request rates and latencies
- Error rates
- Resource utilization
- Business metrics

(Monitoring infrastructure not shown in this architectural document)

## Security

### Authentication Flow

```
Client → APIGateway → AuthService → UserDatabase
                ↓
          SessionCache
```

### Authorization

Each service validates tokens with [[AuthService]] before processing requests:

::rel UserService -> AuthService [validates_access_with] ::
::rel ProductService -> AuthService [validates_access_with] ::
::rel OrderService -> AuthService [validates_access_with] ::

### Data Security

- Passwords hashed before storage in [[UserDatabase]]
- All inter-service communication over TLS
- Sensitive data encrypted at rest

## Deployment Architecture

Services deployed in containers across multiple availability zones:
- Load balanced for high availability
- Auto-scaling based on demand
- Blue-green deployment for zero-downtime updates

## Knowledge Graph Summary

This architecture defines:

**Services (6)**:
- APIGateway (entry point)
- AuthService (authentication)
- UserService (user management)
- ProductService (product catalog)
- OrderService (order processing)
- NotificationService (async notifications)

**Data Stores (4)**:
- UserDatabase
- ProductDatabase  
- OrderDatabase
- SessionCache

**Message Queues (2)**:
- OrderQueue
- NotificationQueue

**Total Relationships**: 29 defined relationships showing data flow, service dependencies, and communication patterns

## Related Documentation

- [API Documentation](04-api-documentation.md) - Detailed API specifications

## See Also

- [Basic Example](01-basic-example.md) - Introduction to DOT-LD
- [HVAC System](02-hvac-system.md) - Physical infrastructure documentation
- [Use Cases](../docs/use-cases.md) - When to use DOT-LD for architecture docs
