import { Elysia } from "elysia"
import {
  createMaintenanceSchema,
  maintenanceQuerySchema,
  updateMaintenanceSchema,
} from "@/modules/operations/operations.schema"
import {
  closeMaintenanceRecord,
  createMaintenanceRecord,
  deleteMaintenanceRecord,
  getMaintenanceById,
  listMaintenanceRecords,
  updateMaintenanceRecord,
} from "@/modules/operations/operations.service"
import { requirePermission } from "@/middleware/rbac"
import { formatZodIssues } from "@/lib/zod-errors"

export const operationsRoutes = new Elysia({ prefix: "/maintenance" })
  .group("", (app) =>
    app
      .use(requirePermission("maintenance", "view"))
      .get("/", async ({ query, status }) => {
        const parsed = maintenanceQuerySchema.safeParse(query)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await listMaintenanceRecords(parsed.data)
        if (result.error) {
          return status(500, { error: result.error })
        }
        return { records: result.data }
      })
      .get("/:id", async ({ params, status }) => {
        const result = await getMaintenanceById(params.id)
        if (result.error) {
          return status(404, { error: result.error })
        }
        return { record: result.data }
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("maintenance", "create"))
      .post("/", async ({ body, status }) => {
        const parsed = createMaintenanceSchema.safeParse(body)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await createMaintenanceRecord(parsed.data)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { record: result.data }
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("maintenance", "edit"))
      .put("/:id", async ({ params, body, status }) => {
        const parsed = updateMaintenanceSchema.safeParse(body)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await updateMaintenanceRecord(params.id, parsed.data)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { record: result.data }
      })
      .post("/:id/close", async ({ params, status }) => {
        const result = await closeMaintenanceRecord(params.id)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { record: result.data }
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("maintenance", "delete"))
      .delete("/:id", async ({ params, status }) => {
        const result = await deleteMaintenanceRecord(params.id)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { record: result.data }
      })
  )
