import { APP_NAV_ITEMS, type AppNavItem } from "@/config/navigation"
import type { PermissionAction, PermissionModule } from "@/db/schema/constants"

export type UserPermissionGrant = {
  module: PermissionModule
  action: PermissionAction
}

export type NavLinkItem = {
  href: string
  label: string
}

export function filterNavItemsByPermissions(
  items: AppNavItem[],
  permissions: UserPermissionGrant[]
): NavLinkItem[] {
  return items
    .filter((item) => {
      if (!item.module) {
        return true
      }
      return permissions.some(
        (permission) =>
          permission.module === item.module && permission.action === "view"
      )
    })
    .map(({ href, label }) => ({ href, label }))
}

export function getNavItemsForPermissions(
  permissions: UserPermissionGrant[]
): NavLinkItem[] {
  return filterNavItemsByPermissions(APP_NAV_ITEMS, permissions)
}
