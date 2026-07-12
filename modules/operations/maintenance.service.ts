import { and, asc, desc, eq, ilike, or } from "drizzle-orm"
import { db } from "@/db"
import { maintenanceRecord, vehicle } from "@/db/schema"
import { tryCatch } from "@/lib/try-catch"
import type {
  CreateMaintenanceInput,
  MaintenanceQueryInput,
  UpdateMaintenanceInput,
} from "@/modules/operations/operations.schema"

function generateMaintenanceId() {
  return crypto.randomUUID()
}

function serializeMaintenance(
  row: typeof maintenanceRecord.$inferSelect,
  vehicleRow?: typeof vehicle.$inferSelect
) {
  return {
    ...row,
    cost: Number(row.cost),
    vehicleName: vehicleRow?.name ?? "",
    vehicleReg: vehicleRow?.registrationNumber ?? "",
    vehicleStatus: vehicleRow?.status,
  }
}

export async function listMaintenanceRecords(filters: MaintenanceQueryInput) {
  const conditions = []

  if (filters.status) {
    conditions.push(eq(maintenanceRecord.status, filters.status))
  }
  if (filters.vehicleId) {
    conditions.push(eq(maintenanceRecord.vehicleId, filters.vehicleId))
  }
  if (filters.search) {
    conditions.push(
      or(
        ilike(maintenanceRecord.serviceType, `%${filters.search}%`),
        ilike(maintenanceRecord.notes, `%${filters.search}%`),
        ilike(vehicle.registrationNumber, `%${filters.search}%`),
        ilike(vehicle.name, `%${filters.search}%`)
      )
    )
  }

  const { data: rows, error } = await tryCatch(
    db
      .select({
        record: maintenanceRecord,
        vehicle,
      })
      .from(maintenanceRecord)
      .innerJoin(vehicle, eq(maintenanceRecord.vehicleId, vehicle.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(maintenanceRecord.date), desc(maintenanceRecord.createdAt))
  )

  if (error || !rows) {
    return { error: error?.message ?? "Failed to load maintenance records" }
  }

  return {
    data: rows.map((row) => serializeMaintenance(row.record, row.vehicle)),
  }
}

export async function getMaintenanceById(recordId: string) {
  const { data: rows, error } = await tryCatch(
    db
      .select({
        record: maintenanceRecord,
        vehicle,
      })
      .from(maintenanceRecord)
      .innerJoin(vehicle, eq(maintenanceRecord.vehicleId, vehicle.id))
      .where(eq(maintenanceRecord.id, recordId))
      .limit(1)
  )

  if (error || !rows?.[0]) {
    return { error: "Maintenance record not found" }
  }

  return {
    data: serializeMaintenance(rows[0].record, rows[0].vehicle),
  }
}

async function loadVehicleForMaintenance(vehicleId: string) {
  const { data: rows, error } = await tryCatch(
    db.select().from(vehicle).where(eq(vehicle.id, vehicleId)).limit(1)
  )

  if (error || !rows?.[0]) {
    return { error: "Vehicle not found" }
  }

  return { data: rows[0] }
}

async function hasOpenMaintenance(vehicleId: string, excludeId?: string) {
  const conditions = [
    eq(maintenanceRecord.vehicleId, vehicleId),
    eq(maintenanceRecord.status, "Open"),
  ]

  const { data: rows, error } = await tryCatch(
    db
      .select({ id: maintenanceRecord.id })
      .from(maintenanceRecord)
      .where(and(...conditions))
      .orderBy(asc(maintenanceRecord.createdAt))
  )

  if (error || !rows) {
    return { error: error?.message ?? "Failed to check maintenance records" }
  }

  const openRecord = rows.find((row) => row.id !== excludeId)
  return { data: Boolean(openRecord) }
}

export async function createMaintenanceRecord(input: CreateMaintenanceInput) {
  const vehicleResult = await loadVehicleForMaintenance(input.vehicleId)
  if (vehicleResult.error || !vehicleResult.data) {
    return { error: vehicleResult.error ?? "Vehicle not found" }
  }

  const vehicleRow = vehicleResult.data

  if (vehicleRow.status === "Retired") {
    return { error: "Retired vehicles cannot be sent to maintenance" }
  }
  if (vehicleRow.status === "OnTrip") {
    return { error: "Vehicles on trip cannot be sent to maintenance" }
  }
  if (vehicleRow.status === "InShop") {
    return { error: "Vehicle already has an open maintenance record" }
  }

  const openCheck = await hasOpenMaintenance(input.vehicleId)
  if (openCheck.error) {
    return { error: openCheck.error }
  }
  if (openCheck.data) {
    return { error: "Vehicle already has an open maintenance record" }
  }

  const recordId = generateMaintenanceId()

  const { error } = await tryCatch(
    db.transaction(async (tx) => {
      const inserted = await tx
        .insert(maintenanceRecord)
        .values({
          id: recordId,
          vehicleId: input.vehicleId,
          serviceType: input.serviceType,
          date: new Date(input.date),
          cost: String(input.cost),
          notes: input.notes?.trim() || null,
          status: "Open",
        })
        .returning()

      if (!inserted[0]) {
        throw new Error("Failed to create maintenance record")
      }

      const updatedVehicle = await tx
        .update(vehicle)
        .set({ status: "InShop" })
        .where(
          and(eq(vehicle.id, input.vehicleId), eq(vehicle.status, "Available"))
        )
        .returning()

      if (!updatedVehicle[0]) {
        throw new Error("Vehicle is no longer available for maintenance")
      }
    })
  )

  if (error) {
    return { error: error.message }
  }

  return getMaintenanceById(recordId)
}

export async function updateMaintenanceRecord(
  recordId: string,
  input: UpdateMaintenanceInput
) {
  const existing = await getMaintenanceById(recordId)
  if (existing.error || !existing.data) {
    return { error: existing.error ?? "Maintenance record not found" }
  }
  if (existing.data.status !== "Open") {
    return { error: "Only open maintenance records can be edited" }
  }

  const { data: rows, error } = await tryCatch(
    db
      .update(maintenanceRecord)
      .set({
        ...(input.serviceType !== undefined
          ? { serviceType: input.serviceType }
          : {}),
        ...(input.date !== undefined ? { date: new Date(input.date) } : {}),
        ...(input.cost !== undefined ? { cost: String(input.cost) } : {}),
        ...(input.notes !== undefined
          ? { notes: input.notes?.trim() || null }
          : {}),
      })
      .where(
        and(
          eq(maintenanceRecord.id, recordId),
          eq(maintenanceRecord.status, "Open")
        )
      )
      .returning()
  )

  if (error || !rows?.[0]) {
    return { error: error?.message ?? "Failed to update maintenance record" }
  }

  return getMaintenanceById(rows[0].id)
}

export async function closeMaintenanceRecord(recordId: string) {
  const existing = await getMaintenanceById(recordId)
  if (existing.error || !existing.data) {
    return { error: existing.error ?? "Maintenance record not found" }
  }
  if (existing.data.status !== "Open") {
    return { error: "Only open maintenance records can be closed" }
  }

  const { error } = await tryCatch(
    db.transaction(async (tx) => {
      const updatedRecords = await tx
        .update(maintenanceRecord)
        .set({ status: "Completed" })
        .where(
          and(
            eq(maintenanceRecord.id, recordId),
            eq(maintenanceRecord.status, "Open")
          )
        )
        .returning()

      if (!updatedRecords[0]) {
        throw new Error("Failed to close maintenance record")
      }

      const vehicleRow = await tx
        .select()
        .from(vehicle)
        .where(eq(vehicle.id, updatedRecords[0].vehicleId))
        .limit(1)

      const currentVehicle = vehicleRow[0]
      if (!currentVehicle) {
        throw new Error("Vehicle not found")
      }

      if (currentVehicle.status === "Retired") {
        return
      }

      const updatedVehicle = await tx
        .update(vehicle)
        .set({ status: "Available" })
        .where(
          and(
            eq(vehicle.id, updatedRecords[0].vehicleId),
            eq(vehicle.status, "InShop")
          )
        )
        .returning()

      if (!updatedVehicle[0]) {
        throw new Error("Vehicle is not currently in maintenance")
      }
    })
  )

  if (error) {
    return { error: error.message }
  }

  return getMaintenanceById(recordId)
}

export async function deleteMaintenanceRecord(recordId: string) {
  const existing = await getMaintenanceById(recordId)
  if (existing.error || !existing.data) {
    return { error: existing.error ?? "Maintenance record not found" }
  }
  if (existing.data.status !== "Open") {
    return { error: "Only open maintenance records can be deleted" }
  }

  const vehicleId = existing.data.vehicleId

  const { error } = await tryCatch(
    db.transaction(async (tx) => {
      const deleted = await tx
        .delete(maintenanceRecord)
        .where(
          and(
            eq(maintenanceRecord.id, recordId),
            eq(maintenanceRecord.status, "Open")
          )
        )
        .returning()

      if (!deleted[0]) {
        throw new Error("Failed to delete maintenance record")
      }

      const vehicleRow = await tx
        .select()
        .from(vehicle)
        .where(eq(vehicle.id, vehicleId))
        .limit(1)

      const currentVehicle = vehicleRow[0]
      if (!currentVehicle || currentVehicle.status !== "InShop") {
        return
      }

      const remainingOpen = await tx
        .select({ id: maintenanceRecord.id })
        .from(maintenanceRecord)
        .where(
          and(
            eq(maintenanceRecord.vehicleId, vehicleId),
            eq(maintenanceRecord.status, "Open")
          )
        )
        .limit(1)

      if (remainingOpen[0]) {
        return
      }

      await tx
        .update(vehicle)
        .set({ status: "Available" })
        .where(and(eq(vehicle.id, vehicleId), eq(vehicle.status, "InShop")))
    })
  )

  if (error) {
    return { error: error.message }
  }

  return { data: existing.data }
}
