import { requireSession } from "@/lib/auth-guard"
import {
  getAnalyticsData,
  getDashboardKPIs,
} from "@/modules/reports/reports.service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RevenueCostChart } from "@/components/revenue-cost-chart"
import { CostAllocationChart } from "@/components/cost-allocation-chart"
import { cn } from "@/lib/utils"
import {
  Download,
  Percent,
  TrendingDown,
  CircleDollarSign,
  Fuel,
  LineChart,
} from "lucide-react"

export default async function AnalyticsPage() {
  await requireSession()

  const analytics = await getAnalyticsData()
  const dashboardData = await getDashboardKPIs()

  const kpisList = [
    {
      title: "Fleet Utilization",
      value: `${dashboardData.kpis.utilization}%`,
      description: "Non-retired vehicles in use",
      icon: Percent,
      color: "text-primary bg-primary/10",
    },
    {
      title: "Fuel Efficiency",
      value: `${analytics.fuelEfficiency} km/L`,
      description: "Average fuel economy",
      icon: Fuel,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      title: "Operational Cost",
      value: `$${Number(dashboardData.kpis.totalCost).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      description: "Total logistics expense",
      icon: TrendingDown,
      color: "text-rose-500 bg-rose-500/10",
    },
    {
      title: "Revenue per Trip",
      value: `$${Number(dashboardData.kpis.totalRevenue / (dashboardData.recentTrips.length || 1)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      description: "Average yield per dispatch",
      icon: CircleDollarSign,
      color: "text-violet-500 bg-violet-500/10",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <a
          href="/api/reports/export/csv"
          download
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold whitespace-nowrap text-primary-foreground shadow-xs transition-colors outline-none hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpisList.map((kpi, idx) => {
          const IconComp = kpi.icon
          return (
            <Card
              key={idx}
              className="border-border bg-card shadow-2xs transition-shadow duration-200 hover:shadow-xs"
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="flex flex-col justify-between border-border bg-card lg:col-span-4">
          <CardHeader>
            <div className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg text-card-foreground">
                Revenue vs Operational Cost
              </CardTitle>
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly analytics compared side-by-side
            </p>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-end pt-4 pb-6">
            <RevenueCostChart monthlyData={analytics.monthlyData} />
          </CardContent>
        </Card>

        <Card className="flex flex-col border-border bg-card lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground">
              Operational Cost Allocation
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              Breakdown of operational spend
            </p>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-between pb-6">
            <CostAllocationChart costBreakdown={analytics.costBreakdown} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
