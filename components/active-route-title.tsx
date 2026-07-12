"use client"

import { usePathname } from "next/navigation"

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/fleet": "Vehicle Registry",
  "/drivers": "Drivers & Safety",
  "/trips": "Trip Dispatcher",
  "/maintenance": "Maintenance",
  "/fuel": "Fuel & Expenses",
  "/analytics": "Analytics",
  "/settings": "Settings & RBAC",
}

export function ActiveRouteTitle() {
  const pathname = usePathname()
  const title = routeTitles[pathname] ?? "Transit Operations Platform"

  return (
    <h2 className="truncate text-sm font-semibold text-foreground">
      {title}
    </h2>
  )
}
