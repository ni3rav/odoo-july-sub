import { z } from "zod"
import { MAINTENANCE_STATUSES } from "@/db/schema/constants"
import { nonNegativeNumber, optionalText, requiredText } from "@/lib/zod-fields"

export const maintenanceStatusSchema = z.enum(MAINTENANCE_STATUSES)

export const createMaintenanceSchema = z.object({
  vehicleId: requiredText("Vehicle", 50),
  serviceType: requiredText("Service type", 120),
  date: z.iso.date("Service date must be a valid date"),
  cost: nonNegativeNumber("Cost"),
  notes: optionalText(500),
})

export const updateMaintenanceSchema = createMaintenanceSchema
  .omit({ vehicleId: true })
  .partial()

export const maintenanceQuerySchema = z.object({
  status: maintenanceStatusSchema.optional(),
  vehicleId: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
})

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>
export type MaintenanceQueryInput = z.infer<typeof maintenanceQuerySchema>
