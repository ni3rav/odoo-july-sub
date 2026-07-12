import { Elysia } from "elysia"
import {
  completeTripSchema,
  createTripSchema,
  tripQuerySchema,
  updateTripSchema,
} from "@/modules/trips/trips.schema"
import {
  cancelTrip,
  completeTrip,
  createTrip,
  deleteTrip,
  dispatchTrip,
  getTripById,
  listTrips,
  previewDispatchValidation,
  startTransit,
  updateTrip,
} from "@/modules/trips/trips.service"
import { requirePermission } from "@/middleware/rbac"
import { formatZodIssues } from "@/lib/zod-errors"

export const tripsRoutes = new Elysia({ prefix: "/trips" })
  .group("", (app) =>
    app
      .use(requirePermission("trips", "view"))
      .get("/", async ({ query, status }) => {
        const parsed = tripQuerySchema.safeParse(query)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await listTrips(parsed.data)
        if (result.error) {
          return status(500, { error: result.error })
        }
        return { trips: result.data }
      })
      .get("/:id", async ({ params, status }) => {
        const result = await getTripById(params.id)
        if (result.error) {
          return status(404, { error: result.error })
        }
        return { trip: result.data }
      })
      .get("/:id/dispatch-preview", async ({ params, status }) => {
        const result = await previewDispatchValidation(params.id)
        if (result.error) {
          return status(404, { error: result.error })
        }
        return result.data
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("trips", "create"))
      .post("/", async ({ body, status }) => {
        const parsed = createTripSchema.safeParse(body)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await createTrip(parsed.data)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { trip: result.data }
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("trips", "edit"))
      .put("/:id", async ({ params, body, status }) => {
        const parsed = updateTripSchema.safeParse(body)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await updateTrip(params.id, parsed.data)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { trip: result.data }
      })
      .post("/:id/dispatch", async ({ params, status }) => {
        const result = await dispatchTrip(params.id)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { trip: result.data }
      })
      .post("/:id/start-transit", async ({ params, status }) => {
        const result = await startTransit(params.id)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { trip: result.data }
      })
      .post("/:id/complete", async ({ body, params, status }) => {
        const parsed = completeTripSchema.safeParse(body)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await completeTrip(params.id, parsed.data)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { trip: result.data }
      })
      .post("/:id/cancel", async ({ params, status }) => {
        const result = await cancelTrip(params.id)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { trip: result.data }
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("trips", "delete"))
      .delete("/:id", async ({ params, status }) => {
        const result = await deleteTrip(params.id)
        if (result.error) {
          return status(409, { error: result.error })
        }
        return { trip: result.data }
      })
  )
