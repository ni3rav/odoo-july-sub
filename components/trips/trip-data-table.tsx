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
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { TripFormDialog } from "@/components/trips/trip-form-dialog"
import { TripStatusBadge } from "@/components/trips/trip-status-badge"
import { Button } from "@/components/ui/button"
import type { TripStatus } from "@/db/schema/constants"
import type { TripRecord } from "@/components/trips/trip-queries"

type TripDataTableProps = {
  trips: TripRecord[]
  loading: boolean
  selectedTripId: string | null
  onSelectTrip: (tripId: string) => void
  canEdit: boolean
}

export function TripDataTable({
  trips,
  loading,
  selectedTripId,
  onSelectTrip,
  canEdit,
}: TripDataTableProps) {
  const columns = React.useMemo<ColumnDef<TripRecord>[]>(() => {
    const baseColumns: ColumnDef<TripRecord>[] = [
      {
        accessorKey: "orderId",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Trip ID" />
        ),
      },
      {
        id: "route",
        accessorFn: (row) => `${row.source} → ${row.destination}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Route" />
        ),
      },
      {
        id: "vehicle",
        accessorFn: (row) => `${row.vehicleName} (${row.vehicleReg})`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Vehicle" />
        ),
      },
      {
        accessorKey: "driverName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Driver" />
        ),
      },
      {
        accessorKey: "cargoWeightKg",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Cargo (kg)" />
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Status" />
        ),
        cell: ({ row }) => (
          <TripStatusBadge status={row.getValue("status") as TripStatus} />
        ),
      },
      {
        id: "manage",
        enableSorting: false,
        header: () => null,
        cell: ({ row }) => (
          <Button
            size="sm"
            variant={selectedTripId === row.original.id ? "default" : "outline"}
            onClick={() => onSelectTrip(row.original.id)}
          >
            Manage
          </Button>
        ),
      },
    ]

    if (canEdit) {
      baseColumns.splice(baseColumns.length - 1, 0, {
        id: "actions",
        enableSorting: false,
        header: () => null,
        cell: ({ row }) =>
          row.original.status === "Draft" ? (
            <TripFormDialog
              trip={row.original}
              trigger={
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              }
            />
          ) : null,
      })
    }

    return baseColumns
  }, [canEdit, onSelectTrip, selectedTripId])

  const table = useReactTable({
    data: trips,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: false,
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  if (loading) {
    return (
      <DataTableSkeleton
        columnCount={columns.length}
        rowCount={10}
        filterCount={0}
        withViewOptions={false}
      />
    )
  }

  return (
    <DataTable
      table={table}
      pageSizeOptions={[10, 25, 50]}
      showSelectionSummary={false}
      className="rounded-xl border border-border bg-card"
    />
  )
}
