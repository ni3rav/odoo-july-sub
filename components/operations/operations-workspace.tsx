"use client"

import { CostSummary } from "@/components/operations/cost-summary"
import { ExpenseDataTable } from "@/components/operations/expense-data-table"
import { ExpenseFormDialog } from "@/components/operations/expense-form-dialog"
import { FuelLogDataTable } from "@/components/operations/fuel-log-data-table"
import { FuelLogFormDialog } from "@/components/operations/fuel-log-form-dialog"
import { InventoryDataTable } from "@/components/operations/inventory-data-table"
import { InventoryFormDialog } from "@/components/operations/inventory-form-dialog"
import {
  useExpensesQuery,
  useFuelLogsQuery,
  useInventoryQuery,
} from "@/components/operations/operations-queries"
import { Button } from "@/components/ui/button"

type OperationsWorkspaceProps = {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export function OperationsWorkspace({
  canCreate,
  canEdit,
  canDelete,
}: OperationsWorkspaceProps) {
  const fuelLogsQuery = useFuelLogsQuery({})
  const expensesQuery = useExpensesQuery({})
  const inventoryQuery = useInventoryQuery({})

  return (
    <div className="space-y-6">
      <CostSummary />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">Fuel Logs</h2>
          {canCreate && (
            <div className="flex gap-2">
              <FuelLogFormDialog trigger={<Button>+ Log Fuel</Button>} />
              <ExpenseFormDialog
                trigger={<Button variant="outline">+ Add Expense</Button>}
              />
            </div>
          )}
        </div>

        {fuelLogsQuery.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {fuelLogsQuery.error.message}
          </div>
        )}

        <FuelLogDataTable
          fuelLogs={fuelLogsQuery.data ?? []}
          loading={fuelLogsQuery.isLoading}
        />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">
          Other Expenses (Toll &amp; Misc)
        </h2>

        {expensesQuery.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {expensesQuery.error.message}
          </div>
        )}

        <ExpenseDataTable
          expenses={expensesQuery.data ?? []}
          loading={expensesQuery.isLoading}
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">Inventory</h2>
          {canCreate && (
            <InventoryFormDialog trigger={<Button>+ Add Item</Button>} />
          )}
        </div>

        {inventoryQuery.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {inventoryQuery.error.message}
          </div>
        )}

        <InventoryDataTable
          items={inventoryQuery.data ?? []}
          loading={inventoryQuery.isLoading}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>
    </div>
  )
}
