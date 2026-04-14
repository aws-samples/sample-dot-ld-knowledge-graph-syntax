::config
// Style definitions: type: shape, color, size
equipment: round-rectangle, #4A90E2, 120
component: ellipse, #7ED321, 100
control: diamond, #F5A623, 110
sensor: round-rectangle, #BD10E0, 90
network: hexagon, #50E3C2, 100

// Entity definitions  
ChillerSystem: type=equipment
CoolingTower: type=equipment
CondenserPump: type=component
ChilledPump: type=component
Compressor: type=component
Evaporator: type=component
Condenser: type=component
ExpansionValve: type=component
Controller: type=control
TempSensor: type=sensor
PressureSensor: type=sensor
SCADA: type=network
::

# HVAC Chiller System Documentation

## System Overview

The [[ChillerSystem]] is a critical component in our building's cooling infrastructure. It works in conjunction with the [[CoolingTower]] to provide efficient cooling throughout the facility.

::rel ChillerSystem -> CoolingTower [requires] ::
::rel ChillerSystem -> CondenserPump [uses] ::
::rel ChillerSystem -> ChilledPump [uses] ::

The cooling tower removes heat from the condenser via the condenser water circuit. The [[CondenserPump]] circulates water between the cooling tower and condenser, while the [[ChilledPump]] circulates chilled water from the evaporator to building loads.

::rel CoolingTower -> CondenserPump [connects to] ::
::rel CondenserPump -> Condenser [pumps water to] ::
::rel Condenser -> CoolingTower [returns heated water to] ::
::rel ChilledPump -> Evaporator [circulates through] ::

## Component Specifications

| Component | Type | Capacity | Power |
|-----------|------|----------|-------|
| [[ChillerSystem]] | Equipment | 500 tons | 450 kW |
| [[CoolingTower]] | Equipment | 600 tons | 15 kW |
| [[CondenserPump]] | Component | 1200 GPM | 25 kW |
| [[ChilledPump]] | Component | 1000 GPM | 30 kW |
| [[Compressor]] | Component | 500 tons | 400 kW |

## Refrigerant Cycle Components

The [[Compressor]] is the heart of the chiller system. It works with the [[Evaporator]], [[Condenser]], and [[ExpansionValve]] to complete the refrigeration cycle.

::rel ChillerSystem -> Compressor [contains] ::
::rel ChillerSystem -> Evaporator [contains] ::
::rel ChillerSystem -> Condenser [contains] ::
::rel ChillerSystem -> ExpansionValve [contains] ::

The refrigerant cycle operates as follows:

1. The compressor receives low-pressure refrigerant gas from the evaporator
2. It compresses the gas to high pressure and temperature
3. The hot gas flows to the condenser where it releases heat
4. The condensed high-pressure liquid passes through the expansion valve
5. The expansion valve reduces the pressure, creating a cold liquid-gas mixture
6. This mixture flows to the evaporator to absorb heat and complete the cycle

::rel Compressor -> Condenser [sends high-pressure gas to] ::
::rel Condenser -> ExpansionValve [sends high-pressure liquid to] ::
::rel ExpansionValve -> Evaporator [sends low-pressure liquid to] ::
::rel Evaporator -> Compressor [returns low-pressure gas to] ::

## Control System

The [[Controller]] monitors and manages all components. It receives data from the [[TempSensor]] and [[PressureSensor]] to maintain optimal performance and energy efficiency.

::rel Controller -> TempSensor [reads] ::
::rel Controller -> PressureSensor [reads] ::
::rel Controller -> ChillerSystem [controls] ::

The control system automatically adjusts:
- Compressor speed based on cooling demand
- Pump speeds for optimal flow rates
- Valve positions for temperature control

## Network Architecture

The [[SCADA]] system provides remote monitoring and control capabilities, enabling facility managers to monitor system performance and respond to alarms from anywhere.

::rel SCADA -> Controller [interfaces with] ::
::rel SCADA -> TempSensor [monitors] ::
::rel SCADA -> PressureSensor [monitors] ::

## Maintenance Requirements

Regular maintenance ensures reliable operation:

- **Weekly**: Check sensor readings and system performance
- **Monthly**: Inspect pumps and clean condenser tubes
- **Quarterly**: Test all safety controls and alarms
- **Annually**: Complete refrigerant analysis and system tune-up
