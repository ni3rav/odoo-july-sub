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
import { InventoryFormDialog } from "@/components/operations/inventory-form-dialog"
import {
  useDeleteInventoryItemMutation,
  type InventoryItemRecord,
} from "@/components/operations/operations-queries"
import { InventoryStatusBadge } from "@/components/operations/inventory-status-badge"
import { Button } from "@/components/ui/button"
import type { InventoryStatus } from "@/db/schema/constants"

type InventoryDataTableProps = {
  items: InventoryItemRecord[]
  loading: boolean
  canEdit: boolean
  canDelete: boolean
}

export function InventoryDataTable({
  items,
  loading,
  canEdit,
  canDelete,
}: InventoryDataTableProps) {
  const deleteMutation = useDeleteInventoryItemMutation()

  const columns = React.useMemo<ColumnDef<InventoryItemRecord>[]>(() => {
    const baseColumns: ColumnDef<InventoryItemRecord>[] = [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Item" />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.getValue("name")}
          </span>
        ),
      },
      {
        accessorKey: "quantity",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Quantity" />
        ),
      },
      {
        accessorKey: "reorderLevel",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Reorder Level" />
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} label="Status" />
        ),
        cell: ({ row }) => (
          <InventoryStatusBadge
            status={row.getValue("status") as InventoryStatus}
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
          <div className="flex items-center justify-end gap-2">
            {canEdit && (
              <InventoryFormDialog
                item={row.original}
                trigger={
                  <Button size="sm" variant="outline">
                    Edit
                  </Button>
                }
              />
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="outline"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(row.original.id)}
              >
                Delete
              </Button>
            )}
          </div>
        ),
      })
    }

    return baseColumns
  }, [canDelete, canEdit, deleteMutation])

  const table = useReactTable({
    data: items,
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
      className="rounded-xl border border-border bg-card"
    />
  )
}
