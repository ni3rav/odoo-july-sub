import type { PermissionModule } from "@/db/schema/constants"

export type AppNavItem = {
  href: string
  label: string
  module: PermissionModule | null
}

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    module: null,
  },
  {
    href: "/fleet",
    label: "Fleet",
    module: "fleet",
  },
  {
    href: "/drivers",
    label: "Drivers",
    module: "drivers",
  },
  {
    href: "/trips",
    label: "Trips",
    module: "trips",
  },
  {
    href: "/maintenance",
    label: "Maintenance",
    module: "maintenance",
  },
  {
    href: "/fuel",
    label: "Fuel & Expenses",
    module: "fuel",
  },
  {
    href: "/analytics",
    label: "Analytics",
    module: "analytics",
  },
  {
    href: "/settings",
    label: "Settings",
    module: "settings",
  },
]
