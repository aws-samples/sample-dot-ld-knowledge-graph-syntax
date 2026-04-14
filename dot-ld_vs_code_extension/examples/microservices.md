::config
// Entity types with visual styling
service: round-rectangle, #2196F3, 130
database: ellipse, #4CAF50, 110
api: hexagon, #FF9800, 100
client: rectangle, #E91E63, 90

// Service definitions
WebApp: type=client
MobileApp: type=client
APIGateway: type=api
AuthService: type=service
UserService: type=service
OrderService: type=service
PaymentService: type=service
UserDB: type=database
OrderDB: type=database
PaymentDB: type=database
::

# Microservices Architecture

## System Overview

This document describes the architecture of our e-commerce platform built on a microservices architecture.

## Client Applications

The [[WebApp]] and [[MobileApp]] are the primary client interfaces that users interact with. Both applications communicate with the backend through the [[APIGateway]].

::rel WebApp -> APIGateway [sends requests to] ::
::rel MobileApp -> APIGateway [sends requests to] ::

## API Gateway

The [[APIGateway]] serves as the single entry point for all client requests. It handles:
- Request routing
- Load balancing
- Authentication validation
- Rate limiting

::rel APIGateway -> AuthService [authenticates with] ::
::rel APIGateway -> UserService [routes to] ::
::rel APIGateway -> OrderService [routes to] ::
::rel APIGateway -> PaymentService [routes to] ::

## Core Services

### Authentication Service

The [[AuthService]] handles user authentication and authorization. It validates credentials and issues JWT tokens for secure communication.

### User Service

The [[UserService]] manages user profiles, preferences, and account information. It stores data in the [[UserDB]].

::rel UserService -> UserDB [reads/writes] ::

### Order Service

The [[OrderService]] processes customer orders, manages inventory, and tracks shipments. Order data is persisted in the [[OrderDB]].

::rel OrderService -> OrderDB [reads/writes] ::
::rel OrderService -> UserService [validates users with] ::

### Payment Service

The [[PaymentService]] handles payment processing, refunds, and transaction history. All payment data is securely stored in the [[PaymentDB]].

::rel PaymentService -> PaymentDB [reads/writes] ::
::rel PaymentService -> OrderService [confirms orders with] ::

## Data Flow

When a user places an order:

1. Client sends request to API Gateway
2. API Gateway authenticates with Auth Service
3. Order Service validates user with User Service
4. Order Service creates order record in Order DB
5. Payment Service processes payment
6. Payment Service confirms order with Order Service

## Service Dependencies

::rel AuthService -> UserDB [validates against] ::
::rel OrderService -> PaymentService [requests payment from] ::
