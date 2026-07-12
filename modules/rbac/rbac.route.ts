import { Elysia } from "elysia"
import {
  updatePermissionMatrixSchema,
  createRoleSchema,
} from "@/modules/rbac/rbac.schema"
import {
  getPermissionMatrix,
  getUserPermissions,
  listRoles,
  updatePermissionGrants,
  createRole,
} from "@/modules/rbac/rbac.service"
import { requireAuth } from "@/middleware/auth"
import { requirePermission } from "@/middleware/rbac"
import { formatZodIssues } from "@/lib/zod-errors"

export const rbacRoutes = new Elysia({ prefix: "/rbac" })
  .use(requireAuth)
  .get("/me/permissions", async ({ user }) => {
    if (!user) {
      return { permissions: [] }
    }

    const permissions = await getUserPermissions(user.id)
    return { permissions }
  })
  .group("", (app) =>
    app
      .use(requirePermission("settings", "view"))
      .get("/roles", async () => {
        const result = await listRoles()
        if (result.error) {
          return { error: result.error }
        }
        return { roles: result.data }
      })
      .get("/permissions", async () => {
        const result = await getPermissionMatrix()
        if (result.error) {
          return { error: result.error }
        }
        return { matrix: result.data }
      })
  )
  .group("", (app) =>
    app
      .use(requirePermission("settings", "edit"))
      .put("/permissions", async ({ body, status }) => {
        const parsed = updatePermissionMatrixSchema.safeParse(body)

        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await updatePermissionGrants(parsed.data.grants)
        if (result.error) {
          return status(500, { error: result.error })
        }

        return { matrix: result.data }
      })
      .post("/roles", async ({ body, status }) => {
        const parsed = createRoleSchema.safeParse(body)
        if (!parsed.success) {
          return status(400, { error: formatZodIssues(parsed.error.issues) })
        }

        const result = await createRole(parsed.data.name)
        if (result.error) {
          return status(400, { error: result.error })
        }

        return { role: result.data }
      })
  )
