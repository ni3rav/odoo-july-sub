"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormErrorBanner } from "@/components/form/form-error-banner"
import { fieldErrorClassName, FormField } from "@/components/form/form-field"
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
import { Combobox, type ComboboxOption } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useDriversQuery } from "@/components/drivers/driver-queries"
import { useVehiclesQuery } from "@/components/fleet/fleet-queries"
import { TripLocationPickerDialog } from "@/components/trips/trip-location-picker-dialog"
import {
  useCreateTripMutation,
  useUpdateTripMutation,
  type TripRecord,
} from "@/components/trips/trip-queries"
import { MapPin } from "lucide-react"
import { handleFormSubmitError } from "@/lib/handle-form-submit-error"
import { tryCatch } from "@/lib/try-catch"
import { optionalNumberRegisterOptions } from "@/lib/zod-fields"
import {
  buildCreateTripSchema,
  formatCargoCapacityError,
  type CreateTripInput,
} from "@/modules/trips"

type TripFormDialogProps = {
  trigger: React.ReactNode
  trip?: TripRecord
}

function isDispatchEligible(licenseExpiryDate: Date | string, status: string) {
  const expired = new Date(licenseExpiryDate) < new Date()
  return status === "Available" && !expired
}

const emptyTripValues = {
  orderId: "",
  source: "",
  destination: "",
  vehicleId: "",
  driverId: "",
  cargoWeightKg: Number.NaN,
  plannedDistanceKm: Number.NaN,
} satisfies CreateTripInput

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

  const vehicleOptions = React.useMemo<ComboboxOption[]>(
    () =>
      (vehiclesQuery.data ?? []).map((vehicle) => ({
        value: vehicle.id,
        label: `${vehicle.name} (${vehicle.registrationNumber}) · ${vehicle.maxLoadCapacityKg} kg`,
        keywords: [vehicle.registrationNumber, vehicle.type, vehicle.region],
      })),
    [vehiclesQuery.data]
  )

  const driverOptions = React.useMemo<ComboboxOption[]>(
    () =>
      availableDrivers.map((driver) => ({
        value: driver.id,
        label: `${driver.name} (${driver.licenseNumber})`,
        keywords: [driver.licenseNumber, driver.licenseCategory],
      })),
    [availableDrivers]
  )

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    clearErrors,
    watch,
    trigger: triggerValidation,
    formState: { errors },
  } = useForm<CreateTripInput>({
    resolver: zodResolver(buildCreateTripSchema()),
    mode: "onTouched",
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
      : emptyTripValues,
  })

  const selectedVehicleId = watch("vehicleId")

  const selectedVehicleCapacity = React.useMemo(() => {
    if (!selectedVehicleId) {
      return undefined
    }

    const matchedVehicle = vehiclesQuery.data?.find(
      (vehicle) => vehicle.id === selectedVehicleId
    )
    if (matchedVehicle) {
      return matchedVehicle.maxLoadCapacityKg
    }

    if (trip?.vehicleId === selectedVehicleId) {
      return trip.vehicleMaxLoadKg
    }

    return undefined
  }, [selectedVehicleId, trip, vehiclesQuery.data])

  React.useEffect(() => {
    void triggerValidation("cargoWeightKg")
  }, [selectedVehicleCapacity, triggerValidation])

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      setFormError(null)
      clearErrors()
      reset(
        trip
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
          : emptyTripValues
      )
    }
  }

  async function onSubmit(values: CreateTripInput) {
    setFormError(null)
    clearErrors()

    const parsed = buildCreateTripSchema(selectedVehicleCapacity).safeParse(
      values
    )
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === "string") {
          setError(field as keyof CreateTripInput, {
            type: "manual",
            message: issue.message,
          })
        }
      }
      return
    }

    const { error } = await tryCatch(
      isEdit && trip
        ? updateMutation.mutateAsync({ id: trip.id, input: parsed.data })
        : createMutation.mutateAsync(parsed.data)
    )

    if (error) {
      handleFormSubmitError(error, setError, setFormError)
      return
    }

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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

        <FormErrorBanner message={formError} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Trip ID"
              htmlFor="order-id"
              error={errors.orderId?.message}
            >
              <Input
                id="order-id"
                placeholder="Auto-generated if empty"
                aria-invalid={Boolean(errors.orderId)}
                className={fieldErrorClassName(errors.orderId?.message)}
                {...register("orderId")}
              />
            </FormField>

            <FormField
              label="Revenue (optional)"
              htmlFor="revenue"
              error={errors.revenue?.message}
            >
              <Input
                id="revenue"
                type="number"
                step="0.01"
                aria-invalid={Boolean(errors.revenue)}
                className={fieldErrorClassName(errors.revenue?.message)}
                {...register("revenue", optionalNumberRegisterOptions)}
              />
            </FormField>

            <div className="flex items-center justify-between md:col-span-2">
              <p className="text-sm text-muted-foreground">
                Source &amp; destination
              </p>
              <TripLocationPickerDialog
                trigger={
                  <Button type="button" variant="outline" size="sm">
                    <MapPin className="h-3.5 w-3.5" />
                    Pick on map
                  </Button>
                }
                onConfirm={(source, destination) => {
                  setValue("source", source, { shouldValidate: true })
                  setValue("destination", destination, {
                    shouldValidate: true,
                  })
                }}
              />
            </div>

            <FormField
              label="Source"
              htmlFor="source"
              error={errors.source?.message}
            >
              <Input
                id="source"
                placeholder="Type or pick on map"
                aria-invalid={Boolean(errors.source)}
                className={fieldErrorClassName(errors.source?.message)}
                {...register("source")}
              />
            </FormField>

            <FormField
              label="Destination"
              htmlFor="destination"
              error={errors.destination?.message}
            >
              <Input
                id="destination"
                placeholder="Type or pick on map"
                aria-invalid={Boolean(errors.destination)}
                className={fieldErrorClassName(errors.destination?.message)}
                {...register("destination")}
              />
            </FormField>

            <FormField
              label="Vehicle"
              htmlFor="vehicle-id"
              error={errors.vehicleId?.message}
            >
              <Controller
                control={control}
                name="vehicleId"
                render={({ field }) => (
                  <Combobox
                    id="vehicle-id"
                    options={vehicleOptions}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value)
                      void triggerValidation("cargoWeightKg")
                    }}
                    placeholder="Select vehicle"
                    searchPlaceholder="Search by name or registration..."
                    emptyText="No vehicles found."
                    aria-invalid={Boolean(errors.vehicleId)}
                    className={fieldErrorClassName(errors.vehicleId?.message)}
                  />
                )}
              />
            </FormField>

            <FormField
              label="Driver"
              htmlFor="driver-id"
              error={errors.driverId?.message}
            >
              <Controller
                control={control}
                name="driverId"
                render={({ field }) => (
                  <Combobox
                    id="driver-id"
                    options={driverOptions}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select driver"
                    searchPlaceholder="Search by name or license..."
                    emptyText="No drivers found."
                    aria-invalid={Boolean(errors.driverId)}
                    className={fieldErrorClassName(errors.driverId?.message)}
                  />
                )}
              />
            </FormField>

            <FormField
              label="Cargo weight (kg)"
              htmlFor="cargo-weight"
              error={errors.cargoWeightKg?.message}
            >
              <Input
                id="cargo-weight"
                type="number"
                min={1}
                max={selectedVehicleCapacity}
                disabled={!selectedVehicleId}
                aria-invalid={Boolean(errors.cargoWeightKg)}
                className={fieldErrorClassName(errors.cargoWeightKg?.message)}
                {...register("cargoWeightKg", {
                  valueAsNumber: true,
                  validate: (value) => {
                    if (Number.isNaN(value)) {
                      return true
                    }
                    if (
                      selectedVehicleCapacity !== undefined &&
                      value > selectedVehicleCapacity
                    ) {
                      return formatCargoCapacityError(
                        value,
                        selectedVehicleCapacity
                      )
                    }
                    return true
                  },
                })}
              />
              {selectedVehicleCapacity !== undefined && (
                <p className="text-sm text-muted-foreground">
                  Maximum capacity: {selectedVehicleCapacity} kg
                </p>
              )}
              {!selectedVehicleId && (
                <p className="text-sm text-muted-foreground">
                  Select a vehicle to set cargo capacity.
                </p>
              )}
            </FormField>

            <FormField
              label="Planned distance (km)"
              htmlFor="planned-distance"
              error={errors.plannedDistanceKm?.message}
            >
              <Input
                id="planned-distance"
                type="number"
                aria-invalid={Boolean(errors.plannedDistanceKm)}
                className={fieldErrorClassName(
                  errors.plannedDistanceKm?.message
                )}
                {...register("plannedDistanceKm", { valueAsNumber: true })}
              />
            </FormField>
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
