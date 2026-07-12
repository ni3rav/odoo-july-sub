"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
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
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  type VehicleRecord,
} from "@/components/fleet/fleet-queries"
import { handleFormSubmitError } from "@/lib/handle-form-submit-error"
import { tryCatch } from "@/lib/try-catch"
import { createVehicleSchema, type CreateVehicleInput } from "@/modules/fleet"

type VehicleFormDialogProps = {
  trigger: React.ReactNode
  vehicle?: VehicleRecord
}

const emptyVehicleValues: CreateVehicleInput = {
  registrationNumber: "",
  name: "",
  type: "",
  maxLoadCapacityKg: Number.NaN,
  odometerKm: 0,
  acquisitionCost: Number.NaN,
  region: "",
}

export function VehicleFormDialog({
  trigger,
  vehicle,
}: VehicleFormDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const isEdit = Boolean(vehicle)

  const createMutation = useCreateVehicleMutation()
  const updateMutation = useUpdateVehicleMutation()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateVehicleInput>({
    resolver: zodResolver(createVehicleSchema),
    mode: "onTouched",
    defaultValues: vehicle
      ? {
          registrationNumber: vehicle.registrationNumber,
          name: vehicle.name,
          type: vehicle.type,
          maxLoadCapacityKg: vehicle.maxLoadCapacityKg,
          odometerKm: vehicle.odometerKm,
          acquisitionCost: vehicle.acquisitionCost,
          region: vehicle.region,
        }
      : emptyVehicleValues,
  })

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      setFormError(null)
      clearErrors()
      reset(
        vehicle
          ? {
              registrationNumber: vehicle.registrationNumber,
              name: vehicle.name,
              type: vehicle.type,
              maxLoadCapacityKg: vehicle.maxLoadCapacityKg,
              odometerKm: vehicle.odometerKm,
              acquisitionCost: vehicle.acquisitionCost,
              region: vehicle.region,
            }
          : emptyVehicleValues
      )
    }
  }

  async function onSubmit(values: CreateVehicleInput) {
    setFormError(null)
    clearErrors()

    const { error } = await tryCatch(
      isEdit && vehicle
        ? updateMutation.mutateAsync({ id: vehicle.id, input: values })
        : createMutation.mutateAsync(values)
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit vehicle" : "Add vehicle"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this vehicle's registry details."
              : "Register a new vehicle to the fleet."}
          </DialogDescription>
        </DialogHeader>

        <FormErrorBanner message={formError} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Registration number"
              htmlFor="registrationNumber"
              error={errors.registrationNumber?.message}
            >
              <Input
                id="registrationNumber"
                aria-invalid={Boolean(errors.registrationNumber)}
                className={fieldErrorClassName(
                  errors.registrationNumber?.message
                )}
                {...register("registrationNumber")}
              />
            </FormField>

            <FormField label="Name" htmlFor="name" error={errors.name?.message}>
              <Input
                id="name"
                aria-invalid={Boolean(errors.name)}
                className={fieldErrorClassName(errors.name?.message)}
                {...register("name")}
              />
            </FormField>

            <FormField label="Type" htmlFor="type" error={errors.type?.message}>
              <Input
                id="type"
                aria-invalid={Boolean(errors.type)}
                className={fieldErrorClassName(errors.type?.message)}
                {...register("type")}
              />
            </FormField>

            <FormField
              label="Region"
              htmlFor="region"
              error={errors.region?.message}
            >
              <Input
                id="region"
                aria-invalid={Boolean(errors.region)}
                className={fieldErrorClassName(errors.region?.message)}
                {...register("region")}
              />
            </FormField>

            <FormField
              label="Max load (kg)"
              htmlFor="maxLoadCapacityKg"
              error={errors.maxLoadCapacityKg?.message}
            >
              <Input
                id="maxLoadCapacityKg"
                type="number"
                aria-invalid={Boolean(errors.maxLoadCapacityKg)}
                className={fieldErrorClassName(
                  errors.maxLoadCapacityKg?.message
                )}
                {...register("maxLoadCapacityKg", { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Odometer (km)"
              htmlFor="odometerKm"
              error={errors.odometerKm?.message}
            >
              <Input
                id="odometerKm"
                type="number"
                aria-invalid={Boolean(errors.odometerKm)}
                className={fieldErrorClassName(errors.odometerKm?.message)}
                {...register("odometerKm", { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Acquisition cost"
              htmlFor="acquisitionCost"
              error={errors.acquisitionCost?.message}
            >
              <Input
                id="acquisitionCost"
                type="number"
                step="0.01"
                aria-invalid={Boolean(errors.acquisitionCost)}
                className={fieldErrorClassName(errors.acquisitionCost?.message)}
                {...register("acquisitionCost", { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner className="mr-2" />}
              {isEdit ? "Save changes" : "Add vehicle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
