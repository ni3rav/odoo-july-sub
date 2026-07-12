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
import { Button } from "@/components/ui/button"
import { VehicleStatusBadge } from "@/components/fleet/vehicle-status-badge"
import { VehicleFormDialog } from "@/components/fleet/vehicle-form-dialog"
import {
  useRetireVehicleMutation,
  type VehicleRecord,
} from "@/components/fleet/fleet-queries"
import type { VehicleStatus } from "@/db/schema/constants"

type VehicleDataGridProps = {
  vehicles: VehicleRecord[]
  loading: boolean
  canEdit: boolean
  canDelete: boolean
}

export function VehicleDataGrid({
  vehicles,
  loading,
  canEdit,
  canDelete,
}: VehicleDataGridProps) {
  const retireMutation = useRetireVehicleMutation()

  const columns = React.useMemo<ColumnDef<VehicleRecord>[]>(() => {
    const baseColumns: ColumnDef<VehicleRecord>[] = [
      {
        accessorKey: "registrationNumber",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Reg. No. (Unique)" />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-foreground">
            {row.getValue("registrationNumber")}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Name/Model" />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-foreground">
            {row.getValue("name")}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Type" />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-foreground">
            {row.getValue("type")}
          </span>
        ),
      },
      {
        accessorKey: "maxLoadCapacityKg",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Capacity (kg)" />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-foreground">
            {row.getValue("maxLoadCapacityKg")}
          </span>
        ),
      },
      {
        accessorKey: "odometerKm",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Odometer (km)" />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-foreground">
            {row.getValue("odometerKm")}
          </span>
        ),
      },
      {
        accessorKey: "acquisitionCost",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Acq. Cost" />
        ),
        cell: ({ row }) => (
          <span className="text-xs text-foreground">
            {row.getValue("acquisitionCost")}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Status" />
        ),
        cell: ({ row }) => (
          <VehicleStatusBadge
            status={row.getValue("status") as VehicleStatus}
          />
        ),
      },
    ]

    if (canEdit || canDelete) {
      baseColumns.push({
        id: "actions",
        enableSorting: false,
        header: () => null,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {canEdit && (
              <VehicleFormDialog
                vehicle={row.original}
                trigger={
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                }
              />
            )}
            {canDelete && row.original.status !== "Retired" && (
              <Button
                size="sm"
                variant="outline"
                disabled={retireMutation.isPending}
                onClick={() => retireMutation.mutate(row.original.id)}
              >
                Retire
              </Button>
            )}
          </div>
        ),
      })
    }

    return baseColumns
  }, [canDelete, canEdit, retireMutation])

  const table = useReactTable({
    data: vehicles,
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
        withViewOptions={false}
        filterCount={0}
      />
    )
  }

  return (
    <DataTable
      table={table}
      pageSizeOptions={[10, 25, 50]}
      showSelectionSummary={false}
      className="rounded-xl bg-card"
    />
  )
}
