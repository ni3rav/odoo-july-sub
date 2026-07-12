import { Elysia, t } from "elysia"
import { requireAuth } from "@/middleware/auth"
import { requirePermission } from "@/middleware/rbac"
import {
  getDashboardKPIs,
  getAnalyticsData,
  generateCSVExport,
} from "./reports.service"

export const reportsRoutes = new Elysia({ prefix: "/reports" })
  .use(requireAuth)
  .get(
    "/dashboard-kpis",
    async ({ query }) => {
      return getDashboardKPIs(query)
    },
    {
      query: t.Optional(
        t.Object({
          type: t.Optional(t.String()),
          status: t.Optional(t.String()),
          region: t.Optional(t.String()),
        })
      ),
    }
  )
  .group("", (app) =>
    app
      .use(requirePermission("analytics", "view"))
      .get("/analytics", async () => {
        return getAnalyticsData()
      })
      .get("/export/csv", async ({ set }) => {
        const csv = await generateCSVExport()
        set.headers["Content-Type"] = "text/csv"
        set.headers["Content-Disposition"] =
          "attachment; filename=transitops_reports.csv"
        return csv
      })
  )
