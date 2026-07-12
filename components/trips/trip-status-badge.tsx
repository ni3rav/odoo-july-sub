import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TripStatus } from "@/db/schema/constants"

const STATUS_CLASS: Record<TripStatus, string> = {
  Draft: "border-border bg-muted text-muted-foreground",
  Dispatched: "border-primary/20 bg-primary/10 text-primary",
  InTransit: "border-accent bg-accent text-accent-foreground",
  Completed: "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
  Cancelled:
    "border-destructive/20 bg-destructive/10 text-destructive dark:bg-destructive/20",
}

export function TripStatusBadge({ status }: { status: TripStatus }) {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASS[status])}>
      {status}
    </Badge>
  )
}
