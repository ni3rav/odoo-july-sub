import { Badge } from "@/components/ui/badge"
import type { VehicleStatus } from "@/db/schema/constants"

const STATUS_VARIANT: Record<
  VehicleStatus,
  "success" | "info" | "destructive" | "neutral"
> = {
  Available: "success",
  OnTrip: "info",
  InShop: "destructive",
  Retired: "neutral",
}

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{status}</Badge>
}
