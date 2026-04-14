# HVAC System Documentation

This example demonstrates DOT-LD syntax for documenting a data center cooling system, including mechanical equipment, components, and control systems.

## System Overview

::config
// Equipment type definitions with visual styling
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 80
control: diamond, #FF9800, 90

// Primary systems
ChillerSystem: type=equipment
CoolingTower: type=equipment

// Components  
Pump: type=component
Valve: type=component
HeatExchanger: type=component

// Control systems
Controller: type=control
TemperatureSensor: type=control
::

## Chiller Plant Description

The [[ChillerSystem]] is the primary cooling equipment for the data center facility. 
It generates chilled water that is circulated throughout the building to remove heat
from IT equipment.

::rel ChillerSystem -> Pump [uses] ::

The system operates on a refrigeration cycle, using a compressor to move heat from
the chilled water to a condenser, where it can be rejected to the atmosphere via
the [[CoolingTower]].

::rel ChillerSystem -> CoolingTower [requires] ::

## Water Circulation

A dedicated [[Pump]] circulates chilled water through the facility. The pump must
provide sufficient flow rate and pressure to serve all cooling loads while maintaining
acceptable water velocity through piping and equipment.

::rel Pump -> HeatExchanger [circulates_through] ::

Water flow is regulated by a [[Valve]] that modulates based on system demand.

::rel Valve -> Pump [regulates_flow_of] ::

## Heat Exchange

The [[HeatExchanger]] transfers heat from the IT equipment to the chilled water loop.
This heat is then carried back to the [[ChillerSystem]] for removal.

::rel HeatExchanger -> ChillerSystem [returns_warm_water_to] ::

## Cooling Tower Operation

The [[CoolingTower]] rejects heat from the chiller condenser water to the atmosphere
through evaporative cooling. It is critical for system efficiency and must operate
whenever the [[ChillerSystem]] is running.

::rel CoolingTower -> ChillerSystem [provides_heat_rejection_for] ::

## Control System

### Monitoring and Control

A programmable logic [[Controller]] monitors system parameters and adjusts equipment
operation to maintain optimal performance and energy efficiency.

::rel Controller -> ChillerSystem [monitors] ::
::rel Controller -> Pump [monitors] ::
::rel Controller -> CoolingTower [monitors] ::

The [[TemperatureSensor]] provides real-time temperature data to the [[Controller]].

::rel TemperatureSensor -> Controller [reports_to] ::

### Valve Modulation

The [[Controller]] modulates the [[Valve]] position to regulate chilled water flow
based on cooling demand.

::rel Controller -> Valve [controls] ::

When demand increases, the valve opens to increase flow. When demand decreases,
the valve closes to reduce energy consumption.

## System Characteristics

### Design Parameters

**ChillerSystem**:
- Capacity: 500 tons
- Chilled water supply: 42°F
- Chilled water return: 56°F
- Condenser water flow: 1,500 GPM

**Pump**:
- Flow rate: 1,000 GPM
- Total head: 80 feet
- Motor power: 25 HP

**CoolingTower**:
- Capacity: 600 tons
- Approach temperature: 7°F
- Wet bulb design: 78°F

### Operational Modes

1. **Normal Operation**: All equipment running at design conditions
2. **Part Load**: Reduced capacity based on cooling demand  
3. **Economizer Mode**: Free cooling when ambient conditions allow
4. **Backup Mode**: Secondary equipment activated if primary fails

## Maintenance and Reliability

Regular maintenance of the [[ChillerSystem]], [[Pump]], and [[CoolingTower]] is 
essential for reliable operation. The [[Controller]] tracks run hours and alerts
operators when maintenance is due.

Key maintenance activities include:
- Filter replacement
- Refrigerant level checks
- Water treatment monitoring
- Bearing lubrication
- Control calibration

## Energy Optimization

The control system optimizes energy efficiency by:
- Modulating chilled water temperature based on load
- Sequencing multiple units efficiently
- Maximizing economizer hours
- Optimizing cooling tower fan speed

::rel Controller -> ChillerSystem [optimizes_efficiency_of] ::

## Knowledge Graph Summary

This document defines:

**Equipment (3 entities)**:
- ChillerSystem
- CoolingTower  

**Components (3 entities)**:
- Pump
- Valve
- HeatExchanger

**Control Systems (2 entities)**:
- Controller
- TemperatureSensor

**Relationships (15 total)**:
- Equipment usage and requirements
- Water circulation paths
- Heat transfer flows
- Control and monitoring connections

## Related Documentation

- Electrical Distribution System (power supply to equipment)
- Building Management System (integration with facility controls)
- Maintenance Procedures (detailed maintenance schedules)
- Emergency Shutdown Procedures (safety protocols)

## See Also

- [Basic Example](01-basic-example.md) - Simpler introduction to DOT-LD
- [System Architecture](03-system-architecture.md) - Software architecture patterns
- [Configuration Blocks](../docs/config-blocks.md) - Entity type definition guide
