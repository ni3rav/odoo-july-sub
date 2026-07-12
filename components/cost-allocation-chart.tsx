"use client"

import { PieChart, Pie } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { cn } from "@/lib/utils"

interface CostBreakdownItem {
  name: string
  value: number
}

interface CostAllocationChartProps {
  costBreakdown: CostBreakdownItem[]
}

export function CostAllocationChart({ costBreakdown }: CostAllocationChartProps) {
  const costConfig = {
    Fuel: { label: "Fuel", color: "oklch(0.637 0.208 25.331)" },
    Maintenance: { label: "Maintenance", color: "oklch(0.769 0.188 70.08)" },
    Tolls: { label: "Tolls & Fees", color: "oklch(0.623 0.188 259.815)" },
  }

  const costData = costBreakdown.map((item) => {
    let fill = "oklch(0.623 0.188 259.815)"
    let name = "Tolls"
    if (item.name === "Fuel") {
      fill = "oklch(0.637 0.208 25.331)"
      name = "Fuel"
    } else if (item.name === "Maintenance") {
      fill = "oklch(0.769 0.188 70.08)"
      name = "Maintenance"
    }
    return {
      name,
      value: item.value,
      fill,
    }
  })

  return (
    <div className="flex-1 flex flex-col justify-between pb-6">
      <div className="flex-1 flex items-center justify-center min-h-[180px]">
        <ChartContainer config={costConfig} className="mx-auto aspect-square w-full max-h-[160px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={costData}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={70}
              strokeWidth={3}
              stroke="var(--card)"
            />
          </PieChart>
        </ChartContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        {costBreakdown.map((item) => {
          const total = costBreakdown.reduce((acc, c) => acc + c.value, 0)
          const pct = total > 0 ? (item.value / total) * 100 : 0
          return (
            <div key={item.name} className="flex flex-col p-2 rounded-lg border border-border bg-muted/20 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div
                  className={cn(
                    "h-2 w-2 rounded-xs shrink-0",
                    item.name === "Fuel" && "bg-rose-500",
                    item.name === "Maintenance" && "bg-amber-500",
                    item.name === "Tolls & Fees" && "bg-blue-500"
                  )}
                />
                <span className="text-[10px] font-bold text-foreground truncate">
                  {item.name}
                </span>
              </div>
              <span className="text-[11px] font-semibold text-card-foreground">
                ${Number(item.value).toLocaleString()}
              </span>
              <span className="text-[9px] text-muted-foreground mt-0.5">
                {Math.round(pct)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
