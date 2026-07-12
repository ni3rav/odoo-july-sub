"use client"

import * as React from "react"
import { MaintenanceDataTable } from "@/components/maintenance/maintenance-data-table"
import { MaintenanceFiltersBar } from "@/components/maintenance/maintenance-filters-bar"
import { MaintenanceLogForm } from "@/components/maintenance/maintenance-log-form"
import { MaintenanceStatusFlow } from "@/components/maintenance/maintenance-status-flow"
import { useMaintenanceQuery } from "@/components/maintenance/maintenance-queries"
import type { MaintenanceQueryInput } from "@/modules/operations"

type MaintenanceWorkspaceProps = {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export function MaintenanceWorkspace({
  canCreate,
  canEdit,
  canDelete,
}: MaintenanceWorkspaceProps) {
  const [filters, setFilters] = React.useState<MaintenanceQueryInput>({})
  const maintenanceQuery = useMaintenanceQuery(filters)

  return (
    <div className="space-y-6">
      <MaintenanceStatusFlow />
      <MaintenanceLogForm canCreate={canCreate} />

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Service history
          </h2>
          <p className="text-sm text-muted-foreground">
            Review logged maintenance and close open records when work is done.
          </p>
        </div>

        <MaintenanceFiltersBar filters={filters} onFiltersChange={setFilters} />

        {maintenanceQuery.error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {maintenanceQuery.error.message}
          </div>
        )}

        <MaintenanceDataTable
          records={maintenanceQuery.data ?? []}
          loading={maintenanceQuery.isLoading}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>
    </div>
  )
}
