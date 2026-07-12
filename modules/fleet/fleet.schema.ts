import { z } from "zod"
import { VEHICLE_STATUSES } from "@/db/schema/constants"

export const vehicleStatusSchema = z.enum(VEHICLE_STATUSES)

export const createVehicleSchema = z.object({
  registrationNumber: z.string().trim().min(1).max(32),
  name: z.string().trim().min(1).max(120),
  type: z.string().trim().min(1).max(50),
  maxLoadCapacityKg: z.number().int().positive(),
  odometerKm: z.number().int().nonnegative(),
  acquisitionCost: z.number().nonnegative(),
  region: z.string().trim().min(1).max(50),
})

export const updateVehicleSchema = createVehicleSchema.partial()

export const vehicleQuerySchema = z.object({
  type: z.string().trim().min(1).optional(),
  status: vehicleStatusSchema.optional(),
  region: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
})

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>
export type VehicleQueryInput = z.infer<typeof vehicleQuerySchema>
