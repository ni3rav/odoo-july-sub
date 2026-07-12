import type { RolePermissionMatrix } from "./constants"

const allActions = ["view", "create", "edit", "delete"] as const
const viewOnly = ["view"] as const
const viewCreate = ["view", "create"] as const

export const DEFAULT_ROLE_PERMISSION_MATRIX: RolePermissionMatrix = {
  FleetManager: {
    fleet: [...allActions],
    drivers: [...allActions],
    trips: [...allActions],
    maintenance: [...allActions],
    fuel: [...allActions],
    analytics: [...allActions],
    settings: [...allActions],
  },
  Dispatcher: {
    fleet: [...viewOnly],
    drivers: [...viewOnly],
    trips: [...allActions],
    maintenance: [...viewCreate],
    fuel: [...viewCreate],
    analytics: [...viewOnly],
    settings: [...viewOnly],
  },
  SafetyOfficer: {
    fleet: [...viewOnly],
    drivers: [...allActions],
    trips: [...viewOnly],
    maintenance: [...viewOnly],
    fuel: [...viewOnly],
    analytics: [...viewOnly],
    settings: [...viewOnly],
  },
  FinancialAnalyst: {
    fleet: [...viewOnly],
    drivers: [...viewOnly],
    trips: [...viewOnly],
    maintenance: [...viewOnly],
    fuel: [...allActions],
    analytics: [...allActions],
    settings: [...viewOnly],
  },
}

export function flattenMatrix(
  matrix: RolePermissionMatrix
): Array<{
  roleSlug: keyof RolePermissionMatrix
  module: string
  action: string
}> {
  const grants: Array<{
    roleSlug: keyof RolePermissionMatrix
    module: string
    action: string
  }> = []

  for (const [roleSlug, modules] of Object.entries(matrix)) {
    if (!modules) continue
    for (const [grantModule, actions] of Object.entries(modules)) {
      for (const action of actions) {
        grants.push({
          roleSlug: roleSlug as keyof RolePermissionMatrix,
          module: grantModule,
          action,
        })
      }
    }
  }

  return grants
}
