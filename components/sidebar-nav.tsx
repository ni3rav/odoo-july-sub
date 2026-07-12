"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
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
              isActive={isActive}
              render={<Link href={item.href} />}
            >
              <IconComp className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}
