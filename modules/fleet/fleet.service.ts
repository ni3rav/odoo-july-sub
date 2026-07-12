import { and, asc, eq, ilike, ne, or } from "drizzle-orm"
import { db } from "@/db"
import { driver, vehicle } from "@/db/schema"
import { tryCatch } from "@/lib/try-catch"
import type {
  CreateDriverInput,
  CreateVehicleInput,
  DriverQueryInput,
  UpdateDriverInput,
  UpdateVehicleInput,
  VehicleQueryInput,
} from "@/modules/fleet/fleet.schema"

const UNIQUE_VIOLATION = "23505"

function serializeVehicle(row: typeof vehicle.$inferSelect) {
  return {
    ...row,
    acquisitionCost: Number(row.acquisitionCost),
  }
}

function generateVehicleId() {
  return crypto.randomUUID()
}

export async function listVehicles(filters: VehicleQueryInput) {
  const conditions = []

  if (filters.type) {
    conditions.push(eq(vehicle.type, filters.type))
  }
  if (filters.status) {
    conditions.push(eq(vehicle.status, filters.status))
  }
  if (filters.region) {
    conditions.push(eq(vehicle.region, filters.region))
  }
  if (filters.search) {
    conditions.push(ilike(vehicle.registrationNumber, `%${filters.search}%`))
  }

  const { data: rows, error } = await tryCatch(
    db
      .select()
      .from(vehicle)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(vehicle.registrationNumber))
  )

  if (error || !rows) {
    return { error: error?.message ?? "Failed to load vehicles" }
  }

  return { data: rows.map(serializeVehicle) }
}

export async function createVehicle(input: CreateVehicleInput) {
  const { data: rows, error } = await tryCatch(
    db
      .insert(vehicle)
      .values({
        id: generateVehicleId(),
        registrationNumber: input.registrationNumber,
        name: input.name,
        type: input.type,
        maxLoadCapacityKg: input.maxLoadCapacityKg,
        odometerKm: input.odometerKm,
        acquisitionCost: String(input.acquisitionCost),
        region: input.region,
      })
      .returning()
  )

  if (error || !rows?.[0]) {
    if ((error as { code?: string } | null)?.code === UNIQUE_VIOLATION) {
      return { error: "Registration number already in use" }
    }
    return { error: error?.message ?? "Failed to create vehicle" }
  }

  return { data: serializeVehicle(rows[0]) }
}

export async function updateVehicle(
  vehicleId: string,
  input: UpdateVehicleInput
) {
  const { acquisitionCost, ...rest } = input

  const { data: rows, error } = await tryCatch(
    db
      .update(vehicle)
      .set({
        ...rest,
        ...(acquisitionCost !== undefined
          ? { acquisitionCost: String(acquisitionCost) }
          : {}),
      })
      .where(eq(vehicle.id, vehicleId))
      .returning()
  )

  if (error || !rows?.[0]) {
    if ((error as { code?: string } | null)?.code === UNIQUE_VIOLATION) {
      return { error: "Registration number already in use" }
    }
    return { error: error?.message ?? "Vehicle not found" }
  }

  return { data: serializeVehicle(rows[0]) }
}

export async function retireVehicle(vehicleId: string) {
  const { data: rows, error } = await tryCatch(
    db
      .update(vehicle)
      .set({ status: "Retired" })
      .where(and(eq(vehicle.id, vehicleId), ne(vehicle.status, "Retired")))
      .returning()
  )

  if (error) {
    return { error: error.message }
  }

  if (!rows?.[0]) {
    const existing = await getVehicleById(vehicleId)
    if (!existing) {
      return { error: "Vehicle not found" }
    }
    return { error: "Vehicle is already retired" }
  }

  return { data: serializeVehicle(rows[0]) }
}

async function getVehicleById(vehicleId: string) {
  const { data: rows } = await tryCatch(
    db.select().from(vehicle).where(eq(vehicle.id, vehicleId)).limit(1)
  )
  return rows?.[0] ?? null
}

export async function listDrivers(filters: DriverQueryInput) {
  const conditions = []

  if (filters.status) {
    conditions.push(eq(driver.status, filters.status))
  }
  if (filters.search) {
    conditions.push(
      or(
        ilike(driver.name, `%${filters.search}%`),
        ilike(driver.licenseNumber, `%${filters.search}%`)
      )
    )
  }

  const { data: rows, error } = await tryCatch(
    db
      .select()
      .from(driver)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(driver.name))
  )

  if (error || !rows) {
    return { error: error?.message ?? "Failed to load drivers" }
  }

  return { data: rows }
}

export async function createDriver(input: CreateDriverInput) {
  const { data: rows, error } = await tryCatch(
    db
      .insert(driver)
      .values({
        id: crypto.randomUUID(),
        ...input,
        licenseExpiryDate: new Date(`${input.licenseExpiryDate}T00:00:00.000Z`),
      })
      .returning()
  )

  if (error || !rows?.[0]) {
    if ((error as { code?: string } | null)?.code === UNIQUE_VIOLATION) {
      return { error: "License number already in use" }
    }
    return { error: error?.message ?? "Failed to create driver" }
  }

  return { data: rows[0] }
}

export async function updateDriver(driverId: string, input: UpdateDriverInput) {
  const { licenseExpiryDate, ...rest } = input
  const { data: rows, error } = await tryCatch(
    db
      .update(driver)
      .set({
        ...rest,
        ...(licenseExpiryDate
          ? {
              licenseExpiryDate: new Date(`${licenseExpiryDate}T00:00:00.000Z`),
            }
          : {}),
      })
      .where(eq(driver.id, driverId))
      .returning()
  )

  if (error || !rows?.[0]) {
    if ((error as { code?: string } | null)?.code === UNIQUE_VIOLATION) {
      return { error: "License number already in use" }
    }
    return { error: error?.message ?? "Driver not found" }
  }

  return { data: rows[0] }
}

export async function suspendDriver(driverId: string) {
  const { data: rows, error } = await tryCatch(
    db
      .update(driver)
      .set({ status: "Suspended" })
      .where(
        and(
          eq(driver.id, driverId),
          ne(driver.status, "Suspended"),
          ne(driver.status, "OnTrip")
        )
      )
      .returning()
  )

  if (error) {
    return { error: error.message }
  }

  if (!rows?.[0]) {
    const { data: existing } = await tryCatch(
      db.select().from(driver).where(eq(driver.id, driverId)).limit(1)
    )
    if (!existing?.[0]) {
      return { error: "Driver not found" }
    }
    return {
      error:
        existing[0].status === "OnTrip"
          ? "An active trip driver cannot be suspended"
          : "Driver is already suspended",
    }
  }

  return { data: rows[0] }
}
