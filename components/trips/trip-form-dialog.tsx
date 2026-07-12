"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useDriversQuery } from "@/components/drivers/driver-queries"
import { useVehiclesQuery } from "@/components/fleet/fleet-queries"
import {
  useCreateTripMutation,
  useUpdateTripMutation,
  type TripRecord,
} from "@/components/trips/trip-queries"
import { tryCatch } from "@/lib/try-catch"
import { createTripSchema, type CreateTripInput } from "@/modules/trips"

type TripFormDialogProps = {
  trigger: React.ReactNode
  trip?: TripRecord
}

function isDispatchEligible(licenseExpiryDate: Date | string, status: string) {
  const expired = new Date(licenseExpiryDate) < new Date()
  return status === "Available" && !expired
}

export function TripFormDialog({ trigger, trip }: TripFormDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const isEdit = Boolean(trip)

  const vehiclesQuery = useVehiclesQuery({ status: "Available" })
  const driversQuery = useDriversQuery({ status: "Available" })
  const createMutation = useCreateTripMutation()
  const updateMutation = useUpdateTripMutation()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const availableDrivers = React.useMemo(
    () =>
      (driversQuery.data ?? []).filter((driver) =>
        isDispatchEligible(driver.licenseExpiryDate, driver.status)
      ),
    [driversQuery.data]
  )

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTripInput>({
    resolver: zodResolver(createTripSchema),
    defaultValues: trip
      ? {
          orderId: trip.orderId,
          source: trip.source,
          destination: trip.destination,
          vehicleId: trip.vehicleId,
          driverId: trip.driverId,
          cargoWeightKg: trip.cargoWeightKg,
          plannedDistanceKm: trip.plannedDistanceKm,
          revenue: trip.revenue ?? undefined,
        }
      : {
          source: "",
          destination: "",
          vehicleId: "",
          driverId: "",
          cargoWeightKg: 0,
          plannedDistanceKm: 0,
        },
  })

  async function onSubmit(values: CreateTripInput) {
    setFormError(null)
    const { error } = await tryCatch(
      isEdit && trip
        ? updateMutation.mutateAsync({ id: trip.id, input: values })
        : createMutation.mutateAsync(values)
    )

    if (error) {
      setFormError(error.message)
      return
    }

    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit trip" : "Create trip"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update draft trip details before dispatch."
              : "Plan a new cargo movement and assign vehicle and driver."}
          </DialogDescription>
        </DialogHeader>

        {formError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="order-id">Trip ID</Label>
              <Input
                id="order-id"
                placeholder="Auto-generated if empty"
                {...register("orderId")}
              />
              {errors.orderId && (
                <p className="text-sm text-destructive">
                  {errors.orderId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="revenue">Revenue (optional)</Label>
              <Input
                id="revenue"
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

            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input id="source" {...register("source")} />
              {errors.source && (
                <p className="text-sm text-destructive">
                  {errors.source.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" {...register("destination")} />
              {errors.destination && (
                <p className="text-sm text-destructive">
                  {errors.destination.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle-id">Vehicle</Label>
              <Controller
                control={control}
                name="vehicleId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="vehicle-id" className="w-full">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {(vehiclesQuery.data ?? []).map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.name} ({vehicle.registrationNumber}) ·{" "}
                          {vehicle.maxLoadCapacityKg} kg
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.vehicleId && (
                <p className="text-sm text-destructive">
                  {errors.vehicleId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver-id">Driver</Label>
              <Controller
                control={control}
                name="driverId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="driver-id" className="w-full">
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name} ({driver.licenseNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.driverId && (
                <p className="text-sm text-destructive">
                  {errors.driverId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo-weight">Cargo weight (kg)</Label>
              <Input
                id="cargo-weight"
                type="number"
                {...register("cargoWeightKg", { valueAsNumber: true })}
              />
              {errors.cargoWeightKg && (
                <p className="text-sm text-destructive">
                  {errors.cargoWeightKg.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="planned-distance">Planned distance (km)</Label>
              <Input
                id="planned-distance"
                type="number"
                {...register("plannedDistanceKm", { valueAsNumber: true })}
              />
              {errors.plannedDistanceKm && (
                <p className="text-sm text-destructive">
                  {errors.plannedDistanceKm.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isEdit ? "Save changes" : "Create trip"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
