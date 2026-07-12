import { requireSession } from "@/lib/auth-guard"
import { getUserPermissions } from "@/modules/rbac/rbac.service"
import { FleetWorkspace } from "@/components/fleet/fleet-workspace"
import type { PermissionAction } from "@/db/schema/constants"

export default async function FleetPage() {
  const session = await requireSession()
  const permissions = await getUserPermissions(session.user.id)

  const has = (action: PermissionAction) =>
    permissions.some((p) => p.module === "fleet" && p.action === action)

  if (!has("view")) {
    return (
      <div className="text-sm text-muted-foreground">
        You don&apos;t have permission to view the fleet registry.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Fleet
      </h1>
      <FleetWorkspace
        canCreate={has("create")}
        canEdit={has("edit")}
        canDelete={has("delete")}
      />
    </div>
  )
}
