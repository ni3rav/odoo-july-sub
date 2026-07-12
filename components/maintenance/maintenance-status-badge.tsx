import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { MaintenanceStatus } from "@/db/schema/constants"

const STATUS_CLASS: Record<MaintenanceStatus, string> = {
  Open: "border-destructive/20 bg-destructive/10 text-destructive",
  Completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
}

export function MaintenanceStatusBadge({
  status,
}: {
  status: MaintenanceStatus
}) {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASS[status])}>
      {status}
    </Badge>
  )
}
