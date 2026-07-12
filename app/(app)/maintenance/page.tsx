import { MaintenanceWorkspace } from "@/components/maintenance/maintenance-workspace"
import type { PermissionAction } from "@/db/schema/constants"
import { requireSession } from "@/lib/auth-guard"
import { getUserPermissions } from "@/modules/rbac/rbac.service"

export default async function MaintenancePage() {
  const session = await requireSession()
  const permissions = await getUserPermissions(session.user.id)

  const has = (action: PermissionAction) =>
    permissions.some((p) => p.module === "maintenance" && p.action === action)

  if (!has("view")) {
    return (
      <div className="text-sm text-muted-foreground">
        You don&apos;t have permission to view maintenance records.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Maintenance
        </h1>
        <p className="text-sm text-muted-foreground">
          Log vehicle service work and track open maintenance affecting
          dispatch.
        </p>
      </div>
      <MaintenanceWorkspace
        canCreate={has("create")}
        canEdit={has("edit")}
        canDelete={has("delete")}
      />
    </div>
  )
}
