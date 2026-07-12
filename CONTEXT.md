# TransitOps

A centralized transport operations platform for managing fleet assets, driver compliance, trip dispatch, maintenance, fuel and expense tracking, and operational analytics.

## Fleet

**Vehicle**:
A registered fleet asset identified by a unique registration number, with capacity, odometer, acquisition cost, and operational status.
_Avoid_: Fleet unit, asset, truck

**Vehicle Status**:
The current operational availability of a vehicle: `Available`, `OnTrip`, `InShop`, or `Retired`.
_Avoid_: State, condition

**Registration Number**:
The unique identifier assigned to a vehicle at registration (e.g. Van-05). No two vehicles may share one.
_Avoid_: License plate, plate number

## Personnel

**Driver**:
A licensed person authorized to operate fleet vehicles, with contact details, license credentials, and a safety score.
_Avoid_: Operator, chauffeur, employee

**Driver Status**:
The current work availability of a driver: `Available`, `OnTrip`, `OffDuty`, or `Suspended`.
_Avoid_: State, duty status

**Safety Score**:
A numeric rating from 0 to 100 reflecting a driver's safety record. Displayed as stars in the UI.
_Avoid_: Performance rating, performance score

**Role**:
A user's access identity in the system: `FleetManager`, `Dispatcher`, `SafetyOfficer`, or `FinancialAnalyst`.
_Avoid_: User type, permission group

## Operations

**Trip**:
A planned or active movement of cargo from a source to a destination, assigned to one vehicle and one driver.
_Avoid_: Delivery, shipment, order

**Trip Status**:
The lifecycle stage of a trip: `Draft`, `Dispatched`, `InTransit`, `Completed`, or `Cancelled`.
_Avoid_: State, phase

**Dispatch**:
The action that moves a trip from `Draft` to `Dispatched` and sets the assigned vehicle and driver to `OnTrip`.
_Avoid_: Assign, send out, release

**Maintenance Record**:
A logged service event for a vehicle. An open record forces the vehicle to `InShop`; closing it restores `Available`.
_Avoid_: Service log, repair ticket, work order

**Fuel Log**:
A record of fuel purchased for a vehicle, including liters, cost, and date.
_Avoid_: Fuel entry, gas record

**Expense**:
An operational cost not captured as fuel or maintenance, such as a toll or other fee.
_Avoid_: Cost entry, charge

**Inventory Item**:
A tracked supply or part with quantity on hand and a reorder threshold.
_Avoid_: Stock item, spare part, supply

## Metrics

**Fleet Utilization**:
The percentage of fleet vehicles actively in use (on trip or in maintenance) relative to total non-retired vehicles.
_Avoid_: Usage rate, occupancy

**Fuel Efficiency**:
Distance traveled divided by fuel consumed, expressed as km per liter.
_Avoid_: Mileage, MPG, fuel economy

**Operational Cost**:
The sum of fuel, maintenance, and other expenses attributed to a vehicle or the fleet.
_Avoid_: Running cost, total cost

**Trip Revenue**:
The income recorded when a trip is completed. Used in ROI and analytics calculations.
_Avoid_: Earnings, income, payment

**Vehicle ROI**:
Return on investment for a vehicle: (Trip Revenue − Operational Cost) ÷ Acquisition Cost.
_Avoid_: Profitability, return
