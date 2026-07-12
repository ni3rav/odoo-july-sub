import { Elysia } from "elysia"
import {
  createExpenseSchema,
  createFuelLogSchema,
  createInventoryItemSchema,
  expenseQuerySchema,
  fuelLogQuerySchema,
  inventoryQuerySchema,
  updateInventoryItemSchema,
} from "@/modules/operations/operations.schema"
import {
  createExpense,
  createFuelLog,
  createInventoryItem,
  deleteInventoryItem,
  getCostSummary,
  listExpenses,
  listFuelLogs,
  listInventoryItems,
  updateInventoryItem,
} from "@/modules/operations/operations.service"
import { requirePermission } from "@/middleware/rbac"
import { formatZodIssues } from "@/lib/zod-errors"

export const operationsRoutes = new Elysia({ prefix: "/operations" })
  .group("", (app) =>
    app
      .use(requirePermission("fuel", "view"))
      .get("/fuel-logs", async ({ query, status }) => {
        const parsed = fuelLogQuerySchema.safeParse(query)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await listFuelLogs(parsed.data)
        if (result.error) {
          return status(500, { error: result.error })
        }
        return { fuelLogs: result.data }
      })
      .get("/expenses", async ({ query, status }) => {
        const parsed = expenseQuerySchema.safeParse(query)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await listExpenses(parsed.data)
        if (result.error) {
          return status(500, { error: result.error })
        }
        return { expenses: result.data }
      })
      .get("/inventory", async ({ query, status }) => {
        const parsed = inventoryQuerySchema.safeParse(query)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await listInventoryItems(parsed.data)
        if (result.error) {
          return status(500, { error: result.error })
        }
        return { inventoryItems: result.data }
      })
      .get("/cost-summary", async ({ status }) => {
        const result = await getCostSummary()
        if (result.error) {
          return status(500, { error: result.error })
        }
        return result.data
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("fuel", "create"))
      .post("/fuel-logs", async ({ body, status }) => {
        const parsed = createFuelLogSchema.safeParse(body)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await createFuelLog(parsed.data)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { fuelLog: result.data }
      })
      .post("/expenses", async ({ body, status }) => {
        const parsed = createExpenseSchema.safeParse(body)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await createExpense(parsed.data)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { expense: result.data }
      })
      .post("/inventory", async ({ body, status }) => {
        const parsed = createInventoryItemSchema.safeParse(body)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await createInventoryItem(parsed.data)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { inventoryItem: result.data }
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("fuel", "edit"))
      .put("/inventory/:id", async ({ params, body, status }) => {
        const parsed = updateInventoryItemSchema.safeParse(body)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await updateInventoryItem(params.id, parsed.data)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { inventoryItem: result.data }
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("fuel", "delete"))
      .delete("/inventory/:id", async ({ params, status }) => {
        const result = await deleteInventoryItem(params.id)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { inventoryItem: result.data }
      })
  )
