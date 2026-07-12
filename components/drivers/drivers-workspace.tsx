"use client"

import * as React from "react"
import { DriverDataTable } from "@/components/drivers/driver-data-table"
import { DriverFiltersBar } from "@/components/drivers/driver-filters-bar"
import { DriverFormDialog } from "@/components/drivers/driver-form-dialog"
import { useDriversQuery } from "@/components/drivers/driver-queries"
import { Button } from "@/components/ui/button"
import type { DriverQueryInput } from "@/modules/fleet"

type DriversWorkspaceProps = {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export function DriversWorkspace({
  canCreate,
  canEdit,
  canDelete,
}: DriversWorkspaceProps) {
  const [filters, setFilters] = React.useState<DriverQueryInput>({})
  const driversQuery = useDriversQuery(filters)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DriverFiltersBar filters={filters} onFiltersChange={setFilters} />
        {canCreate && (
          <DriverFormDialog trigger={<Button>+ Add Driver</Button>} />
        )}
      </div>

      {driversQuery.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {driversQuery.error.message}
        </div>
      )}

      <DriverDataTable
        drivers={driversQuery.data ?? []}
        loading={driversQuery.isLoading}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  )
}
