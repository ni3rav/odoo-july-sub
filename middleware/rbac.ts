import { Elysia } from "elysia"
import { checkPermission } from "@/modules/rbac/rbac.service"
import type { PermissionAction, PermissionModule } from "@/db/schema/constants"
import { requireAuth } from "./auth"

export function requirePermission(
  module: PermissionModule,
  action: PermissionAction
) {
  return new Elysia({
    name: `permission-${module}-${action}`,
  })
    .use(requireAuth)
    .derive({ as: "scoped" }, async ({ user, status }) => {
      if (!user) {
        return status(401, { error: "Unauthorized" })
      }

      const allowed = await checkPermission(user.id, module, action)

      if (!allowed) {
        return status(403, { error: "Forbidden" })
      }

      return {}
    })
}
