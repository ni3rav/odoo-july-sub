"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { LayoutDashboard } from "lucide-react"
import { useSidebar } from "@/components/ui/sidebar"
import { NAV_ICONS } from "@/components/sidebar-nav"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type SidebarHoverPeekProps = {
  items: { href: string; label: string }[]
}

export function SidebarHoverPeek({ items }: SidebarHoverPeekProps) {
  const { state, isMobile, toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const [hovered, setHovered] = React.useState(false)

  if (isMobile || state === "expanded") {
    return null
  }

  return (
    <div
      role="button"
      aria-label="Expand sidebar"
      title="Expand sidebar"
      tabIndex={0}
      onClick={toggleSidebar}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          toggleSidebar()
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed inset-y-0 left-0 z-30 w-3 cursor-e-resize"
    >
      <AnimatePresence>
        {hovered && (
          <motion.aside
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            className="fixed inset-y-0 left-0 z-30 flex w-(--sidebar-width-icon) flex-col items-center gap-1 border-r border-border bg-sidebar py-3 shadow-lg"
          >
            {items.map((item) => {
              const Icon = NAV_ICONS[item.href] ?? LayoutDashboard
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`)

              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      onClick={(event) => {
                        event.stopPropagation()
                        setHovered(false)
                      }}
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-primary"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-primary"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              )
            })}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}
