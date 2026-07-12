import { pgEnum } from "drizzle-orm/pg-core"
import {
  DRIVER_STATUSES,
  EXPENSE_CATEGORIES,
  INVENTORY_STATUSES,
  MAINTENANCE_STATUSES,
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  TRIP_STATUSES,
  VEHICLE_STATUSES,
} from "./constants"

export const vehicleStatusEnum = pgEnum("vehicle_status", VEHICLE_STATUSES)

export const driverStatusEnum = pgEnum("driver_status", DRIVER_STATUSES)

export const tripStatusEnum = pgEnum("trip_status", TRIP_STATUSES)

export const maintenanceStatusEnum = pgEnum(
  "maintenance_status",
  MAINTENANCE_STATUSES
)

export const expenseCategoryEnum = pgEnum(
  "expense_category",
  EXPENSE_CATEGORIES
)

export const inventoryStatusEnum = pgEnum(
  "inventory_status",
  INVENTORY_STATUSES
)

export const permissionModuleEnum = pgEnum(
  "permission_module",
  PERMISSION_MODULES
)

export const permissionActionEnum = pgEnum(
  "permission_action",
  PERMISSION_ACTIONS
)
