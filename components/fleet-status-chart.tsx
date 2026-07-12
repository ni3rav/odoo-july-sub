"use client"

import { PieChart, Pie, Cell } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

interface FleetStatusChartProps {
  statusBreakdown: {
    Available: number
    OnTrip: number
    InShop: number
    Retired: number
  }
}

export function FleetStatusChart({ statusBreakdown }: FleetStatusChartProps) {
  const chartConfigTheme = {
    Available: { label: "Available", color: "oklch(0.627 0.194 149.214)" },
    OnTrip: { label: "OnTrip", color: "var(--primary)" },
    InShop: { label: "InShop", color: "oklch(0.769 0.188 70.08)" },
    Retired: { label: "Retired", color: "var(--muted-foreground)" },
  }

  const chartData = [
    { name: "Available", value: statusBreakdown.Available, fill: "var(--color-Available)" },
    { name: "On Trip", value: statusBreakdown.OnTrip, fill: "var(--color-OnTrip)" },
    { name: "In Shop", value: statusBreakdown.InShop, fill: "var(--color-InShop)" },
    { name: "Retired", value: statusBreakdown.Retired, fill: "var(--color-Retired)" },
  ]

  return (
    <div className="flex-1 flex flex-col justify-between pb-6">
      <div className="flex-1 flex items-center justify-center min-h-[180px]">
        <ChartContainer config={chartConfigTheme} className="mx-auto aspect-square w-full max-h-[160px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={70}
              strokeWidth={3}
              stroke="var(--card)"
            >
              {chartData.map((entry, index) => {
                let color = "var(--primary)"
                if (entry.name === "Available") color = "oklch(0.627 0.194 149.214)"
                else if (entry.name === "In Shop") color = "oklch(0.769 0.188 70.08)"
                else if (entry.name === "Retired") color = "var(--muted-foreground)"
                return <Cell key={`cell-${index}`} fill={color} />
              })}
            </Pie>
          </PieChart>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-4">
        {Object.entries(statusBreakdown).map(([status, count]) => {
          const total = Object.values(statusBreakdown).reduce((a, b) => a + b, 0)
          const percentage = total > 0 ? (count / total) * 100 : 0
          return (
            <div key={status} className="flex items-center gap-2 p-1.5 rounded-lg border border-border bg-muted/20">
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-xs shrink-0",
                  status === "Available" && "bg-emerald-500",
                  status === "OnTrip" && "bg-primary",
                  status === "InShop" && "bg-amber-500",
                  status === "Retired" && "bg-muted-foreground"
                )}
              />
              <div className="flex flex-col min-w-0 leading-none">
                <span className="text-[10px] font-bold truncate text-foreground">
                  {status === "OnTrip" ? "On Trip" : status === "InShop" ? "In Shop" : status}
                </span>
                <span className="text-[9px] text-muted-foreground mt-0.5">
                  {count} ({Math.round(percentage)}%)
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
