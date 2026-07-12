import { requireSession } from "@/lib/auth-guard"
import { getDashboardKPIs } from "@/modules/reports/reports.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardFilters } from "@/components/dashboard-filters"
import { RecentTripsTable } from "@/components/recent-trips-table"
import { FleetStatusChart } from "@/components/fleet-status-chart"
import { cn } from "@/lib/utils"
import {
  Truck,
  Users,
  MapPin,
  AlertTriangle,
  Percent,
  TrendingDown,
  CircleDollarSign,
} from "lucide-react"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; status?: string; region?: string }>
}) {
  await requireSession()
  const filters = await searchParams

  const data = await getDashboardKPIs(filters)

  const kpisList = [
    {
      title: "Fleet Utilization",
      value: `${data.kpis.utilization}%`,
      description: "Active vs total fleet",
      icon: Percent,
      color: "text-primary bg-primary/10",
    },
    {
      title: "Active Vehicles",
      value: data.kpis.activeVehicles,
      description: `Out of ${data.kpis.totalVehicles} total vehicles`,
      icon: Truck,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      title: "Available Drivers",
      value: data.kpis.availableDrivers,
      description: "Ready to dispatch",
      icon: Users,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Trips In Transit",
      value: data.kpis.activeTrips,
      description: "Active shipping cargo",
      icon: MapPin,
      color: "text-indigo-500 bg-indigo-500/10",
    },
    {
      title: "Vehicles In Shop",
      value: data.kpis.vehiclesInShop,
      description: "Under active service",
      icon: AlertTriangle,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      title: "Total Revenue",
      value: `$${Number(data.kpis.totalRevenue).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      description: "Earnings from completed trips",
      icon: CircleDollarSign,
      color: "text-violet-500 bg-violet-500/10",
    },
    {
      title: "Operational Cost",
      value: `$${Number(data.kpis.totalCost).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      description: "Fuel, maintenance & tolls",
      icon: TrendingDown,
      color: "text-rose-500 bg-rose-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      <DashboardFilters />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {kpisList.map((kpi, idx) => {
          const IconComp = kpi.icon
          return (
            <Card
              key={idx}
              className={cn(
                "border-border bg-card shadow-2xs transition-shadow duration-200 hover:shadow-xs",
                idx === 0 && "sm:col-span-2 xl:col-span-1"
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  {kpi.title}
                </CardTitle>
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    kpi.color
                  )}
                >
                  <IconComp className="h-4.5 w-4.5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold tracking-tight text-card-foreground">
                  {kpi.value}
                </div>
                <p className="mt-0.5 text-[10px] leading-normal text-muted-foreground">
                  {kpi.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <div className="space-y-3 lg:col-span-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-foreground">Recent Trips</h3>
          </div>
          <RecentTripsTable trips={data.recentTrips} />
        </div>

        <Card className="flex flex-col border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">
              Fleet Status Allocation
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Current distribution of fleet assets
            </p>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between pb-6">
            <FleetStatusChart statusBreakdown={data.statusBreakdown} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
