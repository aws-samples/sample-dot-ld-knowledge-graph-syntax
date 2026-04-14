# Order Fulfillment Process

This example demonstrates using DOT-LD to document a business process workflow with decision points and multiple actors.

## Process Overview

::config
// Process component types
process: round-rectangle, #2196F3, 100
decision: diamond, #FF9800, 80
actor: ellipse, #4CAF50, 85
system: rectangle, #9C27B0, 95
data: rectangle, #00BCD4, 90

// Process steps
OrderReceived: type=process
ValidateOrder: type=decision
CheckInventory: type=decision
ProcessPayment: type=process
ReserveItems: type=process
GeneratePickList: type=process
PackOrder: type=process
ShipOrder: type=process
SendConfirmation: type=process
HandleException: type=process

// Actors
Customer: type=actor
SalesRep: type=actor
WarehouseStaff: type=actor
ShippingTeam: type=actor

// Systems
OrderSystem: type=system
InventorySystem: type=system
PaymentSystem: type=system
ShippingSystem: type=system

// Data
OrderRecord: type=data
PickList: type=data
ShippingLabel: type=data
::

## Order Receipt

When a [[Customer]] places an order, it enters the [[OrderReceived]] stage.

::rel Customer -> OrderReceived [initiates] ::

The order is captured in the [[OrderSystem]]:

::rel OrderReceived -> OrderSystem [creates_record_in] ::
::rel OrderSystem -> OrderRecord [stores] ::

## Order Validation

The [[ValidateOrder]] decision point checks order completeness and correctness.

::rel OrderReceived -> ValidateOrder [proceeds_to] ::

**Validation Checks**:
- Customer information complete
- Product IDs valid
- Quantities specified
- Shipping address valid
- Payment method provided

If validation fails, the order goes to [[HandleException]]:

::rel ValidateOrder -> HandleException [on_failure] ::
::rel HandleException -> SalesRep [notifies] ::

A [[SalesRep]] contacts the [[Customer]] to resolve issues:

::rel SalesRep -> Customer [contacts] ::

If validation passes, proceed to inventory check:

::rel ValidateOrder -> CheckInventory [on_success] ::

## Inventory Check

The [[CheckInventory]] decision verifies product availability.

::rel CheckInventory -> InventorySystem [queries] ::

**Inventory Check Logic**:
- Query current stock levels
- Verify quantities available
- Check for allocated/reserved items
- Confirm fulfillment capacity

If items are out of stock:

::rel CheckInventory -> HandleException [if_insufficient] ::
::rel HandleException -> Customer [notifies_backorder] ::

If items are available:

::rel CheckInventory -> ProcessPayment [if_available] ::

## Payment Processing

The [[ProcessPayment]] step charges the customer's payment method.

::rel ProcessPayment -> PaymentSystem [executes_via] ::

**Payment Steps**:
1. Validate payment method
2. Process authorization
3. Capture funds
4. Record transaction

If payment fails:

::rel ProcessPayment -> HandleException [on_failure] ::
::rel HandleException -> Customer [requests_alternate_payment] ::

If payment succeeds:

::rel ProcessPayment -> ReserveItems [on_success] ::
::rel ProcessPayment -> OrderRecord [updates_status] ::

## Item Reservation

The [[ReserveItems]] step allocates inventory to this specific order.

::rel ReserveItems -> InventorySystem [reserves_in] ::

This prevents overselling and ensures items won't be allocated to other orders:

::rel InventorySystem -> OrderRecord [links_reservation_to] ::

After reservation:

::rel ReserveItems -> GeneratePickList [proceeds_to] ::

## Pick List Generation

The [[GeneratePickList]] step creates instructions for warehouse staff.

::rel GeneratePickList -> PickList [creates] ::

The [[PickList]] contains:
- Order ID
- Customer name
- Product locations in warehouse
- Quantities needed
- Special handling instructions

The pick list is sent to [[WarehouseStaff]]:

::rel PickList -> WarehouseStaff [assigned_to] ::

## Order Packing

[[WarehouseStaff]] retrieve items from inventory and pack the order.

::rel WarehouseStaff -> PackOrder [performs] ::
::rel PackOrder -> InventorySystem [updates_stock_in] ::

**Packing Steps**:
1. Retrieve items from warehouse locations
2. Verify items against pick list
3. Pack items securely
4. Apply packing slip
5. Mark order as packed

After packing:

::rel PackOrder -> ShipOrder [proceeds_to] ::

## Shipping

The [[ShippingTeam]] arranges shipment of the packed order.

::rel ShippingTeam -> ShipOrder [executes] ::
::rel ShipOrder -> ShippingSystem [schedules_via] ::

The [[ShippingSystem]] generates a [[ShippingLabel]]:

::rel ShippingSystem -> ShippingLabel [generates] ::
::rel ShippingLabel -> ShippingTeam [printed_by] ::

**Shipping Steps**:
1. Select carrier and service level
2. Generate shipping label
3. Apply label to package
4. Schedule pickup or deliver to carrier
5. Record tracking number

Tracking information is added to the order:

::rel ShipOrder -> OrderRecord [updates_tracking_in] ::

## Customer Notification

Once shipped, the [[SendConfirmation]] process notifies the customer.

::rel ShipOrder -> SendConfirmation [triggers] ::
::rel SendConfirmation -> Customer [emails] ::

**Confirmation Includes**:
- Order shipped notification
- Tracking number
- Estimated delivery date
- Link to track shipment

The order status is updated:

::rel SendConfirmation -> OrderRecord [marks_shipped] ::

## Exception Handling

The [[HandleException]] process manages various error conditions throughout the workflow.

**Exception Types**:
- Invalid order data
- Out of stock items
- Payment failures
- Shipping issues
- Customer cancellations

For each exception type, appropriate actors are notified:

::rel HandleException -> SalesRep [escalates_to] ::

The [[SalesRep]] resolves issues and may restart the process:

::rel SalesRep -> OrderReceived [may_restart] ::

## Process Metrics

### Key Performance Indicators

**Order Processing Time**:
- Target: Orders shipped within 24 hours
- Measurement: OrderReceived to ShipOrder duration

**Order Accuracy**:
- Target: 99.5% accuracy
- Measurement: Correct items, quantities, addresses

**Payment Success Rate**:
- Target: 95% first-attempt success
- Measurement: ProcessPayment success vs. failures

**Inventory Accuracy**:
- Target: 99% match between system and physical
- Measurement: Reservation vs. actual availability

### Process Stages

```
OrderReceived → ValidateOrder → CheckInventory → ProcessPayment
                    ↓               ↓                ↓
              HandleException   HandleException  HandleException
                    ↓
              ReserveItems → GeneratePickList → PackOrder → ShipOrder
                    ↓              ↓              ↓            ↓
              InventorySystem   WarehouseStaff  WarehouseStaff  ShippingTeam
                                                                   ↓
                                                            SendConfirmation
                                                                   ↓
                                                               Customer
```

## Process Improvements

### Automation Opportunities

Several manual steps could be automated:
- Order validation (reduce [[SalesRep]] involvement)
- Inventory reservation (immediate upon payment)
- Pick list generation (automatic on reservation)
- Customer notifications (triggered by status changes)

### Bottleneck Analysis

Common bottlenecks:
- Payment processing during high volume
- Warehouse staff capacity during peak seasons
- Shipping carrier capacity during holidays

## Roles and Responsibilities

### Customer
- Places order
- Provides payment
- Receives confirmation
- Tracks shipment

### Sales Representative
- Resolves order validation issues
- Handles payment problems
- Addresses customer concerns
- Processes cancellations

### Warehouse Staff
- Receives pick lists
- Retrieves items from inventory
- Packs orders
- Updates inventory system

### Shipping Team
- Generates shipping labels
- Prepares packages for carrier
- Schedules pickups
- Handles shipping exceptions

## Knowledge Graph Summary

This process documentation defines:

**Process Steps (10)**:
- OrderReceived, ValidateOrder, CheckInventory, ProcessPayment, ReserveItems
- GeneratePickList, PackOrder, ShipOrder, SendConfirmation, HandleException

**Actors (4)**:
- Customer, SalesRep, WarehouseStaff, ShippingTeam

**Systems (4)**:
- OrderSystem, InventorySystem, PaymentSystem, ShippingSystem

**Data Objects (3)**:
- OrderRecord, PickList, ShippingLabel

**Relationships (30+)**: Showing process flow, actor interactions, system dependencies, and data creation/updates

## See Also

- [System Architecture](03-system-architecture.md) - Technical system design
- [API Documentation](04-api-documentation.md) - API integration points
- [Basic Example](01-basic-example.md) - Introduction to DOT-LD
