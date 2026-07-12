import { requireSession } from "@/lib/auth-guard"
import { getUserPermissions } from "@/modules/rbac/rbac.service"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { UserNav } from "@/components/user-nav"
import Link from "next/link"
import {
  LayoutDashboard,
  Truck,
  Users,
  Map,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
} from "lucide-react"

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    module: null,
  },
  {
    href: "/fleet",
    label: "Fleet",
    icon: Truck,
    module: "fleet",
  },
  {
    href: "/drivers",
    label: "Drivers",
    icon: Users,
    module: "drivers",
  },
  {
    href: "/trips",
    label: "Trips",
    icon: Map,
    module: "trips",
  },
  {
    href: "/maintenance",
    label: "Maintenance",
    icon: Wrench,
    module: "maintenance",
  },
  {
    href: "/fuel",
    label: "Fuel & Expenses",
    icon: Fuel,
    module: "fuel",
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    module: "analytics",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
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
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Truck className="h-5 w-5" />
              </div>
              <span>TransitOps</span>
            </Link>
          </SidebarHeader>

          <SidebarContent className="p-2">
            <SidebarMenu>
              {allowedItems.map((item) => {
                const IconComp = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton render={<Link href={item.href} />}>
                      <IconComp className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-border p-2">
            <UserNav user={session.user} />
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col bg-background">
          <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4 md:px-6">
            <SidebarTrigger className="h-8 w-8" />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-semibold text-foreground">
                Transit Operations Platform
              </h2>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
