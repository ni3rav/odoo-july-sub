"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Truck,
  Users,
  Map,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
  type LucideIcon,
} from "lucide-react"

const ICONS: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/fleet": Truck,
  "/drivers": Users,
  "/trips": Map,
  "/maintenance": Wrench,
  "/fuel": Fuel,
  "/analytics": BarChart3,
  "/settings": Settings,
}

interface SidebarNavProps {
  items: { href: string; label: string }[]
}

export function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <SidebarMenu>
      {items.map((item) => {
        const IconComp = ICONS[item.href] ?? LayoutDashboard
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              render={<Link href={item.href} />}
              isActive={isActive}
              className={cn(
                "transition-all duration-200 group",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold shadow-xs"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <IconComp
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground group-hover/menu-button:text-primary"
                )}
              />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
