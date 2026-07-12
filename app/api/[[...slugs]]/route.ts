import { Elysia } from "elysia"
import { authRoutes } from "@/modules/auth/auth.route"
import { rbacRoutes } from "@/modules/rbac/rbac.route"
import { fleetRoutes } from "@/modules/fleet/fleet.route"
import {
  operationsRoutes,
  maintenanceRoutes,
} from "@/modules/operations/operations.route"
import { reportsRoutes } from "@/modules/reports/reports.route"
import { tripsRoutes } from "@/modules/trips/trips.route"

const app = new Elysia({ prefix: "/api" })
  .use(authRoutes)
  .use(rbacRoutes)
  .use(fleetRoutes)
  .use(tripsRoutes)
  .use(maintenanceRoutes)
  .use(operationsRoutes)
  .use(reportsRoutes)
  .get("/health", () => ({ status: "ok" }))

export type App = typeof app

export const GET = app.fetch
export const POST = app.fetch
export const PUT = app.fetch
export const DELETE = app.fetch
export const PATCH = app.fetch
