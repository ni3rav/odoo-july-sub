import { OperationsWorkspace } from "@/components/operations/operations-workspace"
import type { PermissionAction } from "@/db/schema/constants"
import { requireSession } from "@/lib/auth-guard"
import { getUserPermissions } from "@/modules/rbac/rbac.service"

export default async function FuelPage() {
  const session = await requireSession()
  const permissions = await getUserPermissions(session.user.id)

  const has = (action: PermissionAction) =>
    permissions.some((p) => p.module === "fuel" && p.action === action)

  if (!has("view")) {
    return (
      <div className="text-sm text-muted-foreground">
        You don&apos;t have permission to view fuel and expense management.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Fuel &amp; Expenses
        </h1>
        <p className="text-sm text-muted-foreground">
          Log fuel purchases, track expenses, and manage inventory.
        </p>
      </div>
      <OperationsWorkspace
        canCreate={has("create")}
        canEdit={has("edit")}
        canDelete={has("delete")}
      />
    </div>
  )
}
