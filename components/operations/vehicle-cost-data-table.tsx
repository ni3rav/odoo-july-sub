"use client"

import * as React from "react"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/components/operations/format"
import type { VehicleCostRow } from "@/components/operations/operations-queries"

type VehicleCostDataTableProps = {
  rows: VehicleCostRow[]
  loading: boolean
}

function matchesVehicleSearch(row: VehicleCostRow, search: string) {
  const needle = search.toLowerCase()
  return (
    row.vehicleName.toLowerCase().includes(needle) ||
    row.vehicleReg.toLowerCase().includes(needle)
  )
}

export function VehicleCostDataTable({
  rows,
  loading,
}: VehicleCostDataTableProps) {
  const [search, setSearch] = React.useState("")

  const columns = React.useMemo<ColumnDef<VehicleCostRow>[]>(
    () => [
      {
        id: "vehicle",
        accessorFn: (row) => `${row.vehicleName} (${row.vehicleReg})`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Vehicle" />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.vehicleName} ({row.original.vehicleReg})
          </span>
        ),
      },
      {
        accessorKey: "fuelCost",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Fuel" />
        ),
        cell: ({ row }) => formatCurrency(row.getValue("fuelCost")),
      },
      {
        accessorKey: "maintenanceCost",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Maintenance" />
        ),
        cell: ({ row }) => formatCurrency(row.getValue("maintenanceCost")),
      },
      {
        accessorKey: "expenseCost",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Expenses" />
        ),
        cell: ({ row }) => formatCurrency(row.getValue("expenseCost")),
      },
      {
        accessorKey: "totalCost",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Total" />
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-foreground">
            {formatCurrency(row.getValue("totalCost"))}
          </span>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (row) => row.vehicleId,
    enableRowSelection: false,
    state: { globalFilter: search },
    onGlobalFilterChange: setSearch,
    globalFilterFn: (row, _columnId, filterValue) =>
      matchesVehicleSearch(row.original, String(filterValue)),
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  if (loading) {
    return (
      <DataTableSkeleton
        columnCount={columns.length}
        rowCount={5}
        filterCount={1}
        withViewOptions={false}
      />
    )
  }

  return (
    <DataTable
      table={table}
      pageSizeOptions={[10, 25, 50]}
      showSelectionSummary={false}
      className="rounded-xl bg-card"
    >
      <Input
        placeholder="Search vehicle..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-56"
      />
    </DataTable>
  )
}
