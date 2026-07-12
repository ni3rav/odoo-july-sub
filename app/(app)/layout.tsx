import { requireSession } from "@/lib/auth-guard"
import { getUserPermissions } from "@/modules/rbac/rbac.service"
import { AppLogo } from "@/components/app-logo"
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
import { Separator } from "@/components/ui/separator"
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
          <SidebarHeader className="border-b border-border">
            <Link href="/dashboard">
              <AppLogo />
            </Link>
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
          <header className="flex h-[65px] shrink-0 items-center gap-2 border-b border-border bg-card px-4 md:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
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
