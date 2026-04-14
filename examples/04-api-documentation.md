# API Documentation Example

This example demonstrates using DOT-LD to document REST API dependencies and data flow.

## API Overview

::config
// API component types
api: round-rectangle, #2196F3, 110
endpoint: ellipse, #1976D2, 85
resource: rectangle, #4CAF50, 90
external: round-rectangle, #FF5722, 100

// Internal APIs
UserAPI: type=api
ProductAPI: type=api
OrderAPI: type=api
PaymentAPI: type=api

// External integrations
StripeAPI: type=external
ShippoAPI: type=external
SendGridAPI: type=external

// Resources
UserResource: type=resource
ProductResource: type=resource
OrderResource: type=resource
PaymentResource: type=resource
::

## User API

The [[UserAPI]] provides endpoints for user management and authentication.

### Endpoints

**POST /api/users/register**
- Creates new user account
- Returns user ID and authentication token

**POST /api/users/login**
- Authenticates user credentials
- Returns JWT token for subsequent requests

**GET /api/users/{id}**
- Retrieves user profile
- Requires authentication

**PUT /api/users/{id}**
- Updates user profile
- Requires authentication and ownership

### Data Model

The [[UserAPI]] manages the [[UserResource]], which includes:
- User ID (UUID)
- Email address
- Profile information
- Account status
- Created/updated timestamps

::rel UserAPI -> UserResource [manages] ::

## Product API

The [[ProductAPI]] handles product catalog operations.

### Endpoints

**GET /api/products**
- Lists available products
- Supports filtering and pagination

**GET /api/products/{id}**
- Retrieves detailed product information

**GET /api/products/search**
- Full-text search across product catalog

### Data Model

The [[ProductAPI]] manages the [[ProductResource]]:

::rel ProductAPI -> ProductResource [manages] ::

Product information includes:
- Product ID
- Name and description
- Price and currency
- Inventory count
- Images and metadata

## Order API

The [[OrderAPI]] orchestrates the ordering process, coordinating between multiple services.

::rel OrderAPI -> UserAPI [validates_users_via] ::
::rel OrderAPI -> ProductAPI [validates_products_via] ::
::rel OrderAPI -> PaymentAPI [processes_payments_via] ::

### Endpoints

**POST /api/orders**
- Creates new order
- Validates user authentication
- Checks product availability
- Processes payment
- Returns order ID

**GET /api/orders/{id}**
- Retrieves order details
- Requires authentication

**GET /api/orders/user/{userId}**
- Lists user's orders
- Requires authentication

**PUT /api/orders/{id}/cancel**
- Cancels pending order
- Initiates refund if applicable

### Data Model

The [[OrderAPI]] manages the [[OrderResource]]:

::rel OrderAPI -> OrderResource [manages] ::

Order information includes:
- Order ID
- User ID
- Order items (product IDs and quantities)
- Total amount
- Status (pending, confirmed, shipped, delivered)
- Timestamps

### Order Creation Flow

```
Client Request → OrderAPI
                    ↓
    ┌───────────────┼───────────────┐
    ↓               ↓               ↓
 UserAPI      ProductAPI       PaymentAPI
    ↓               ↓               ↓
 Validate      Check Stock      Process
  User         & Reserve        Payment
    │               │               │
    └───────────────┴───────────────┘
                    ↓
              Create Order
                    ↓
              OrderResource
```

## Payment API

The [[PaymentAPI]] handles payment processing and integrates with external payment
providers.

::rel PaymentAPI -> StripeAPI [processes_cards_via] ::

### Endpoints

**POST /api/payments/process**
- Processes payment for order
- Creates payment record
- Returns payment confirmation

**GET /api/payments/{id}**
- Retrieves payment details

**POST /api/payments/{id}/refund**
- Initiates refund
- Requires authorization

### Data Model

The [[PaymentAPI]] manages the [[PaymentResource]]:

::rel PaymentAPI -> PaymentResource [manages] ::

Payment records include:
- Payment ID
- Order ID
- Amount and currency
- Payment method
- Status (pending, completed, failed, refunded)
- Transaction ID from payment provider

## External Integrations

### Stripe Integration

The [[StripeAPI]] handles credit card processing:

::rel StripeAPI -> PaymentAPI [returns_transaction_to] ::

**Integration Points**:
- Card tokenization
- Payment processing
- Refund handling
- Webhook notifications

### Shipping Integration

After order confirmation, shipping is arranged via [[ShippoAPI]]:

::rel OrderAPI -> ShippoAPI [creates_shipments_via] ::

The [[ShippoAPI]] provides:
- Shipping rate calculations
- Label generation
- Tracking information

::rel ShippoAPI -> OrderAPI [provides_tracking_to] ::

### Email Notifications

The [[SendGridAPI]] handles transactional emails:

::rel OrderAPI -> SendGridAPI [sends_confirmations_via] ::
::rel PaymentAPI -> SendGridAPI [sends_receipts_via] ::

## API Dependencies

### Internal Dependencies

Primary service dependencies:

```
OrderAPI → UserAPI
OrderAPI → ProductAPI
OrderAPI → PaymentAPI
PaymentAPI → External (Stripe)
OrderAPI → External (Shippo, SendGrid)
```

### External Dependencies

External services the platform relies on:
- [[StripeAPI]] for payment processing (critical)
- [[ShippoAPI]] for shipping (important)
- [[SendGridAPI]] for notifications (non-critical)

## Authentication & Authorization

### Token-Based Auth

All API endpoints require JWT tokens issued by [[UserAPI]]:

::rel ProductAPI -> UserAPI [validates_tokens_with] ::
::rel PaymentAPI -> UserAPI [validates_tokens_with] ::

### API Keys

External API access uses API keys:
- Each client receives unique API key
- Keys can be revoked
- Rate limits per key

## Rate Limiting

All APIs implement rate limiting:
- Anonymous: 100 requests/hour
- Authenticated: 1000 requests/hour
- Premium: 10,000 requests/hour

## Error Handling

### Standard Error Response

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with ID xyz not found",
    "timestamp": "2026-03-18T19:00:00Z"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` - Invalid or missing authentication
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource doesn't exist
- `VALIDATION_ERROR` - Invalid request data
- `RATE_LIMIT_EXCEEDED` - Too many requests

## API Versioning

APIs use URL versioning:
- `/api/v1/users`
- `/api/v2/users` (when breaking changes needed)

Older versions maintained for 6 months after deprecation.

## Monitoring

API health monitored via:
- Request/response times
- Error rates
- Dependency availability
- Rate limit usage

## Knowledge Graph Summary

This API documentation defines:

**Internal APIs (4)**:
- UserAPI (authentication and user management)
- ProductAPI (product catalog)
- OrderAPI (order orchestration)
- PaymentAPI (payment processing)

**External APIs (3)**:
- StripeAPI (payment provider)
- ShippoAPI (shipping provider)
- SendGridAPI (email provider)

**Resources (4)**:
- UserResource
- ProductResource
- OrderResource
- PaymentResource

**Relationships (15)**: Showing API dependencies, resource management, and external integrations

## See Also

- [System Architecture](03-system-architecture.md) - Overall system design
- [Basic Example](01-basic-example.md) - Introduction to DOT-LD syntax
- [Use Cases](../docs/use-cases.md) - When to use DOT-LD for API docs
