import { VehicleStatusBadge } from "@/components/fleet/vehicle-status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function MaintenanceStatusFlow() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base text-card-foreground">
          Vehicle status flow
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <VehicleStatusBadge status="Available" />
        <span>→</span>
        <VehicleStatusBadge status="InShop" />
        <span>→</span>
        <VehicleStatusBadge status="Available" />
        <p className="w-full text-sm text-muted-foreground">
          Logging maintenance moves a vehicle to In Shop and removes it from
          dispatch. Closing the record restores Available unless the vehicle is
          Retired.
        </p>
      </CardContent>
    </Card>
  )
}
