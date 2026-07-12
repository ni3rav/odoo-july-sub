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
import { DriverFormDialog } from "@/components/drivers/driver-form-dialog"
import {
  useSuspendDriverMutation,
  type DriverRecord,
} from "@/components/drivers/driver-queries"
import { DriverStatusBadge } from "@/components/drivers/driver-status-badge"
import { SafetyScore } from "@/components/drivers/safety-score"
import { Button } from "@/components/ui/button"
import type { DriverStatus } from "@/db/schema/constants"
import { cn } from "@/lib/utils"

type DriverDataTableProps = {
  drivers: DriverRecord[]
  loading: boolean
  canEdit: boolean
  canDelete: boolean
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value)
  )
}

export function DriverDataTable({
  drivers,
  loading,
  canEdit,
  canDelete,
}: DriverDataTableProps) {
  const suspendMutation = useSuspendDriverMutation()

  const columns = React.useMemo<ColumnDef<DriverRecord>[]>(() => {
    const baseColumns: ColumnDef<DriverRecord>[] = [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Driver" />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.getValue("name")}
          </span>
        ),
      },
      {
        accessorKey: "licenseNumber",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="License No." />
        ),
      },
      {
        accessorKey: "licenseCategory",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Category" />
        ),
      },
      {
        accessorKey: "licenseExpiryDate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="License Expiry" />
        ),
        cell: ({ row }) => {
          const expiry = row.original.licenseExpiryDate
          const expired = new Date(expiry) < new Date()
          return (
            <span className={cn(expired && "text-destructive")}>
              {formatDate(expiry)}
            </span>
          )
        },
      },
      {
        accessorKey: "contactNumber",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Contact" />
        ),
      },
      {
        accessorKey: "safetyScore",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Safety Score" />
        ),
        cell: ({ row }) => <SafetyScore score={row.getValue("safetyScore")} />,
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Status" />
        ),
        cell: ({ row }) => (
          <DriverStatusBadge status={row.getValue("status") as DriverStatus} />
        ),
      },
    ]

    if (canEdit || canDelete) {
      baseColumns.push({
        id: "actions",
        enableSorting: false,
        header: () => null,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            {canEdit && (
              <DriverFormDialog
                driver={row.original}
                trigger={
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                }
              />
            )}
            {canDelete && row.original.status !== "Suspended" && (
              <Button
                size="sm"
                variant="outline"
                disabled={
                  suspendMutation.isPending || row.original.status === "OnTrip"
                }
                onClick={() => suspendMutation.mutate(row.original.id)}
              >
                Suspend
              </Button>
            )}
          </div>
        ),
      })
    }

    return baseColumns
  }, [canDelete, canEdit, suspendMutation])

  const table = useReactTable({
    data: drivers,
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
      className="rounded-xl bg-card"
    />
  )
}
