import { TripsWorkspace } from "@/components/trips/trips-workspace"
import type { PermissionAction } from "@/db/schema/constants"
import { requireSession } from "@/lib/auth-guard"
import { getUserPermissions } from "@/modules/rbac/rbac.service"

export default async function TripsPage() {
  const session = await requireSession()
  const permissions = await getUserPermissions(session.user.id)

  const has = (action: PermissionAction) =>
    permissions.some((p) => p.module === "trips" && p.action === action)

  if (!has("view")) {
    return (
      <div className="text-sm text-muted-foreground">
        You don&apos;t have permission to view trip dispatch.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Trip Dispatcher
        </h1>
        <p className="text-sm text-muted-foreground">
          Create trips, validate dispatch rules, and advance the five-state
          lifecycle.
        </p>
      </div>
      <TripsWorkspace
        canCreate={has("create")}
        canEdit={has("edit")}
        canDelete={has("delete")}
      />
    </div>
  )
}
