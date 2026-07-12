import { and, asc, eq } from "drizzle-orm"
import { db } from "@/db"
import { permission, role, rolePermission, user } from "@/db/schema"
import { tryCatch } from "@/lib/try-catch"
import type { PermissionAction, PermissionModule } from "@/db/schema/constants"

export async function checkPermission(
  userId: string,
  module: PermissionModule,
  action: PermissionAction
): Promise<boolean> {
  const { data: row, error } = await tryCatch(
    db
      .select({ granted: rolePermission.granted })
      .from(user)
      .innerJoin(role, eq(user.roleId, role.id))
      .innerJoin(rolePermission, eq(rolePermission.roleId, role.id))
      .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
      .where(
        and(
          eq(user.id, userId),
          eq(permission.module, module),
          eq(permission.action, action),
          eq(rolePermission.granted, true)
        )
      )
      .limit(1)
  )

  if (error || !row?.length) {
    return false
  }

  return true
}

export async function getUserPermissions(userId: string) {
  const { data: rows, error } = await tryCatch(
    db
      .select({
        module: permission.module,
        action: permission.action,
      })
      .from(user)
      .innerJoin(role, eq(user.roleId, role.id))
      .innerJoin(rolePermission, eq(rolePermission.roleId, role.id))
      .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
      .where(and(eq(user.id, userId), eq(rolePermission.granted, true)))
  )

  if (error || !rows) {
    return []
  }

  return rows
}

export async function listRoles() {
  const { data: rows, error } = await tryCatch(db.select().from(role))

  if (error || !rows) {
    return { error: error?.message ?? "Failed to load roles" }
  }

  return { data: rows }
}

export async function getPermissionMatrix() {
  const { data: rows, error } = await tryCatch(
    db
      .select({
        roleId: rolePermission.roleId,
        roleSlug: role.slug,
        roleName: role.name,
        permissionId: permission.id,
        module: permission.module,
        action: permission.action,
        granted: rolePermission.granted,
      })
      .from(role)
      .innerJoin(rolePermission, eq(rolePermission.roleId, role.id))
      .innerJoin(permission, eq(rolePermission.permissionId, permission.id))
      .orderBy(asc(role.slug), asc(permission.module), asc(permission.action))
  )

  if (error || !rows) {
    return { error: error?.message ?? "Failed to load permissions" }
  }

  return { data: rows }
}

export async function updatePermissionGrants(
  grants: Array<{ roleId: string; permissionId: string; granted: boolean }>
) {
  for (const grant of grants) {
    const { error } = await tryCatch(
      db
        .insert(rolePermission)
        .values(grant)
        .onConflictDoUpdate({
          target: [rolePermission.roleId, rolePermission.permissionId],
          set: { granted: grant.granted },
        })
    )

    if (error) {
      return { error: error.message }
    }
  }

  return getPermissionMatrix()
}
