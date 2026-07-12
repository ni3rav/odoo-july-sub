"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { VehicleFiltersBar } from "@/components/fleet/vehicle-filters-bar"
import { VehicleFormDialog } from "@/components/fleet/vehicle-form-dialog"
import { VehicleDataGrid } from "@/components/fleet/vehicle-data-grid"
import { useVehiclesQuery } from "@/components/fleet/fleet-queries"
import type { VehicleQueryInput } from "@/modules/fleet"

type FleetWorkspaceProps = {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export function FleetWorkspace({
  canCreate,
  canEdit,
  canDelete,
}: FleetWorkspaceProps) {
  const [filters, setFilters] = React.useState<VehicleQueryInput>({})

  const allVehiclesQuery = useVehiclesQuery({})
  const filteredVehiclesQuery = useVehiclesQuery(filters)

  const typeOptions = React.useMemo(
    () =>
      Array.from(
        new Set((allVehiclesQuery.data ?? []).map((vehicle) => vehicle.type))
      ).sort(),
    [allVehiclesQuery.data]
  )

  const regionOptions = React.useMemo(
    () =>
      Array.from(
        new Set((allVehiclesQuery.data ?? []).map((vehicle) => vehicle.region))
      ).sort(),
    [allVehiclesQuery.data]
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <VehicleFiltersBar
          filters={filters}
          onFiltersChange={setFilters}
          typeOptions={typeOptions}
          regionOptions={regionOptions}
        />
        {canCreate && (
          <VehicleFormDialog trigger={<Button>+ Add Vehicle</Button>} />
        )}
      </div>

      {filteredVehiclesQuery.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {filteredVehiclesQuery.error.message}
        </div>
      )}

      <VehicleDataGrid
        vehicles={filteredVehiclesQuery.data ?? []}
        loading={filteredVehiclesQuery.isLoading}
        canEdit={canEdit}
        canDelete={canDelete}
      />
    </div>
  )
}
