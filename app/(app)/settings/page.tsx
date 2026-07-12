import { SettingsClient } from "@/app/(app)/settings/settings-client"
import type { PermissionAction } from "@/db/schema/constants"
import { requireSession } from "@/lib/auth-guard"
import { getUserProfile } from "@/modules/profile/profile.service"
import {
  getPermissionMatrix,
  getUserPermissions,
  listRoles,
} from "@/modules/rbac/rbac.service"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const session = await requireSession()
  const userPermissions = await getUserPermissions(session.user.id)

  const has = (action: PermissionAction) =>
    userPermissions.some(
      (permission) =>
        permission.module === "settings" && permission.action === action
    )

  if (!has("view")) {
    redirect("/dashboard")
  }

  const profileResult = await getUserProfile(session.user.id)
  if (profileResult.error || !profileResult.data) {
    return (
      <div className="text-sm text-destructive">
        Unable to load your profile.
      </div>
    )
  }

  const [matrixResult, rolesResult] = await Promise.all([
    getPermissionMatrix(),
    listRoles(),
  ])

  return (
    <SettingsClient
      profile={profileResult.data}
      roles={rolesResult.data ?? []}
      initialMatrix={matrixResult.data ?? []}
      canEditMatrix={has("edit")}
      initialMatrixError={
        matrixResult.error || rolesResult.error
          ? "Unable to load the permission matrix."
          : null
      }
    />
  )
}
