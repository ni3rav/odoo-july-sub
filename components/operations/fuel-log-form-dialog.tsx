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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useVehiclesQuery } from "@/components/fleet/fleet-queries"
import { useCreateFuelLogMutation } from "@/components/operations/operations-queries"
import { handleFormSubmitError } from "@/lib/handle-form-submit-error"
import { tryCatch } from "@/lib/try-catch"
import {
  createFuelLogSchema,
  type CreateFuelLogInput,
} from "@/modules/operations"

type FuelLogFormDialogProps = {
  trigger: React.ReactNode
}

const emptyFuelLogValues = {
  vehicleId: "",
  liters: Number.NaN,
  cost: Number.NaN,
  date: "",
} satisfies CreateFuelLogInput

export function FuelLogFormDialog({ trigger }: FuelLogFormDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  const vehiclesQuery = useVehiclesQuery({})
  const createMutation = useCreateFuelLogMutation()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateFuelLogInput>({
    resolver: zodResolver(createFuelLogSchema),
    mode: "onTouched",
    defaultValues: emptyFuelLogValues,
  })

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      setFormError(null)
      clearErrors()
      reset(emptyFuelLogValues)
    }
  }

  async function onSubmit(values: CreateFuelLogInput) {
    setFormError(null)
    clearErrors()

    const { error } = await tryCatch(createMutation.mutateAsync(values))

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
          <DialogTitle>Log fuel purchase</DialogTitle>
          <DialogDescription>
            Record fuel liters and cost for a vehicle.
          </DialogDescription>
        </DialogHeader>

        <FormErrorBanner message={formError} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Vehicle"
            htmlFor="fuel-vehicle-id"
            error={errors.vehicleId?.message}
          >
            <Controller
              control={control}
              name="vehicleId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="fuel-vehicle-id"
                    aria-invalid={Boolean(errors.vehicleId)}
                    className={fieldErrorClassName(errors.vehicleId?.message)}
                  >
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {(vehiclesQuery.data ?? []).map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} ({vehicle.registrationNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Liters"
              htmlFor="fuel-liters"
              error={errors.liters?.message}
            >
              <Input
                id="fuel-liters"
                type="number"
                step="0.01"
                aria-invalid={Boolean(errors.liters)}
                className={fieldErrorClassName(errors.liters?.message)}
                {...register("liters", { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Cost"
              htmlFor="fuel-cost"
              error={errors.cost?.message}
            >
              <Input
                id="fuel-cost"
                type="number"
                step="0.01"
                aria-invalid={Boolean(errors.cost)}
                className={fieldErrorClassName(errors.cost?.message)}
                {...register("cost", { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <FormField
            label="Date"
            htmlFor="fuel-date"
            error={errors.date?.message}
          >
            <Input
              id="fuel-date"
              type="date"
              aria-invalid={Boolean(errors.date)}
              className={fieldErrorClassName(errors.date?.message)}
              {...register("date")}
            />
          </FormField>

          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Spinner />}
              Log fuel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
