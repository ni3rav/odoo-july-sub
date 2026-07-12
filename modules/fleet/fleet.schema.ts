import { z } from "zod"
import { DRIVER_STATUSES, VEHICLE_STATUSES } from "@/db/schema/constants"
import {
  nonNegativeInt,
  nonNegativeNumber,
  requiredPositiveInt,
  requiredText,
  safetyScoreField,
  requiredDateField,
} from "@/lib/zod-fields"

export const vehicleStatusSchema = z.enum(VEHICLE_STATUSES)
export const driverStatusSchema = z.enum(DRIVER_STATUSES)

export const createVehicleSchema = z.object({
  registrationNumber: requiredText("Registration number", 32),
  name: requiredText("Name", 120),
  type: requiredText("Type", 50),
  maxLoadCapacityKg: requiredPositiveInt("Max load capacity"),
  odometerKm: nonNegativeInt("Odometer"),
  acquisitionCost: nonNegativeNumber("Acquisition cost"),
  region: requiredText("Region", 50),
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
  name: requiredText("Name", 120),
  licenseNumber: requiredText("License number", 50),
  licenseCategory: requiredText("License category", 50),
  licenseExpiryDate: requiredDateField("License expiry"),
  contactNumber: requiredText("Contact number", 30),
  safetyScore: safetyScoreField(),
})

export const updateDriverSchema = createDriverSchema.partial()

export const driverQuerySchema = z.object({
  status: driverStatusSchema.optional(),
  search: z.string().trim().min(1).optional(),
})

export type CreateDriverInput = z.infer<typeof createDriverSchema>
export type UpdateDriverInput = z.infer<typeof updateDriverSchema>
export type DriverQueryInput = z.infer<typeof driverQuerySchema>
