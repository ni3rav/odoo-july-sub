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
import { MaintenanceStatusBadge } from "@/components/maintenance/maintenance-status-badge"
import {
  useCloseMaintenanceMutation,
  useDeleteMaintenanceMutation,
  type MaintenanceRecord,
} from "@/components/maintenance/maintenance-queries"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { tryCatch } from "@/lib/try-catch"

type MaintenanceDataTableProps = {
  records: MaintenanceRecord[]
  loading: boolean
  canEdit: boolean
  canDelete: boolean
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(value)
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value)
}

export function MaintenanceDataTable({
  records,
  loading,
  canEdit,
  canDelete,
}: MaintenanceDataTableProps) {
  const closeMutation = useCloseMaintenanceMutation()
  const deleteMutation = useDeleteMaintenanceMutation()
  const [actionError, setActionError] = React.useState<string | null>(null)

  const columns = React.useMemo<ColumnDef<MaintenanceRecord>[]>(() => {
    const baseColumns: ColumnDef<MaintenanceRecord>[] = [
      {
        accessorKey: "date",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Date" />
        ),
        cell: ({ row }) => formatDate(row.original.date),
      },
      {
        id: "vehicle",
        header: "Vehicle",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.vehicleName} ({row.original.vehicleReg})
          </span>
        ),
      },
      {
        accessorKey: "serviceType",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Service" />
        ),
      },
      {
        accessorKey: "cost",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Cost" />
        ),
        cell: ({ row }) => formatCurrency(row.original.cost),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <MaintenanceStatusBadge status={row.original.status} />
        ),
      },
      {
        accessorKey: "notes",
        header: "Notes",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.notes || "—"}
          </span>
        ),
      },
    ]

    if (!canEdit && !canDelete) {
      return baseColumns
    }

    return [
      ...baseColumns,
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const record = row.original
          const isOpen = record.status === "Open"
          const isPending = closeMutation.isPending || deleteMutation.isPending

          return (
            <div className="flex flex-wrap gap-2">
              {canEdit && isOpen && (
                <Button
                  size="sm"
                  disabled={isPending}
                  onClick={async () => {
                    setActionError(null)
                    const { error } = await tryCatch(
                      closeMutation.mutateAsync(record.id)
                    )
                    if (error) {
                      setActionError(error.message)
                    }
                  }}
                >
                  {closeMutation.isPending && <Spinner />}
                  Close
                </Button>
              )}
              {canDelete && isOpen && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={async () => {
                    setActionError(null)
                    const { error } = await tryCatch(
                      deleteMutation.mutateAsync(record.id)
                    )
                    if (error) {
                      setActionError(error.message)
                    }
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
          )
        },
      },
    ]
  }, [canDelete, canEdit, closeMutation, deleteMutation])

  const table = useReactTable({
    data: records,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  if (loading) {
    return <DataTableSkeleton columnCount={columns.length} rowCount={6} />
  }

  return (
    <div className="space-y-3">
      {actionError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {actionError}
        </div>
      )}
      <DataTable table={table} />
    </div>
  )
}
