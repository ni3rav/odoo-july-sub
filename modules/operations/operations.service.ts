import { and, asc, desc, eq, ilike } from "drizzle-orm"
import { db } from "@/db"
import {
  expense,
  fuelLog,
  inventoryItem,
  maintenanceRecord,
  trip,
  vehicle,
} from "@/db/schema"
import { tryCatch } from "@/lib/try-catch"
import type {
  CreateExpenseInput,
  CreateFuelLogInput,
  CreateInventoryItemInput,
  ExpenseQueryInput,
  FuelLogQueryInput,
  InventoryQueryInput,
  UpdateInventoryItemInput,
} from "@/modules/operations/operations.schema"

const UNIQUE_VIOLATION = "23505"

function generateId() {
  return crypto.randomUUID()
}

function toDate(value: string) {
  return new Date(`${value}T00:00:00.000Z`)
}

function serializeFuelLog(row: typeof fuelLog.$inferSelect) {
  return {
    ...row,
    liters: Number(row.liters),
    cost: Number(row.cost),
  }
}

function serializeExpense(row: typeof expense.$inferSelect) {
  return {
    ...row,
    amount: Number(row.amount),
  }
}

function computeInventoryStatus(quantity: number, reorderLevel: number) {
  return quantity <= reorderLevel ? ("LowStock" as const) : ("InStock" as const)
}

async function getVehicleById(vehicleId: string) {
  const { data: rows } = await tryCatch(
    db.select().from(vehicle).where(eq(vehicle.id, vehicleId)).limit(1)
  )
  return rows?.[0] ?? null
}

async function getTripById(tripId: string) {
  const { data: rows } = await tryCatch(
    db.select().from(trip).where(eq(trip.id, tripId)).limit(1)
  )
  return rows?.[0] ?? null
}

export async function listFuelLogs(filters: FuelLogQueryInput) {
  const conditions = []

  if (filters.vehicleId) {
    conditions.push(eq(fuelLog.vehicleId, filters.vehicleId))
  }

  const { data: rows, error } = await tryCatch(
    db
      .select({
        fuelLog: fuelLog,
        vehicleName: vehicle.name,
        vehicleReg: vehicle.registrationNumber,
      })
      .from(fuelLog)
      .innerJoin(vehicle, eq(fuelLog.vehicleId, vehicle.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(fuelLog.date))
  )

  if (error || !rows) {
    return { error: error?.message ?? "Failed to load fuel logs" }
  }

  let filteredRows = rows
  if (filters.search) {
    const search = filters.search.toLowerCase()
    filteredRows = rows.filter(
      (row) =>
        row.vehicleName.toLowerCase().includes(search) ||
        row.vehicleReg.toLowerCase().includes(search)
    )
  }

  return {
    data: filteredRows.map((row) => ({
      ...serializeFuelLog(row.fuelLog),
      vehicleName: row.vehicleName,
      vehicleReg: row.vehicleReg,
    })),
  }
}

export async function createFuelLog(input: CreateFuelLogInput) {
  const vehicleRow = await getVehicleById(input.vehicleId)
  if (!vehicleRow) {
    return { error: "Vehicle not found" }
  }

  if (input.tripId) {
    const tripRow = await getTripById(input.tripId)
    if (!tripRow) {
      return { error: "Trip not found" }
    }
  }

  const { data: rows, error } = await tryCatch(
    db
      .insert(fuelLog)
      .values({
        id: generateId(),
        vehicleId: input.vehicleId,
        tripId: input.tripId || null,
        liters: String(input.liters),
        cost: String(input.cost),
        date: toDate(input.date),
      })
      .returning()
  )

  if (error || !rows?.[0]) {
    return { error: error?.message ?? "Failed to log fuel purchase" }
  }

  return {
    data: {
      ...serializeFuelLog(rows[0]),
      vehicleName: vehicleRow.name,
      vehicleReg: vehicleRow.registrationNumber,
    },
  }
}

export async function listExpenses(filters: ExpenseQueryInput) {
  const conditions = []

  if (filters.vehicleId) {
    conditions.push(eq(expense.vehicleId, filters.vehicleId))
  }
  if (filters.category) {
    conditions.push(eq(expense.category, filters.category))
  }

  const { data: rows, error } = await tryCatch(
    db
      .select({
        expense: expense,
        vehicleName: vehicle.name,
        vehicleReg: vehicle.registrationNumber,
        tripOrderId: trip.orderId,
      })
      .from(expense)
      .innerJoin(vehicle, eq(expense.vehicleId, vehicle.id))
      .leftJoin(trip, eq(expense.tripId, trip.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(expense.date))
  )

  if (error || !rows) {
    return { error: error?.message ?? "Failed to load expenses" }
  }

  return {
    data: rows.map((row) => ({
      ...serializeExpense(row.expense),
      vehicleName: row.vehicleName,
      vehicleReg: row.vehicleReg,
      tripOrderId: row.tripOrderId,
    })),
  }
}

export async function createExpense(input: CreateExpenseInput) {
  const vehicleRow = await getVehicleById(input.vehicleId)
  if (!vehicleRow) {
    return { error: "Vehicle not found" }
  }

  let tripOrderId: string | null = null
  if (input.tripId) {
    const tripRow = await getTripById(input.tripId)
    if (!tripRow) {
      return { error: "Trip not found" }
    }
    tripOrderId = tripRow.orderId
  }

  const { data: rows, error } = await tryCatch(
    db
      .insert(expense)
      .values({
        id: generateId(),
        vehicleId: input.vehicleId,
        tripId: input.tripId || null,
        category: input.category,
        amount: String(input.amount),
        date: toDate(input.date),
      })
      .returning()
  )

  if (error || !rows?.[0]) {
    return { error: error?.message ?? "Failed to record expense" }
  }

  return {
    data: {
      ...serializeExpense(rows[0]),
      vehicleName: vehicleRow.name,
      vehicleReg: vehicleRow.registrationNumber,
      tripOrderId,
    },
  }
}

export async function listInventoryItems(filters: InventoryQueryInput) {
  const conditions = []

  if (filters.status) {
    conditions.push(eq(inventoryItem.status, filters.status))
  }
  if (filters.search) {
    conditions.push(ilike(inventoryItem.name, `%${filters.search}%`))
  }

  const { data: rows, error } = await tryCatch(
    db
      .select()
      .from(inventoryItem)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(inventoryItem.name))
  )

  if (error || !rows) {
    return { error: error?.message ?? "Failed to load inventory" }
  }

  return { data: rows }
}

export async function createInventoryItem(input: CreateInventoryItemInput) {
  const { data: rows, error } = await tryCatch(
    db
      .insert(inventoryItem)
      .values({
        id: generateId(),
        name: input.name,
        quantity: input.quantity,
        reorderLevel: input.reorderLevel,
        status: computeInventoryStatus(input.quantity, input.reorderLevel),
      })
      .returning()
  )

  if (error || !rows?.[0]) {
    if ((error as { code?: string } | null)?.code === UNIQUE_VIOLATION) {
      return { error: "Inventory item already exists" }
    }
    return { error: error?.message ?? "Failed to create inventory item" }
  }

  return { data: rows[0] }
}

export async function updateInventoryItem(
  itemId: string,
  input: UpdateInventoryItemInput
) {
  const { data: existingRows, error: existingError } = await tryCatch(
    db.select().from(inventoryItem).where(eq(inventoryItem.id, itemId)).limit(1)
  )
  if (existingError || !existingRows?.[0]) {
    return { error: "Inventory item not found" }
  }

  const quantity = input.quantity ?? existingRows[0].quantity
  const reorderLevel = input.reorderLevel ?? existingRows[0].reorderLevel

  const { data: rows, error } = await tryCatch(
    db
      .update(inventoryItem)
      .set({
        ...input,
        status: computeInventoryStatus(quantity, reorderLevel),
      })
      .where(eq(inventoryItem.id, itemId))
      .returning()
  )

  if (error || !rows?.[0]) {
    return { error: error?.message ?? "Failed to update inventory item" }
  }

  return { data: rows[0] }
}

export async function deleteInventoryItem(itemId: string) {
  const { data: rows, error } = await tryCatch(
    db.delete(inventoryItem).where(eq(inventoryItem.id, itemId)).returning()
  )

  if (error) {
    return { error: error.message }
  }
  if (!rows?.[0]) {
    return { error: "Inventory item not found" }
  }

  return { data: rows[0] }
}

export async function getCostSummary() {
  const vehiclesResult = await tryCatch(db.select().from(vehicle))
  if (vehiclesResult.error) {
    return { error: vehiclesResult.error.message }
  }
  const vehicles = vehiclesResult.data

  const fuelLogsResult = await tryCatch(db.select().from(fuelLog))
  if (fuelLogsResult.error) {
    return { error: fuelLogsResult.error.message }
  }
  const fuelLogs = fuelLogsResult.data

  const maintenanceResult = await tryCatch(db.select().from(maintenanceRecord))
  if (maintenanceResult.error) {
    return { error: maintenanceResult.error.message }
  }
  const maintenanceRecords = maintenanceResult.data

  const expensesResult = await tryCatch(db.select().from(expense))
  if (expensesResult.error) {
    return { error: expensesResult.error.message }
  }
  const expenses = expensesResult.data

  const byVehicle = vehicles.map((v) => {
    const fuelCost = fuelLogs
      .filter((log) => log.vehicleId === v.id)
      .reduce((acc, log) => acc + Number(log.cost), 0)
    const maintenanceCost = maintenanceRecords
      .filter((record) => record.vehicleId === v.id)
      .reduce((acc, record) => acc + Number(record.cost), 0)
    const expenseCost = expenses
      .filter((exp) => exp.vehicleId === v.id)
      .reduce((acc, exp) => acc + Number(exp.amount), 0)

    return {
      vehicleId: v.id,
      vehicleName: v.name,
      vehicleReg: v.registrationNumber,
      fuelCost,
      maintenanceCost,
      expenseCost,
      totalCost: fuelCost + maintenanceCost + expenseCost,
    }
  })

  byVehicle.sort((a, b) => b.totalCost - a.totalCost)

  const fleetTotal = byVehicle.reduce((acc, row) => acc + row.totalCost, 0)

  return { data: { fleetTotal, byVehicle } }
}
