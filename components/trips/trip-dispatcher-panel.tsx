"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { TripStepper } from "@/components/trips/trip-stepper"
import { TripStatusBadge } from "@/components/trips/trip-status-badge"
import {
  useCancelTripMutation,
  useCompleteTripMutation,
  useDeleteTripMutation,
  useDispatchPreviewQuery,
  useDispatchTripMutation,
  useStartTransitMutation,
  useTripQuery,
} from "@/components/trips/trip-queries"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { tryCatch } from "@/lib/try-catch"
import { completeTripSchema, type CompleteTripInput } from "@/modules/trips"

type TripDispatcherPanelProps = {
  tripId: string
  canEdit: boolean
  canDelete: boolean
  onDeleted: () => void
}

export function TripDispatcherPanel({
  tripId,
  canEdit,
  canDelete,
  onDeleted,
}: TripDispatcherPanelProps) {
  const [actionError, setActionError] = React.useState<string | null>(null)
  const tripQuery = useTripQuery(tripId)
  const dispatchPreviewQuery = useDispatchPreviewQuery(
    tripId,
    tripQuery.data?.status === "Draft"
  )
  const dispatchMutation = useDispatchTripMutation()
  const startTransitMutation = useStartTransitMutation()
  const completeMutation = useCompleteTripMutation()
  const cancelMutation = useCancelTripMutation()
  const deleteMutation = useDeleteTripMutation()

  const completeForm = useForm<CompleteTripInput>({
    resolver: zodResolver(completeTripSchema),
  })

  React.useEffect(() => {
    if (tripQuery.data) {
      completeForm.reset({
        actualOdometerKm: undefined,
        fuelConsumedLiters: undefined,
        revenue: tripQuery.data.revenue ?? undefined,
      })
    }
  }, [completeForm, tripQuery.data])

  if (tripQuery.isLoading || !tripQuery.data) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center py-12">
          <Spinner />
        </CardContent>
      </Card>
    )
  }

  const trip = tripQuery.data
  const previewErrors = dispatchPreviewQuery.data?.errors ?? []
  const isPending =
    dispatchMutation.isPending ||
    startTransitMutation.isPending ||
    completeMutation.isPending ||
    cancelMutation.isPending ||
    deleteMutation.isPending

  async function runAction(action: () => Promise<unknown>) {
    setActionError(null)
    const { error } = await tryCatch(action())
    if (error) {
      setActionError(error.message)
    }
  }

  async function onComplete(values: CompleteTripInput) {
    await runAction(() =>
      completeMutation.mutateAsync({ id: tripId, input: values })
    )
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = completeForm

  return (
    <Card className="border-border bg-card">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg text-card-foreground">
              Trip {trip.orderId}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {trip.source} → {trip.destination}
            </p>
          </div>
          <TripStatusBadge status={trip.status} />
        </div>
        <TripStepper status={trip.status} />
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm md:grid-cols-2">
          <p>
            <span className="text-muted-foreground">Vehicle:</span>{" "}
            {trip.vehicleName} ({trip.vehicleReg})
          </p>
          <p>
            <span className="text-muted-foreground">Driver:</span>{" "}
            {trip.driverName}
          </p>
          <p>
            <span className="text-muted-foreground">Cargo:</span>{" "}
            {trip.cargoWeightKg} kg / {trip.vehicleMaxLoadKg} kg capacity
          </p>
          <p>
            <span className="text-muted-foreground">Planned distance:</span>{" "}
            {trip.plannedDistanceKm} km
          </p>
        </div>

        {actionError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {actionError}
          </div>
        )}

        {trip.status === "Draft" && previewErrors.length > 0 && (
          <div className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            {previewErrors.join(" ")}
          </div>
        )}

        {canEdit && trip.status === "Draft" && (
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={isPending || previewErrors.length > 0}
              onClick={() =>
                runAction(() => dispatchMutation.mutateAsync(tripId))
              }
            >
              {dispatchMutation.isPending && <Spinner />}
              Dispatch trip
            </Button>
          </div>
        )}

        {canEdit && trip.status === "Dispatched" && (
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={isPending}
              onClick={() =>
                runAction(() => startTransitMutation.mutateAsync(tripId))
              }
            >
              {startTransitMutation.isPending && <Spinner />}
              Start transit
            </Button>
            <Button
              variant="outline"
              disabled={isPending}
              onClick={() =>
                runAction(() => cancelMutation.mutateAsync(tripId))
              }
            >
              Cancel trip
            </Button>
          </div>
        )}

        {canEdit && trip.status === "InTransit" && (
          <div className="space-y-4">
            <form onSubmit={handleSubmit(onComplete)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="actual-odometer">Final odometer (km)</Label>
                  <Input
                    id="actual-odometer"
                    type="number"
                    {...register("actualOdometerKm", { valueAsNumber: true })}
                  />
                  {errors.actualOdometerKm && (
                    <p className="text-sm text-destructive">
                      {errors.actualOdometerKm.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuel-consumed">Fuel consumed (L)</Label>
                  <Input
                    id="fuel-consumed"
                    type="number"
                    step="0.01"
                    {...register("fuelConsumedLiters", { valueAsNumber: true })}
                  />
                  {errors.fuelConsumedLiters && (
                    <p className="text-sm text-destructive">
                      {errors.fuelConsumedLiters.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complete-revenue">Revenue</Label>
                  <Input
                    id="complete-revenue"
                    type="number"
                    step="0.01"
                    {...register("revenue", { valueAsNumber: true })}
                  />
                  {errors.revenue && (
                    <p className="text-sm text-destructive">
                      {errors.revenue.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={isPending}>
                  {completeMutation.isPending && <Spinner />}
                  Complete trip
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isPending}
                  onClick={() =>
                    runAction(() => cancelMutation.mutateAsync(tripId))
                  }
                >
                  Cancel trip
                </Button>
              </div>
            </form>
          </div>
        )}

        {canDelete && trip.status === "Draft" && (
          <Button
            variant="outline"
            disabled={isPending}
            onClick={async () => {
              const { error } = await tryCatch(
                deleteMutation.mutateAsync(tripId)
              )
              if (error) {
                setActionError(error.message)
                return
              }
              onDeleted()
            }}
          >
            Delete draft
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
