import { requireSession } from "@/lib/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Users, MapPin, AlertTriangle } from "lucide-react"

export default async function DashboardPage() {
  await requireSession()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Vehicles
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">0</div>
            <p className="text-xs text-muted-foreground">0% of total fleet</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available Drivers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">0</div>
            <p className="text-xs text-muted-foreground">
              0 active drivers online
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trips In Transit
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">0</div>
            <p className="text-xs text-muted-foreground">0 dispatched today</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vehicles In Shop
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">0</div>
            <p className="text-xs text-muted-foreground">
              0 pending maintenance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">
              Recent Trips
            </CardTitle>
          </CardHeader>
          <CardContent className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            No recent trips recorded.
          </CardContent>
        </Card>

        <Card className="col-span-3 border-border bg-card">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">
              Fleet Status Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
            No status data available.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
