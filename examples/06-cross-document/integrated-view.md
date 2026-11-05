# Integrated View

How the electrical and mechanical systems interact to keep the data center
running. This document composes the knowledge graphs defined in
[electrical-systems.md](electrical-systems.md) and
[mechanical-systems.md](mechanical-systems.md) into a single, unified view of
the facility.

::config
// Shared equipment types (matching electrical-systems.md and mechanical-systems.md)
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 80
control: diamond, #FF9800, 90

// Entities from electrical-systems.md (referenced here, not redefined)
UtilityFeed: type=equipment
MainSwitchboard: type=equipment
UPS_System: type=equipment
PowerPanel: type=equipment
Generator: type=equipment
TransferSwitch: type=component
PowerMonitor: type=control

// Entities from mechanical-systems.md (referenced here, not redefined)
ChillerSystem: type=equipment
CoolingTower: type=equipment
CRAC_Unit: type=equipment
Pump: type=component
TemperatureController: type=control

// Integration-layer control
FacilityBMS: type=control
::

## Purpose of the Integrated View

Each subsystem is documented independently by its own subject matter experts.
The electrical team owns [electrical-systems.md](electrical-systems.md) and the
mechanical team owns [mechanical-systems.md](mechanical-systems.md). Neither
document, on its own, tells the whole story: the electrical document describes
*how power is produced and distributed*, while the mechanical document describes
*how heat is removed*. The dependencies that link the two only become visible
when their graphs are merged.

This document does not redefine those systems. Instead, it references the same
entities by name so that DOT-LD can resolve them to the entities already defined
in the sibling documents, then adds the cross-domain relationships that span
both.

## Power Feeds Cooling

Every piece of mechanical equipment ultimately depends on the electrical
distribution system. The [[PowerPanel]] defined in the electrical documentation
is the single point where power crosses the boundary into the mechanical domain.

::rel PowerPanel -> ChillerSystem [supplies_power_to] ::
::rel PowerPanel -> CoolingTower [supplies_power_to] ::
::rel PowerPanel -> CRAC_Unit [supplies_power_to] ::
::rel PowerPanel -> Pump [supplies_power_to] ::

These relationships are the mirror image of the `powered_by` edges declared in
[mechanical-systems.md](mechanical-systems.md). Viewed together, they confirm
that the [[PowerPanel]] is a shared entity bridging both knowledge graphs.

## Cooling Protects the Critical Load

The relationship is not one-directional. Without cooling, the IT load — and the
electrical equipment itself — would overheat. The [[CRAC_Unit]] systems remove
heat from the same spaces that house electrical gear, while the [[ChillerSystem]]
and [[CoolingTower]] reject that heat to the atmosphere.

::rel ChillerSystem -> MainSwitchboard [protects_from_overheating] ::
::rel CRAC_Unit -> UPS_System [cools] ::

This mutual dependency is why electrical and mechanical systems must be designed,
operated, and analyzed together rather than in isolation.

## Resilience: Backup Power for Cooling

During a utility outage, cooling cannot be allowed to fail. The electrical
design routes backup power so that critical cooling equipment rides through the
transition from utility to generator power.

The [[UPS_System]] bridges the brief gap until the [[Generator]] starts, and the
[[TransferSwitch]] transfers the facility load — including cooling — onto
generator power.

::rel UPS_System -> ChillerSystem [sustains_during_outage] ::
::rel Generator -> TransferSwitch [connects_via] ::
::rel TransferSwitch -> MainSwitchboard [switches_power_to] ::
::rel Generator -> ChillerSystem [backs_up_power_for] ::
::rel Generator -> CRAC_Unit [backs_up_power_for] ::

Because the [[ChillerSystem]] and [[CRAC_Unit]] are the same entities defined in
[mechanical-systems.md](mechanical-systems.md), these resilience relationships
attach directly to the mechanical graph without any duplication.

## Coordinated Monitoring and Control

Two independent controllers manage their own domains: the [[PowerMonitor]]
watches electrical parameters, while the [[TemperatureController]] manages the
cooling equipment. At the facility level, a building management system
coordinates both so that power and cooling decisions are made with full context.

::rel FacilityBMS -> PowerMonitor [aggregates] ::
::rel FacilityBMS -> TemperatureController [aggregates] ::
::rel FacilityBMS -> PowerPanel [load_sheds] ::

When demand exceeds available backup capacity, the [[FacilityBMS]] can shed
non-critical load at the [[PowerPanel]] to keep critical cooling online — a
decision that only makes sense when both graphs are visible together.

## Power and Cooling Balance

The integrated view also reconciles the capacity figures from both documents:

| Domain | Source Document | Capacity |
|--------|-----------------|----------|
| Utility feed | electrical-systems.md | 2.5 MW |
| Generator (backup) | electrical-systems.md | 2.0 MW |
| UPS (critical) | electrical-systems.md | 1.5 MW |
| Mechanical load | mechanical-systems.md | ~500 kW |

The ~500 kW mechanical load draws from the same 2.5 MW envelope that powers the
IT equipment and facility systems. Sizing the [[Generator]] and [[UPS_System]]
therefore requires the cooling numbers from the mechanical document — a concrete
example of why the two graphs must be composed.

## Related Documents

This document is the composition layer and should be processed together with:

- [Electrical Systems](electrical-systems.md) - Power generation and distribution
- [Mechanical Systems](mechanical-systems.md) - Cooling and HVAC infrastructure

It references entities from both electrical and mechanical systems and defines
only the relationships that span the two domains.

## See Also

- [Syntax Specification](../../docs/syntax-specification.md#7-cross-document-composition) - Formal composition rules
- [Use Cases](../../docs/use-cases.md) - When to use multi-document approaches
