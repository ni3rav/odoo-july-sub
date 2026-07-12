"use client"

import * as React from "react"
import { TripDataTable } from "@/components/trips/trip-data-table"
import { TripDispatcherPanel } from "@/components/trips/trip-dispatcher-panel"
import { TripFiltersBar } from "@/components/trips/trip-filters-bar"
import { TripFormDialog } from "@/components/trips/trip-form-dialog"
import { useTripsQuery } from "@/components/trips/trip-queries"
import { Button } from "@/components/ui/button"
import type { TripQueryInput } from "@/modules/trips"

type TripsWorkspaceProps = {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

export function TripsWorkspace({
  canCreate,
  canEdit,
  canDelete,
}: TripsWorkspaceProps) {
  const [filters, setFilters] = React.useState<TripQueryInput>({})
  const [selectedTripId, setSelectedTripId] = React.useState<string | null>(
    null
  )
  const tripsQuery = useTripsQuery(filters)

  const visibleSelectedTripId =
    selectedTripId &&
    tripsQuery.data?.some((trip) => trip.id === selectedTripId)
      ? selectedTripId
      : null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TripFiltersBar filters={filters} onFiltersChange={setFilters} />
        {canCreate && (
          <TripFormDialog trigger={<Button>+ Create Trip</Button>} />
        )}
      </div>

      {tripsQuery.error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {tripsQuery.error.message}
        </div>
      )}

      <TripDataTable
        trips={tripsQuery.data ?? []}
        loading={tripsQuery.isLoading}
        selectedTripId={visibleSelectedTripId}
        onSelectTrip={setSelectedTripId}
        canEdit={canEdit}
      />

      {visibleSelectedTripId && (
        <TripDispatcherPanel
          tripId={visibleSelectedTripId}
          canEdit={canEdit}
          canDelete={canDelete}
          onDeleted={() => setSelectedTripId(null)}
        />
      )}
    </div>
  )
}
