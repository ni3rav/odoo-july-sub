"use client"

import * as React from "react"
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton"
import { formatCurrency } from "@/components/operations/format"
import type { ExpenseRecord } from "@/components/operations/operations-queries"

type ExpenseDataTableProps = {
  expenses: ExpenseRecord[]
  loading: boolean
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value)
  )
}

export function ExpenseDataTable({ expenses, loading }: ExpenseDataTableProps) {
  const columns = React.useMemo<ColumnDef<ExpenseRecord>[]>(
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
        id: "trip",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Trip" />
        ),
        cell: ({ row }) => row.original.tripOrderId ?? "—",
      },
      {
        accessorKey: "category",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Category" />
        ),
        cell: ({ row }) => (
          <Badge variant="outline" className="capitalize">
            {row.getValue("category")}
          </Badge>
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
        accessorKey: "amount",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Amount" />
        ),
        cell: ({ row }) => formatCurrency(row.getValue("amount")),
      },
    ],
    []
  )

  const table = useReactTable({
    data: expenses,
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
