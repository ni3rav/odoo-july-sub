import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { VehicleStatus } from "@/db/schema/constants"

const STATUS_CLASS: Record<VehicleStatus, string> = {
  Available: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  OnTrip: "bg-primary/10 text-primary border-primary/20",
  InShop: "bg-destructive/10 text-destructive border-destructive/20",
  Retired: "bg-muted text-muted-foreground border-border",
}

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASS[status])}>
      {status}
    </Badge>
  )
}
