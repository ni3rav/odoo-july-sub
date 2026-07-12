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
import { formatCurrency } from "@/components/operations/format"
import type { FuelLogRecord } from "@/components/operations/operations-queries"

type FuelLogDataTableProps = {
  fuelLogs: FuelLogRecord[]
  loading: boolean
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value)
  )
}

export function FuelLogDataTable({ fuelLogs, loading }: FuelLogDataTableProps) {
  const columns = React.useMemo<ColumnDef<FuelLogRecord>[]>(
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
        accessorKey: "date",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Date" />
        ),
        cell: ({ row }) => formatDate(row.getValue("date")),
      },
      {
        accessorKey: "liters",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Liters" />
        ),
        cell: ({ row }) => `${row.getValue("liters")} L`,
      },
      {
        accessorKey: "cost",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Cost" />
        ),
        cell: ({ row }) => formatCurrency(row.getValue("cost")),
      },
    ],
    []
  )

  const table = useReactTable({
    data: fuelLogs,
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
        rowCount={5}
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
      className="rounded-xl bg-card"
    />
  )
}
