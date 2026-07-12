import { and, asc, eq, ilike, ne, or } from "drizzle-orm"
import { db } from "@/db"
import { driver, trip, vehicle } from "@/db/schema"
import { tryCatch } from "@/lib/try-catch"
import type {
  CompleteTripInput,
  CreateTripInput,
  TripQueryInput,
  UpdateTripInput,
} from "@/modules/trips/trips.schema"
import { formatCargoCapacityError } from "@/modules/trips/trips.schema"

function generateTripId() {
  return crypto.randomUUID()
}

function generateOrderId() {
  return `TRIP-${Date.now().toString().slice(-6)}`
}

function serializeTrip(row: typeof trip.$inferSelect) {
  return {
    ...row,
    revenue: row.revenue ? Number(row.revenue) : null,
    fuelConsumedLiters: row.fuelConsumedLiters
      ? Number(row.fuelConsumedLiters)
      : null,
  }
}

function isLicenseExpired(expiry: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiryDate = new Date(expiry)
  expiryDate.setHours(0, 0, 0, 0)
  return expiryDate < today
}

function validateDispatchRules(
  tripRow: typeof trip.$inferSelect,
  vehicleRow: typeof vehicle.$inferSelect,
  driverRow: typeof driver.$inferSelect
) {
  const errors: string[] = []

  if (vehicleRow.status === "Retired" || vehicleRow.status === "InShop") {
    errors.push("Selected vehicle is not available for dispatch")
  }
  if (vehicleRow.status === "OnTrip") {
    errors.push("Vehicle is already on trip")
  }
  if (driverRow.status === "Suspended") {
    errors.push("Suspended driver cannot be dispatched")
  }
  if (driverRow.status === "OnTrip") {
    errors.push("Driver is already on trip")
  }
  if (isLicenseExpired(driverRow.licenseExpiryDate)) {
    errors.push("Driver license has expired — Dispatch blocked")
  }
  if (tripRow.cargoWeightKg > vehicleRow.maxLoadCapacityKg) {
    errors.push(
      formatCargoCapacityError(
        tripRow.cargoWeightKg,
        vehicleRow.maxLoadCapacityKg
      )
    )
  }

  return errors
}

export async function listTrips(filters: TripQueryInput) {
  const conditions = []

  if (filters.status) {
    conditions.push(eq(trip.status, filters.status))
  }
  if (filters.search) {
    conditions.push(
      or(
        ilike(trip.orderId, `%${filters.search}%`),
        ilike(trip.source, `%${filters.search}%`),
        ilike(trip.destination, `%${filters.search}%`)
      )
    )
  }

  const { data: rows, error } = await tryCatch(
    db
      .select({
        trip: trip,
        vehicleName: vehicle.name,
        vehicleReg: vehicle.registrationNumber,
        vehicleMaxLoadKg: vehicle.maxLoadCapacityKg,
        driverName: driver.name,
      })
      .from(trip)
      .innerJoin(vehicle, eq(trip.vehicleId, vehicle.id))
      .innerJoin(driver, eq(trip.driverId, driver.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(trip.createdAt))
  )

  if (error || !rows) {
    return { error: error?.message ?? "Failed to load trips" }
  }

  return {
    data: rows.map((row) => ({
      ...serializeTrip(row.trip),
      vehicleName: row.vehicleName,
      vehicleReg: row.vehicleReg,
      vehicleMaxLoadKg: row.vehicleMaxLoadKg,
      driverName: row.driverName,
    })),
  }
}

export async function getTripById(tripId: string) {
  const { data: rows, error } = await tryCatch(
    db
      .select({
        trip: trip,
        vehicleName: vehicle.name,
        vehicleReg: vehicle.registrationNumber,
        vehicleMaxLoadKg: vehicle.maxLoadCapacityKg,
        vehicleStatus: vehicle.status,
        driverName: driver.name,
        driverStatus: driver.status,
        licenseExpiryDate: driver.licenseExpiryDate,
      })
      .from(trip)
      .innerJoin(vehicle, eq(trip.vehicleId, vehicle.id))
      .innerJoin(driver, eq(trip.driverId, driver.id))
      .where(eq(trip.id, tripId))
      .limit(1)
  )

  if (error || !rows?.[0]) {
    return { error: error?.message ?? "Trip not found" }
  }

  const row = rows[0]
  return {
    data: {
      ...serializeTrip(row.trip),
      vehicleName: row.vehicleName,
      vehicleReg: row.vehicleReg,
      vehicleMaxLoadKg: row.vehicleMaxLoadKg,
      vehicleStatus: row.vehicleStatus,
      driverName: row.driverName,
      driverStatus: row.driverStatus,
      licenseExpiryDate: row.licenseExpiryDate,
    },
  }
}

async function loadTripBundle(tripId: string) {
  const { data: tripRow, error: tripError } = await tryCatch(
    db.select().from(trip).where(eq(trip.id, tripId)).limit(1)
  )
  if (tripError || !tripRow?.[0]) {
    return { error: "Trip not found" as const }
  }

  const { data: vehicleRow, error: vehicleError } = await tryCatch(
    db
      .select()
      .from(vehicle)
      .where(eq(vehicle.id, tripRow[0].vehicleId))
      .limit(1)
  )
  if (vehicleError || !vehicleRow?.[0]) {
    return { error: "Vehicle not found" as const }
  }

  const { data: driverRow, error: driverError } = await tryCatch(
    db.select().from(driver).where(eq(driver.id, tripRow[0].driverId)).limit(1)
  )
  if (driverError || !driverRow?.[0]) {
    return { error: "Driver not found" as const }
  }

  return {
    data: {
      trip: tripRow[0],
      vehicle: vehicleRow[0],
      driver: driverRow[0],
    },
  }
}

export async function createTrip(input: CreateTripInput) {
  const bundle = await loadAssignmentEntities(input.vehicleId, input.driverId)
  if (bundle.error || !bundle.data) {
    return { error: bundle.error ?? "Vehicle or driver not found" }
  }

  if (input.cargoWeightKg > bundle.data.vehicle.maxLoadCapacityKg) {
    return {
      error: `cargoWeightKg: ${formatCargoCapacityError(
        input.cargoWeightKg,
        bundle.data.vehicle.maxLoadCapacityKg
      )}`,
    }
  }

  const { data: rows, error } = await tryCatch(
    db
      .insert(trip)
      .values({
        id: generateTripId(),
        orderId: input.orderId?.trim() || generateOrderId(),
        source: input.source,
        destination: input.destination,
        vehicleId: input.vehicleId,
        driverId: input.driverId,
        cargoWeightKg: input.cargoWeightKg,
        plannedDistanceKm: input.plannedDistanceKm,
        revenue:
          input.revenue !== undefined ? String(input.revenue) : undefined,
        status: "Draft",
      })
      .returning()
  )

  if (error || !rows?.[0]) {
    return { error: error?.message ?? "Failed to create trip" }
  }

  return getTripById(rows[0].id)
}

async function loadAssignmentEntities(vehicleId: string, driverId: string) {
  const { data: vehicleRow, error: vehicleError } = await tryCatch(
    db.select().from(vehicle).where(eq(vehicle.id, vehicleId)).limit(1)
  )
  if (vehicleError || !vehicleRow?.[0]) {
    return { error: "Vehicle not found" }
  }

  const { data: driverRow, error: driverError } = await tryCatch(
    db.select().from(driver).where(eq(driver.id, driverId)).limit(1)
  )
  if (driverError || !driverRow?.[0]) {
    return { error: "Driver not found" }
  }

  return { data: { vehicle: vehicleRow[0], driver: driverRow[0] } }
}

export async function updateTrip(tripId: string, input: UpdateTripInput) {
  const existing = await loadTripBundle(tripId)
  if (existing.error) {
    return { error: existing.error }
  }
  if (existing.data.trip.status !== "Draft") {
    return { error: "Only draft trips can be edited" }
  }

  const vehicleId = input.vehicleId ?? existing.data.trip.vehicleId
  const driverId = input.driverId ?? existing.data.trip.driverId
  const cargoWeightKg = input.cargoWeightKg ?? existing.data.trip.cargoWeightKg

  const bundle = await loadAssignmentEntities(vehicleId, driverId)
  if (bundle.error || !bundle.data) {
    return { error: bundle.error ?? "Vehicle or driver not found" }
  }

  if (cargoWeightKg > bundle.data.vehicle.maxLoadCapacityKg) {
    return {
      error: `cargoWeightKg: ${formatCargoCapacityError(
        cargoWeightKg,
        bundle.data.vehicle.maxLoadCapacityKg
      )}`,
    }
  }

  const { revenue, ...rest } = input
  const { data: rows, error } = await tryCatch(
    db
      .update(trip)
      .set({
        ...rest,
        ...(revenue !== undefined ? { revenue: String(revenue) } : {}),
      })
      .where(and(eq(trip.id, tripId), eq(trip.status, "Draft")))
      .returning()
  )

  if (error || !rows?.[0]) {
    return { error: error?.message ?? "Failed to update trip" }
  }

  return getTripById(rows[0].id)
}

export async function deleteTrip(tripId: string) {
  const { data: rows, error } = await tryCatch(
    db
      .delete(trip)
      .where(and(eq(trip.id, tripId), eq(trip.status, "Draft")))
      .returning()
  )

  if (error) {
    return { error: error.message }
  }
  if (!rows?.[0]) {
    return { error: "Only draft trips can be deleted" }
  }

  return { data: serializeTrip(rows[0]) }
}

export async function dispatchTrip(tripId: string) {
  const bundle = await loadTripBundle(tripId)
  if (bundle.error) {
    return { error: bundle.error }
  }

  const { trip: tripRow, vehicle: vehicleRow, driver: driverRow } = bundle.data

  if (tripRow.status !== "Draft") {
    return { error: "Only draft trips can be dispatched" }
  }

  const validationErrors = validateDispatchRules(tripRow, vehicleRow, driverRow)
  if (validationErrors.length > 0) {
    return { error: validationErrors.join(" ") }
  }

  const { error } = await tryCatch(
    db.transaction(async (tx) => {
      const updatedTrips = await tx
        .update(trip)
        .set({ status: "Dispatched" })
        .where(and(eq(trip.id, tripId), eq(trip.status, "Draft")))
        .returning()

      if (!updatedTrips[0]) {
        throw new Error("Failed to dispatch trip")
      }

      const updatedVehicles = await tx
        .update(vehicle)
        .set({ status: "OnTrip" })
        .where(
          and(
            eq(vehicle.id, tripRow.vehicleId),
            eq(vehicle.status, "Available")
          )
        )
        .returning()

      if (!updatedVehicles[0]) {
        throw new Error("Vehicle is no longer available for dispatch")
      }

      const updatedDrivers = await tx
        .update(driver)
        .set({ status: "OnTrip" })
        .where(
          and(eq(driver.id, tripRow.driverId), eq(driver.status, "Available"))
        )
        .returning()

      if (!updatedDrivers[0]) {
        throw new Error("Driver is no longer available for dispatch")
      }
    })
  )

  if (error) {
    return { error: error.message }
  }

  return getTripById(tripId)
}

export async function startTransit(tripId: string) {
  const bundle = await loadTripBundle(tripId)
  if (bundle.error) {
    return { error: bundle.error }
  }

  if (bundle.data.trip.status !== "Dispatched") {
    return { error: "Only dispatched trips can start transit" }
  }

  const { data: rows, error } = await tryCatch(
    db
      .update(trip)
      .set({ status: "InTransit" })
      .where(and(eq(trip.id, tripId), eq(trip.status, "Dispatched")))
      .returning()
  )

  if (error || !rows?.[0]) {
    return { error: error?.message ?? "Failed to start transit" }
  }

  return getTripById(tripId)
}

export async function completeTrip(tripId: string, input: CompleteTripInput) {
  const bundle = await loadTripBundle(tripId)
  if (bundle.error) {
    return { error: bundle.error }
  }

  if (bundle.data.trip.status !== "InTransit") {
    return { error: "Only in-transit trips can be completed" }
  }

  const { error } = await tryCatch(
    db.transaction(async (tx) => {
      await tx
        .update(trip)
        .set({
          status: "Completed",
          actualOdometerKm: input.actualOdometerKm,
          fuelConsumedLiters: String(input.fuelConsumedLiters),
          ...(input.revenue !== undefined
            ? { revenue: String(input.revenue) }
            : {}),
        })
        .where(and(eq(trip.id, tripId), eq(trip.status, "InTransit")))

      await tx
        .update(vehicle)
        .set({
          status: "Available",
          odometerKm: input.actualOdometerKm,
        })
        .where(eq(vehicle.id, bundle.data.trip.vehicleId))

      await tx
        .update(driver)
        .set({ status: "Available" })
        .where(eq(driver.id, bundle.data.trip.driverId))
    })
  )

  if (error) {
    return { error: error.message }
  }

  return getTripById(tripId)
}

export async function cancelTrip(tripId: string) {
  const bundle = await loadTripBundle(tripId)
  if (bundle.error) {
    return { error: bundle.error }
  }

  const currentStatus = bundle.data.trip.status
  if (currentStatus !== "Dispatched" && currentStatus !== "InTransit") {
    return { error: "Only dispatched or in-transit trips can be cancelled" }
  }

  const { error } = await tryCatch(
    db.transaction(async (tx) => {
      await tx
        .update(trip)
        .set({ status: "Cancelled" })
        .where(
          and(
            eq(trip.id, tripId),
            or(eq(trip.status, "Dispatched"), eq(trip.status, "InTransit"))
          )
        )

      await tx
        .update(vehicle)
        .set({ status: "Available" })
        .where(
          and(
            eq(vehicle.id, bundle.data.trip.vehicleId),
            ne(vehicle.status, "Retired")
          )
        )

      await tx
        .update(driver)
        .set({ status: "Available" })
        .where(eq(driver.id, bundle.data.trip.driverId))
    })
  )

  if (error) {
    return { error: error.message }
  }

  return getTripById(tripId)
}

export async function previewDispatchValidation(tripId: string) {
  const bundle = await loadTripBundle(tripId)
  if (bundle.error) {
    return { error: bundle.error }
  }

  if (bundle.data.trip.status !== "Draft") {
    return { data: { errors: [] as string[] } }
  }

  return {
    data: {
      errors: validateDispatchRules(
        bundle.data.trip,
        bundle.data.vehicle,
        bundle.data.driver
      ),
    },
  }
}
