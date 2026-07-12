import { Elysia } from "elysia"
import {
  createDriverSchema,
  createVehicleSchema,
  driverQuerySchema,
  updateDriverSchema,
  updateVehicleSchema,
  vehicleQuerySchema,
} from "@/modules/fleet/fleet.schema"
import {
  createDriver,
  createVehicle,
  listDrivers,
  listVehicles,
  retireVehicle,
  suspendDriver,
  updateDriver,
  updateVehicle,
} from "@/modules/fleet/fleet.service"
import { requirePermission } from "@/middleware/rbac"
import { formatZodIssues } from "@/lib/zod-errors"

export const fleetRoutes = new Elysia({ prefix: "/fleet" })
  .group("", (app) =>
    app
      .use(requirePermission("fleet", "view"))
      .get("/vehicles", async ({ query, status }) => {
        const parsed = vehicleQuerySchema.safeParse(query)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await listVehicles(parsed.data)
        if (result.error) {
          return status(500, { error: result.error })
        }
        return { vehicles: result.data }
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("drivers", "view"))
      .get("/drivers", async ({ query, status }) => {
        const parsed = driverQuerySchema.safeParse(query)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await listDrivers(parsed.data)
        if (result.error) {
          return status(500, { error: result.error })
        }
        return { drivers: result.data }
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("drivers", "create"))
      .post("/drivers", async ({ body, status }) => {
        const parsed = createDriverSchema.safeParse(body)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await createDriver(parsed.data)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { driver: result.data }
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("drivers", "edit"))
      .put("/drivers/:id", async ({ params, body, status }) => {
        const parsed = updateDriverSchema.safeParse(body)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await updateDriver(params.id, parsed.data)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { driver: result.data }
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("drivers", "delete"))
      .patch("/drivers/:id/suspend", async ({ params, status }) => {
        const result = await suspendDriver(params.id)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { driver: result.data }
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("fleet", "create"))
      .post("/vehicles", async ({ body, status }) => {
        const parsed = createVehicleSchema.safeParse(body)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await createVehicle(parsed.data)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { vehicle: result.data }
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("fleet", "edit"))
      .put("/vehicles/:id", async ({ params, body, status }) => {
        const parsed = updateVehicleSchema.safeParse(body)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await updateVehicle(params.id, parsed.data)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { vehicle: result.data }
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("fleet", "delete"))
      .patch("/vehicles/:id/retire", async ({ params, status }) => {
        const result = await retireVehicle(params.id)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { vehicle: result.data }
      })
  )
