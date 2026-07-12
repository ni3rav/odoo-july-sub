import { z } from "zod"
import { TRIP_STATUSES } from "@/db/schema/constants"

export const tripStatusSchema = z.enum(TRIP_STATUSES)

export const createTripSchema = z.object({
  orderId: z.string().trim().max(50).optional(),
  source: z.string().trim().min(1).max(120),
  destination: z.string().trim().min(1).max(120),
  vehicleId: z.string().trim().min(1),
  driverId: z.string().trim().min(1),
  cargoWeightKg: z.number().int().positive(),
  plannedDistanceKm: z.number().int().positive(),
  revenue: z.number().nonnegative().optional(),
})

export const updateTripSchema = createTripSchema.partial()

export const tripQuerySchema = z.object({
  status: tripStatusSchema.optional(),
  search: z.string().trim().min(1).optional(),
})

export const completeTripSchema = z.object({
  actualOdometerKm: z.number().int().positive(),
  fuelConsumedLiters: z.number().positive(),
  revenue: z.number().nonnegative().optional(),
})

export type CreateTripInput = z.infer<typeof createTripSchema>
export type UpdateTripInput = z.infer<typeof updateTripSchema>
export type TripQueryInput = z.infer<typeof tripQuerySchema>
export type CompleteTripInput = z.infer<typeof completeTripSchema>
