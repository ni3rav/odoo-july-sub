export const VEHICLE_STATUSES = [
  "Available",
  "OnTrip",
  "InShop",
  "Retired",
] as const

export const DRIVER_STATUSES = [
  "Available",
  "OnTrip",
  "OffDuty",
  "Suspended",
] as const

export const TRIP_STATUSES = [
  "Draft",
  "Dispatched",
  "InTransit",
  "Completed",
  "Cancelled",
] as const

export const MAINTENANCE_STATUSES = ["Open", "Completed"] as const

export const EXPENSE_CATEGORIES = ["toll", "other"] as const

export const INVENTORY_STATUSES = ["InStock", "LowStock"] as const

export const PERMISSION_MODULES = [
  "fleet",
  "drivers",
  "trips",
  "maintenance",
  "fuel",
  "analytics",
  "settings",
] as const

export const PERMISSION_ACTIONS = [
  "view",
  "create",
  "edit",
  "delete",
] as const

export const ROLE_SLUGS = [
  "FleetManager",
  "Dispatcher",
  "SafetyOfficer",
  "FinancialAnalyst",
] as const

export type VehicleStatus = (typeof VEHICLE_STATUSES)[number]
export type DriverStatus = (typeof DRIVER_STATUSES)[number]
export type TripStatus = (typeof TRIP_STATUSES)[number]
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number]
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]
export type InventoryStatus = (typeof INVENTORY_STATUSES)[number]
export type PermissionModule = (typeof PERMISSION_MODULES)[number]
export type PermissionAction = (typeof PERMISSION_ACTIONS)[number]
export type RoleSlug = (typeof ROLE_SLUGS)[number]

export type PermissionGrant = {
  module: PermissionModule
  action: PermissionAction
}

export type RolePermissionMatrix = Record<
  RoleSlug,
  Partial<Record<PermissionModule, PermissionAction[]>>
>

export const ROLE_NAMES: Record<RoleSlug, string> = {
  FleetManager: "Fleet Manager",
  Dispatcher: "Dispatcher",
  SafetyOfficer: "Safety Officer",
  FinancialAnalyst: "Financial Analyst",
}
