import { eq } from "drizzle-orm"
import { db } from "@/db"
import {
  driver,
  permission,
  role,
  rolePermission,
  vehicle,
} from "@/db/schema"
import {
  DEFAULT_ROLE_PERMISSION_MATRIX,
  flattenMatrix,
} from "@/db/schema/rbac-defaults"
import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  ROLE_NAMES,
  ROLE_SLUGS,
  type RoleSlug,
} from "@/db/schema/constants"
import { tryCatch } from "@/lib/try-catch"

function id() {
  return crypto.randomUUID()
}

async function seedRoles() {
  const roleIds = new Map<RoleSlug, string>()

  for (const slug of ROLE_SLUGS) {
    const roleId = id()
    roleIds.set(slug, roleId)

    const { error } = await tryCatch(
      db
        .insert(role)
        .values({
          id: roleId,
          name: ROLE_NAMES[slug],
          slug,
        })
        .onConflictDoNothing({ target: role.slug })
    )

    if (error) {
      const { data: existing } = await tryCatch(
        db.select().from(role).where(eq(role.slug, slug)).limit(1)
      )
      if (existing?.[0]) {
        roleIds.set(slug, existing[0].id)
        continue
      }
      throw error
    }
  }

  return roleIds
}

async function seedPermissions() {
  const permissionIds = new Map<string, string>()

  for (const permModule of PERMISSION_MODULES) {
    for (const action of PERMISSION_ACTIONS) {
      const permissionId = id()
      const key = `${permModule}:${action}`
      permissionIds.set(key, permissionId)

      const { error } = await tryCatch(
        db
          .insert(permission)
          .values({ id: permissionId, module: permModule, action })
          .onConflictDoNothing({
            target: [permission.module, permission.action],
          })
      )

      if (error) {
        const { data: existing } = await tryCatch(
          db
            .select()
            .from(permission)
            .where(eq(permission.module, permModule))
            .limit(PERMISSION_ACTIONS.length)
        )
        const match = existing?.find(
          (row) => row.module === permModule && row.action === action
        )
        if (match) {
          permissionIds.set(key, match.id)
          continue
        }
        throw error
      }
    }
  }

  const { data: allPermissions, error: loadError } = await tryCatch(
    db.select().from(permission)
  )

  if (loadError || !allPermissions) {
    throw loadError ?? new Error("Failed to load permissions")
  }

  for (const row of allPermissions) {
    permissionIds.set(`${row.module}:${row.action}`, row.id)
  }

  return permissionIds
}

async function seedRolePermissions(
  roleIds: Map<RoleSlug, string>,
  permissionIds: Map<string, string>
) {
  const grants = flattenMatrix(DEFAULT_ROLE_PERMISSION_MATRIX)

  for (const grant of grants) {
    const roleId = roleIds.get(grant.roleSlug)
    const permissionId = permissionIds.get(`${grant.module}:${grant.action}`)

    if (!roleId || !permissionId) {
      continue
    }

    const { error } = await tryCatch(
      db
        .insert(rolePermission)
        .values({
          roleId,
          permissionId,
          granted: true,
        })
        .onConflictDoNothing()
    )

    if (error) {
      throw error
    }
  }
}

async function seedDemoFleet() {
  const oneYearFromNow = new Date()
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

  const { error: vehicleError } = await tryCatch(
    db
      .insert(vehicle)
      .values({
        id: id(),
        registrationNumber: "Van-05",
        name: "Transit Van 05",
        type: "LCV",
        maxLoadCapacityKg: 500,
        odometerKm: 12000,
        acquisitionCost: "45000.00",
        region: "North",
        status: "Available",
      })
      .onConflictDoNothing({ target: vehicle.registrationNumber })
  )

  if (vehicleError) {
    throw vehicleError
  }

  const { error: driverError } = await tryCatch(
    db
      .insert(driver)
      .values({
        id: id(),
        name: "Alex",
        licenseNumber: "DL-ALEX-001",
        licenseCategory: "LCV",
        licenseExpiryDate: oneYearFromNow,
        contactNumber: "+1-555-0100",
        safetyScore: 92,
        status: "Available",
      })
      .onConflictDoNothing({ target: driver.licenseNumber })
  )

  if (driverError) {
    throw driverError
  }
}

async function main() {
  console.log("Seeding TransitOps...")

  const roleIds = await seedRoles()
  console.log(`Roles: ${roleIds.size}`)

  const permissionIds = await seedPermissions()
  console.log(`Permissions: ${permissionIds.size}`)

  await seedRolePermissions(roleIds, permissionIds)
  console.log("Role permissions seeded")

  await seedDemoFleet()
  console.log("Demo fleet seeded (Van-05, Alex)")

  console.log("Done. Assign roleId to users after signup.")
  process.exit(0)
}

main().catch((error) => {
  console.error("Seed failed:", error)
  process.exit(1)
})
