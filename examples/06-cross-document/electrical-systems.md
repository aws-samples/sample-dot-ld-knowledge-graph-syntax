# Electrical Systems

Data center electrical distribution and power infrastructure.

::config
// Shared equipment types
equipment: round-rectangle, #2196F3, 120
component: ellipse, #4CAF50, 80
control: diamond, #FF9800, 90

// Electrical equipment
UtilityFeed: type=equipment
MainSwitchboard: type=equipment
UPS_System: type=equipment
PowerPanel: type=equipment
Generator: type=equipment

// Electrical components
Transformer: type=component
CircuitBreaker: type=component
TransferSwitch: type=component

// Control systems
PowerMonitor: type=control
::

## Utility Connection

The data center receives power from the [[UtilityFeed]], a high-voltage connection
from the local utility company.

::rel UtilityFeed -> Transformer [supplies] ::

The [[Transformer]] steps down the voltage to distribution levels.

::rel Transformer -> MainSwitchboard [feeds] ::

## Main Switchboard

The [[MainSwitchboard]] is the main distribution point for facility power.

::rel MainSwitchboard -> UPS_System [distributes_to] ::
::rel MainSwitchboard -> PowerPanel [distributes_to] ::

A [[CircuitBreaker]] protects the main distribution:

::rel CircuitBreaker -> MainSwitchboard [protects] ::

## Uninterruptible Power Supply

The [[UPS_System]] provides clean, conditioned power to critical IT loads.

::rel UPS_System -> PowerPanel [supplies_critical_power_to] ::

The UPS bridges power during utility outages until the [[Generator]] starts:

::rel UPS_System -> Generator [bridges_to] ::

## Backup Power

The [[Generator]] provides long-term backup power during extended outages.

::rel Generator -> TransferSwitch [connects_via] ::
::rel TransferSwitch -> MainSwitchboard [switches_power_to] ::

The [[TransferSwitch]] automatically transfers the load from utility to generator
power when needed.

## Power Panels

[[PowerPanel]] units distribute power to individual equipment loads throughout
the facility.

## Monitoring

The [[PowerMonitor]] tracks electrical parameters across the distribution system:

::rel PowerMonitor -> UtilityFeed [monitors] ::
::rel PowerMonitor -> MainSwitchboard [monitors] ::
::rel PowerMonitor -> UPS_System [monitors] ::
::rel PowerMonitor -> Generator [monitors] ::

Key monitored parameters:
- Voltage and current
- Power factor
- Frequency
- kW and kVA demand

## Electrical Capacity

**Utility Feed**: 2.5 MW
**Generator**: 2.0 MW  
**UPS System**: 1.5 MW
**Power Panels**: Various capacities (100A - 400A)

## Related Systems

This electrical infrastructure powers:
- Cooling systems (chillers, pumps, cooling towers)
- IT equipment (servers, network, storage)
- Facility systems (lighting, security, BMS)

See [Mechanical Systems](mechanical-systems.md) for cooling equipment power requirements.
