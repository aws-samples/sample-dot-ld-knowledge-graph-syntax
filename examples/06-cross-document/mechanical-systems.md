# Mechanical Systems

Data center cooling and HVAC infrastructure.

::config
// Shared equipment types (matching electrical-systems.md)
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 80
control: diamond, #FF9800, 90

// Mechanical equipment
ChillerSystem: type=equipment
CoolingTower: type=equipment
CRAC_Unit: type=equipment

// Mechanical components
Pump: type=component
Valve: type=component
HeatExchanger: type=component

// Control systems
TemperatureController: type=control
::

## Chiller Plant

The [[ChillerSystem]] generates chilled water for the data center cooling system.

::rel ChillerSystem -> CoolingTower [rejects_heat_to] ::

The chiller requires significant electrical power from the facility [[PowerPanel]]:

::rel ChillerSystem -> PowerPanel [powered_by] ::

## Water Circulation

A dedicated [[Pump]] circulates chilled water through the facility.

::rel Pump -> HeatExchanger [circulates_through] ::
::rel Pump -> PowerPanel [powered_by] ::

Flow is regulated by a [[Valve]]:

::rel Valve -> Pump [regulates] ::

## Heat Rejection

The [[CoolingTower]] rejects heat to the atmosphere via evaporative cooling.

::rel CoolingTower -> PowerPanel [powered_by] ::

It must operate whenever the [[ChillerSystem]] is running.

## Computer Room Air Conditioning

[[CRAC_Unit]] systems distribute cooled air throughout the data center.

::rel CRAC_Unit -> HeatExchanger [receives_chilled_water_from] ::
::rel CRAC_Unit -> PowerPanel [powered_by] ::

Multiple CRAC units provide redundancy and capacity.

## Temperature Control

The [[TemperatureController]] monitors conditions and adjusts equipment operation:

::rel TemperatureController -> ChillerSystem [controls] ::
::rel TemperatureController -> Pump [controls] ::
::rel TemperatureController -> Valve [modulates] ::
::rel TemperatureController -> PowerPanel [powered_by] ::

## Cooling Capacity

**Chiller System**: 500 tons
**Cooling Tower**: 600 tons
**CRAC Units**: 50 tons each (4 units = 200 tons total)
**Design N+1**: One unit redundant

## Power Requirements

All mechanical systems depend on electrical infrastructure:
- **ChillerSystem**: 400 kW
- **CoolingTower**: 50 kW  
- **Pump**: 25 kW per unit
- **CRAC Units**: 15 kW per unit

Total mechanical load: ~500 kW

See [Electrical Systems](electrical-systems.md) for power distribution details.

## Integrated Operation

The mechanical cooling systems work in coordination with electrical infrastructure
to maintain optimal data center conditions while minimizing energy consumption.
