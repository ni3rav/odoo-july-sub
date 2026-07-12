"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
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
import { Spinner } from "@/components/ui/spinner"
import {
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  type VehicleRecord,
} from "@/components/fleet/fleet-queries"
import { createVehicleSchema, type CreateVehicleInput } from "@/modules/fleet"

type VehicleFormDialogProps = {
  trigger: React.ReactNode
  vehicle?: VehicleRecord
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
    formState: { errors },
  } = useForm<CreateVehicleInput>({
    resolver: zodResolver(createVehicleSchema),
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
      : { odometerKm: 0 },
  })

  async function onSubmit(values: CreateVehicleInput) {
    setFormError(null)
    try {
      if (isEdit && vehicle) {
        await updateMutation.mutateAsync({ id: vehicle.id, input: values })
      } else {
        await createMutation.mutateAsync(values)
      }
      setOpen(false)
      reset()
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Failed to save vehicle"
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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

        {formError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration number</Label>
              <Input
                id="registrationNumber"
                {...register("registrationNumber")}
              />
              {errors.registrationNumber && (
                <p className="text-sm text-destructive">
                  {errors.registrationNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input id="type" {...register("type")} />
              {errors.type && (
                <p className="text-sm text-destructive">
                  {errors.type.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region</Label>
              <Input id="region" {...register("region")} />
              {errors.region && (
                <p className="text-sm text-destructive">
                  {errors.region.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxLoadCapacityKg">Max load (kg)</Label>
              <Input
                id="maxLoadCapacityKg"
                type="number"
                {...register("maxLoadCapacityKg", { valueAsNumber: true })}
              />
              {errors.maxLoadCapacityKg && (
                <p className="text-sm text-destructive">
                  {errors.maxLoadCapacityKg.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="odometerKm">Odometer (km)</Label>
              <Input
                id="odometerKm"
                type="number"
                {...register("odometerKm", { valueAsNumber: true })}
              />
              {errors.odometerKm && (
                <p className="text-sm text-destructive">
                  {errors.odometerKm.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="acquisitionCost">Acquisition cost</Label>
              <Input
                id="acquisitionCost"
                type="number"
                step="0.01"
                {...register("acquisitionCost", { valueAsNumber: true })}
              />
              {errors.acquisitionCost && (
                <p className="text-sm text-destructive">
                  {errors.acquisitionCost.message}
                </p>
              )}
            </div>
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
