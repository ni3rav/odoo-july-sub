import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DriverStatus } from "@/db/schema/constants"

const STATUS_CLASS: Record<DriverStatus, string> = {
  Available: "border-primary/20 bg-primary/10 text-primary",
  OnTrip: "border-accent bg-accent text-accent-foreground",
  OffDuty: "border-border bg-muted text-muted-foreground",
  Suspended:
    "border-destructive/20 bg-destructive/10 text-destructive dark:bg-destructive/20",
}

export function DriverStatusBadge({ status }: { status: DriverStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASS[status])}>
      {status}
    </Badge>
  )
}
