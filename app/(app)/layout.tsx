import { requireSession } from "@/lib/auth-guard"
import { getUserPermissions } from "@/modules/rbac/rbac.service"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { UserNav } from "@/components/user-nav"
import { SidebarNav } from "@/components/sidebar-nav"
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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-border bg-card">
          <SidebarHeader className="border-b border-border p-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold text-primary"
            >
              <div className="flex size-12 items-center justify-center rounded-lg overflow-hidden p-0.5">
                <img src="/light-icon-app.png" alt="TransitOps Logo" className="h-full w-full object-contain block dark:hidden" />
                <img src="/dark-icon-app.png" alt="TransitOps Logo" className="h-full w-full object-contain hidden dark:block" />
              </div>
              <span>TransitOps</span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarNav
              items={allowedItems.map((item) => ({
                href: item.href,
                label: item.label,
              }))}
            />
          </SidebarContent>

          <SidebarFooter className="border-t border-border p-2">
            <div className="flex items-center gap-1">
              <div className="min-w-0 flex-1">
                <UserNav user={session.user} />
              </div>
              <ThemeToggle />
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col bg-background">
          <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 md:px-6">
            <SidebarTrigger className="h-8 w-8" />
            <div className="min-w-0 flex-1">
              <ActiveRouteTitle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
