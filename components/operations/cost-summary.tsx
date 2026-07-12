"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCostSummaryQuery } from "@/components/operations/operations-queries"
import { VehicleCostDataTable } from "@/components/operations/vehicle-cost-data-table"
import { Skeleton } from "@/components/ui/skeleton"

function formatFleetTotal(value: number) {
  return `₹${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

export function CostSummary() {
  const costSummaryQuery = useCostSummaryQuery()
  const summary = costSummaryQuery.data

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-lg text-card-foreground">
            Total Operational Cost
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Fuel + Maintenance + Expenses, per vehicle and fleet-wide
          </p>
        </div>
        {costSummaryQuery.isLoading ? (
          <Skeleton className="h-9 w-32" />
        ) : (
          <div className="text-3xl font-bold tracking-tight text-primary">
            {formatFleetTotal(summary?.fleetTotal ?? 0)}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <VehicleCostDataTable
          rows={summary?.byVehicle ?? []}
          loading={costSummaryQuery.isLoading}
        />
      </CardContent>
    </Card>
  )
}
