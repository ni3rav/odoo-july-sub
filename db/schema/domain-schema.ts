import { relations } from "drizzle-orm"
import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core"
import {
  driverStatusEnum,
  expenseCategoryEnum,
  inventoryStatusEnum,
  maintenanceStatusEnum,
  tripStatusEnum,
  vehicleStatusEnum,
} from "./enums"

export const vehicle = pgTable(
  "vehicle",
  {
    id: text("id").primaryKey(),
    registrationNumber: text("registration_number").notNull().unique(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    maxLoadCapacityKg: integer("max_load_capacity_kg").notNull(),
    odometerKm: integer("odometer_km").notNull().default(0),
    acquisitionCost: numeric("acquisition_cost", {
      precision: 12,
      scale: 2,
    }).notNull(),
    region: text("region").notNull(),
    status: vehicleStatusEnum("status").notNull().default("Available"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("vehicle_status_idx").on(table.status),
    index("vehicle_region_idx").on(table.region),
  ]
)

export const driver = pgTable(
  "driver",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    licenseNumber: text("license_number").notNull().unique(),
    licenseCategory: text("license_category").notNull(),
    licenseExpiryDate: timestamp("license_expiry_date").notNull(),
    contactNumber: text("contact_number").notNull(),
    safetyScore: integer("safety_score").notNull().default(100),
    status: driverStatusEnum("status").notNull().default("Available"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("driver_status_idx").on(table.status)]
)

export const trip = pgTable(
  "trip",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id").notNull(),
    source: text("source").notNull(),
    destination: text("destination").notNull(),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicle.id),
    driverId: text("driver_id")
      .notNull()
      .references(() => driver.id),
    cargoWeightKg: integer("cargo_weight_kg").notNull(),
    plannedDistanceKm: integer("planned_distance_km").notNull(),
    actualOdometerKm: integer("actual_odometer_km"),
    fuelConsumedLiters: numeric("fuel_consumed_liters", {
      precision: 10,
      scale: 2,
    }),
    revenue: numeric("revenue", { precision: 12, scale: 2 }),
    status: tripStatusEnum("status").notNull().default("Draft"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("trip_status_idx").on(table.status),
    index("trip_vehicleId_idx").on(table.vehicleId),
    index("trip_driverId_idx").on(table.driverId),
  ]
)

export const maintenanceRecord = pgTable(
  "maintenance_record",
  {
    id: text("id").primaryKey(),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicle.id),
    serviceType: text("service_type").notNull(),
    date: timestamp("date").notNull(),
    cost: numeric("cost", { precision: 12, scale: 2 }).notNull(),
    notes: text("notes"),
    status: maintenanceStatusEnum("status").notNull().default("Open"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("maintenance_record_vehicleId_idx").on(table.vehicleId)]
)

export const fuelLog = pgTable(
  "fuel_log",
  {
    id: text("id").primaryKey(),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicle.id),
    tripId: text("trip_id").references(() => trip.id),
    liters: numeric("liters", { precision: 10, scale: 2 }).notNull(),
    cost: numeric("cost", { precision: 12, scale: 2 }).notNull(),
    date: timestamp("date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("fuel_log_vehicleId_idx").on(table.vehicleId)]
)

export const expense = pgTable(
  "expense",
  {
    id: text("id").primaryKey(),
    vehicleId: text("vehicle_id")
      .notNull()
      .references(() => vehicle.id),
    tripId: text("trip_id").references(() => trip.id),
    category: expenseCategoryEnum("category").notNull(),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    date: timestamp("date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("expense_vehicleId_idx").on(table.vehicleId)]
)

export const inventoryItem = pgTable("inventory_item", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(0),
  reorderLevel: integer("reorder_level").notNull().default(0),
  status: inventoryStatusEnum("status").notNull().default("InStock"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const vehicleRelations = relations(vehicle, ({ many }) => ({
  trips: many(trip),
  maintenanceRecords: many(maintenanceRecord),
  fuelLogs: many(fuelLog),
  expenses: many(expense),
}))

export const driverRelations = relations(driver, ({ many }) => ({
  trips: many(trip),
}))

export const tripRelations = relations(trip, ({ one, many }) => ({
  vehicle: one(vehicle, {
    fields: [trip.vehicleId],
    references: [vehicle.id],
  }),
  driver: one(driver, {
    fields: [trip.driverId],
    references: [driver.id],
  }),
  fuelLogs: many(fuelLog),
  expenses: many(expense),
}))

export const maintenanceRecordRelations = relations(
  maintenanceRecord,
  ({ one }) => ({
    vehicle: one(vehicle, {
      fields: [maintenanceRecord.vehicleId],
      references: [vehicle.id],
    }),
  })
)

export const fuelLogRelations = relations(fuelLog, ({ one }) => ({
  vehicle: one(vehicle, {
    fields: [fuelLog.vehicleId],
    references: [vehicle.id],
  }),
  trip: one(trip, {
    fields: [fuelLog.tripId],
    references: [trip.id],
  }),
}))

export const expenseRelations = relations(expense, ({ one }) => ({
  vehicle: one(vehicle, {
    fields: [expense.vehicleId],
    references: [vehicle.id],
  }),
  trip: one(trip, {
    fields: [expense.tripId],
    references: [trip.id],
  }),
}))
