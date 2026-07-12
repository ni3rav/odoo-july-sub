"use client"

import * as React from "react"
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TripRow {
  id: string
  orderId: string
  source: string
  destination: string
  vehicleName: string
  vehicleReg: string
  driverName: string
  revenue: number
  status: string
  createdAt: string | Date
}

interface RecentTripsTableProps {
  trips: TripRow[]
}

const statusColors: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground border-border",
  Dispatched: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  InTransit: "bg-primary/10 text-primary border-primary/20",
  Completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
}

export function RecentTripsTable({ trips }: RecentTripsTableProps) {
  const data = React.useMemo(
    () =>
      trips.map((trip) => ({
        ...trip,
        id: trip.id || trip.orderId,
      })),
    [trips]
  )

  const columns = React.useMemo<ColumnDef<(typeof data)[number]>[]>(
    () => [
      {
        accessorKey: "orderId",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label="Trip ID"
            className="text-xs font-semibold uppercase tracking-wide"
          />
        ),
        cell: ({ row }) => (
          <span className="text-xs font-semibold text-foreground">
            {row.getValue("orderId")}
          </span>
        ),
      },
      {
        id: "route",
        accessorFn: (row) => `${row.source} → ${row.destination}`,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label="Route"
            className="text-xs font-semibold uppercase tracking-wide"
          />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-foreground">{row.getValue("route")}</span>
        ),
      },
      {
        id: "vehicle",
        accessorFn: (row) => `${row.vehicleName} (${row.vehicleReg})`,
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label="Vehicle"
            className="text-xs font-semibold uppercase tracking-wide"
          />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-foreground">
            {row.getValue("vehicle")}
          </span>
        ),
      },
      {
        accessorKey: "driverName",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label="Driver"
            className="text-xs font-semibold uppercase tracking-wide"
          />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-foreground">
            {row.getValue("driverName")}
          </span>
        ),
      },
      {
        accessorKey: "revenue",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label="Revenue"
            className="text-xs font-semibold uppercase tracking-wide"
          />
        ),
        cell: ({ row }) => (
          <span className="text-xs font-medium text-foreground">
            $
            {Number(row.getValue("revenue")).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            label="Status"
            className="text-xs font-semibold uppercase tracking-wide"
          />
        ),
        cell: ({ row }) => {
          const status = row.getValue("status") as string
          return (
            <Badge
              variant="outline"
              className={cn(
                "rounded border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                statusColors[status] || "bg-muted text-muted-foreground"
              )}
            >
              {status}
            </Badge>
          )
        },
      },
    ],
    []
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: false,
    initialState: {
      pagination: { pageSize: 5 },
    },
  })

  return (
    <DataTable
      table={table}
      pageSizeOptions={[5, 10]}
      showSelectionSummary={false}
      className="max-h-96 overflow-hidden rounded-xl border border-border bg-card"
    />
  )
}
