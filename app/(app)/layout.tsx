/* eslint-disable @next/next/no-img-element */
import { requireSession } from "@/lib/auth-guard"
import { getUserPermissions } from "@/modules/rbac/rbac.service"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { UserNav } from "@/components/user-nav"
import { SidebarNav } from "@/components/sidebar-nav"
import { SidebarHoverPeek } from "@/components/sidebar-hover-peek"
import { ThemeToggle } from "@/components/theme-toggle"
import { ActiveRouteTitle } from "@/components/active-route-title"
import Link from "next/link"

const NAV_ITEMS = [
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

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()
  const permissions = await getUserPermissions(session.user.id)

  const allowedItems = NAV_ITEMS.filter((item) => {
    if (!item.module) return true
    return permissions.some(
      (p) => p.module === item.module && p.action === "view"
    )
  })
  const navItems = allowedItems.map((item) => ({
    href: item.href,
    label: item.label,
  }))

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-border bg-card">
          <SidebarHeader className="flex flex-row items-center justify-between border-b border-border">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold text-primary"
            >
              <div className="flex size-12 items-center justify-center overflow-hidden rounded-lg p-0.5">
                <img
                  src="/light-icon-app.png"
                  alt="TransitOps Logo"
                  className="block h-full w-full object-contain dark:hidden"
                />
                <img
                  src="/dark-icon-app.png"
                  alt="TransitOps Logo"
                  className="hidden h-full w-full object-contain dark:block"
                />
              </div>
              <span>TransitOps</span>
            </Link>
            <SidebarTrigger className="h-8 w-8" />
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarNav items={navItems} />
          </SidebarContent>

          <SidebarFooter className="border-t border-border p-2">
            <div className="flex items-center gap-1">
              <div className="min-w-0 flex-1">
                <UserNav user={session.user} />
              </div>
              <ThemeToggle />
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex flex-col bg-background">
          <header className="gap:4 flex h-[57px] items-center border-b border-border bg-card px-4 md:px-6">
            <div className="min-w-0 flex-1">
              <ActiveRouteTitle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
      <SidebarHoverPeek items={navItems} />
    </SidebarProvider>
  )
}
