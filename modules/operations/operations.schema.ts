import { z } from "zod"
import { EXPENSE_CATEGORIES, INVENTORY_STATUSES } from "@/db/schema/constants"
import {
  nonNegativeInt,
  nonNegativeNumber,
  optionalText,
  requiredDateField,
  requiredPositiveNumber,
  requiredText,
} from "@/lib/zod-fields"

export const expenseCategorySchema = z.enum(EXPENSE_CATEGORIES)
export const inventoryStatusSchema = z.enum(INVENTORY_STATUSES)

export const createFuelLogSchema = z.object({
  vehicleId: requiredText("Vehicle", 50),
  tripId: optionalText(50),
  liters: requiredPositiveNumber("Liters"),
  cost: nonNegativeNumber("Cost"),
  date: requiredDateField("Date"),
})

export const fuelLogQuerySchema = z.object({
  vehicleId: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
})

export const createExpenseSchema = z.object({
  vehicleId: requiredText("Vehicle", 50),
  tripId: optionalText(50),
  category: expenseCategorySchema,
  amount: nonNegativeNumber("Amount"),
  date: requiredDateField("Date"),
})

export const expenseQuerySchema = z.object({
  vehicleId: z.string().trim().min(1).optional(),
  category: expenseCategorySchema.optional(),
})

export const createInventoryItemSchema = z.object({
  name: requiredText("Name", 120),
  quantity: nonNegativeInt("Quantity"),
  reorderLevel: nonNegativeInt("Reorder level"),
})

export const updateInventoryItemSchema = createInventoryItemSchema.partial()

export const inventoryQuerySchema = z.object({
  status: inventoryStatusSchema.optional(),
  search: z.string().trim().min(1).optional(),
})

export type CreateFuelLogInput = z.infer<typeof createFuelLogSchema>
export type FuelLogQueryInput = z.infer<typeof fuelLogQuerySchema>
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
export type ExpenseQueryInput = z.infer<typeof expenseQuerySchema>
export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>
export type InventoryQueryInput = z.infer<typeof inventoryQuerySchema>
