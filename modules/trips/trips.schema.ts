import { z } from "zod"
import { TRIP_STATUSES } from "@/db/schema/constants"
import {
  optionalNonNegativeNumber,
  optionalText,
  requiredPositiveInt,
  requiredPositiveNumber,
  requiredText,
} from "@/lib/zod-fields"

export const tripStatusSchema = z.enum(TRIP_STATUSES)

export const createTripSchema = z.object({
  orderId: optionalText(50),
  source: requiredText("Source", 120),
  destination: requiredText("Destination", 120),
  vehicleId: requiredText("Vehicle", 50),
  driverId: requiredText("Driver", 50),
  cargoWeightKg: requiredPositiveInt("Cargo weight"),
  plannedDistanceKm: requiredPositiveInt("Planned distance"),
  revenue: optionalNonNegativeNumber("Revenue"),
})

export function formatCargoCapacityError(
  cargoWeightKg: number,
  maxLoadCapacityKg: number
) {
  const exceeded = cargoWeightKg - maxLoadCapacityKg
  return `Capacity exceeded by ${exceeded} kg — Dispatch blocked`
}

export function buildCreateTripSchema(maxLoadCapacityKg?: number) {
  return createTripSchema.superRefine((data, ctx) => {
    if (maxLoadCapacityKg === undefined || Number.isNaN(data.cargoWeightKg)) {
      return
    }

    if (data.cargoWeightKg > maxLoadCapacityKg) {
      ctx.addIssue({
        code: "custom",
        message: formatCargoCapacityError(
          data.cargoWeightKg,
          maxLoadCapacityKg
        ),
        path: ["cargoWeightKg"],
      })
    }
  })
}

export const updateTripSchema = createTripSchema.partial()

export const tripQuerySchema = z.object({
  status: tripStatusSchema.optional(),
  search: z.string().trim().min(1).optional(),
})

export const completeTripSchema = z.object({
  actualOdometerKm: requiredPositiveInt("Final odometer"),
  fuelConsumedLiters: requiredPositiveNumber("Fuel consumed"),
  revenue: optionalNonNegativeNumber("Revenue"),
})

export type CreateTripInput = z.infer<typeof createTripSchema>
export type UpdateTripInput = z.infer<typeof updateTripSchema>
export type TripQueryInput = z.infer<typeof tripQuerySchema>
export type CompleteTripInput = z.infer<typeof completeTripSchema>
