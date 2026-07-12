import { requireSession } from "@/lib/auth-guard"
import {
  getUserPermissions,
  getPermissionMatrix,
} from "@/modules/rbac/rbac.service"
import { SettingsClient } from "./settings-client"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await requireSession()
  const userPermissions = await getUserPermissions(session.user.id)

  const canView = userPermissions.some(
    (p) => p.module === "settings" && p.action === "view"
  )

  if (!canView) {
    redirect("/dashboard")
  }

  const matrixResult = await getPermissionMatrix()
  const initialMatrix = matrixResult.data || []

  const canEdit = userPermissions.some(
    (p) => p.module === "settings" && p.action === "edit"
  )

  return <SettingsClient initialMatrix={initialMatrix} canEdit={canEdit} />
}
