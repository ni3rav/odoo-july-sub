import { z } from "zod"
import { DRIVER_STATUSES, VEHICLE_STATUSES } from "@/db/schema/constants"

export const vehicleStatusSchema = z.enum(VEHICLE_STATUSES)
export const driverStatusSchema = z.enum(DRIVER_STATUSES)

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

export const createDriverSchema = z.object({
  name: z.string().trim().min(1).max(120),
  licenseNumber: z.string().trim().min(1).max(50),
  licenseCategory: z.string().trim().min(1).max(50),
  licenseExpiryDate: z.iso.date(),
  contactNumber: z.string().trim().min(1).max(30),
  safetyScore: z.number().int().min(0).max(100),
})

export const updateDriverSchema = createDriverSchema.partial()

export const driverQuerySchema = z.object({
  status: driverStatusSchema.optional(),
  search: z.string().trim().min(1).optional(),
})

export type CreateDriverInput = z.infer<typeof createDriverSchema>
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>
export type DriverQueryInput = z.infer<typeof driverQuerySchema>
