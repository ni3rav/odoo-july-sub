"use client"

import Link from "next/link"
import { AppLogo } from "@/components/app-logo"
import { ActiveRouteTitle } from "@/components/active-route-title"
import { SidebarHoverPeek } from "@/components/sidebar-hover-peek"
import { SidebarNav } from "@/components/sidebar-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { UserNav } from "@/components/user-nav"
import { Separator } from "@/components/ui/separator"
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
import { useUserPermissions } from "@/hooks/use-user-permissions"
import { getNavItemsForPermissions } from "@/lib/nav-permissions"
import type { UserPermissionGrant } from "@/lib/nav-permissions"

type AppShellProps = {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
  }
  initialPermissions: UserPermissionGrant[]
  children: React.ReactNode
}

export function AppShell({
  user,
  initialPermissions,
  children,
}: AppShellProps) {
  const permissionsQuery = useUserPermissions(initialPermissions)
  const navItems = getNavItemsForPermissions(
    permissionsQuery.data ?? initialPermissions
  )

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r border-border bg-card">
          <SidebarHeader className="border-b border-border p-4">
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
                <UserNav user={user} />
              </div>
              <ThemeToggle />
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>

        <SidebarInset className="flex flex-col bg-background">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-4 md:px-6">
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
