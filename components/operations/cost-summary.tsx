"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useCostSummaryQuery } from "@/components/operations/operations-queries"
import { Skeleton } from "@/components/ui/skeleton"

function formatCurrency(value: number) {
  return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
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
            {formatCurrency(summary?.fleetTotal ?? 0)}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {costSummaryQuery.isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Fuel</TableHead>
                  <TableHead>Maintenance</TableHead>
                  <TableHead>Expenses</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary?.byVehicle.length ? (
                  summary.byVehicle.map((row) => (
                    <TableRow key={row.vehicleId}>
                      <TableCell className="font-medium text-foreground">
                        {row.vehicleName} ({row.vehicleReg})
                      </TableCell>
                      <TableCell>{formatCurrency(row.fuelCost)}</TableCell>
                      <TableCell>
                        {formatCurrency(row.maintenanceCost)}
                      </TableCell>
                      <TableCell>{formatCurrency(row.expenseCost)}</TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatCurrency(row.totalCost)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-16 text-center">
                      No cost data yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
