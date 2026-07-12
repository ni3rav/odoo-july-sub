import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { InventoryStatus } from "@/db/schema/constants"

const STATUS_CLASS: Record<InventoryStatus, string> = {
  InStock: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  LowStock: "bg-amber-500/10 text-amber-500 border-amber-500/20",
}

export function InventoryStatusBadge({ status }: { status: InventoryStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASS[status])}>
      {status === "InStock" ? "In Stock" : "Low Stock"}
    </Badge>
  )
}
