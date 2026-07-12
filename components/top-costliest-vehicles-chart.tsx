"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface TopCostliestVehiclesChartProps {
  vehicles: {
    vehicleName: string
    vehicleReg: string
    totalCost: number
  }[]
}

export function TopCostliestVehiclesChart({
  vehicles,
}: TopCostliestVehiclesChartProps) {
  const chartConfig = {
    totalCost: {
      label: "Total Cost",
      color: "var(--primary)",
    },
  }

  const chartData = vehicles.map((v) => ({
    label: v.vehicleReg,
    totalCost: v.totalCost,
  }))

  return (
    <div className="h-[220px] w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid horizontal={false} strokeDasharray="3 3" />
          <XAxis
            type="number"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₹${value}`}
          />
          <YAxis
            dataKey="label"
            type="category"
            tickLine={false}
            axisLine={false}
            width={72}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Bar
            dataKey="totalCost"
            fill="var(--color-totalCost)"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
