"use client"

import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { FormErrorBanner } from "@/components/form/form-error-banner"
import { fieldErrorClassName, FormField } from "@/components/form/form-field"
import { useCreateMaintenanceMutation } from "@/components/maintenance/maintenance-queries"
import { useVehiclesQuery } from "@/components/fleet/fleet-queries"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { handleFormSubmitError } from "@/lib/handle-form-submit-error"
import { tryCatch } from "@/lib/try-catch"
import {
  createMaintenanceSchema,
  type CreateMaintenanceInput,
} from "@/modules/operations"

type MaintenanceLogFormProps = {
  canCreate: boolean
}

const emptyValues: CreateMaintenanceInput = {
  vehicleId: "",
  serviceType: "",
  date: "",
  cost: Number.NaN,
  notes: "",
}

export function MaintenanceLogForm({ canCreate }: MaintenanceLogFormProps) {
  const [formError, setFormError] = React.useState<string | null>(null)
  const vehiclesQuery = useVehiclesQuery({ status: "Available" })
  const createMutation = useCreateMaintenanceMutation()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateMaintenanceInput>({
    resolver: zodResolver(createMaintenanceSchema),
    mode: "onTouched",
    defaultValues: emptyValues,
  })

  if (!canCreate) {
    return null
  }

  async function onSubmit(values: CreateMaintenanceInput) {
    setFormError(null)
    clearErrors()

    const { error } = await tryCatch(createMutation.mutateAsync(values))

    if (error) {
      handleFormSubmitError(error, setError, setFormError)
      return
    }

    reset(emptyValues)
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg text-card-foreground">
          Log maintenance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FormErrorBanner message={formError} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Vehicle"
              htmlFor="maintenance-vehicle"
              error={errors.vehicleId?.message}
            >
              <Controller
                control={control}
                name="vehicleId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      id="maintenance-vehicle"
                      aria-invalid={Boolean(errors.vehicleId)}
                      className={fieldErrorClassName(errors.vehicleId?.message)}
                    >
                      <SelectValue placeholder="Select available vehicle" />
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

            <FormField
              label="Service type"
              htmlFor="service-type"
              error={errors.serviceType?.message}
            >
              <Input
                id="service-type"
                placeholder="Oil change, brake service..."
                aria-invalid={Boolean(errors.serviceType)}
                className={fieldErrorClassName(errors.serviceType?.message)}
                {...register("serviceType")}
              />
            </FormField>

            <FormField
              label="Service date"
              htmlFor="service-date"
              error={errors.date?.message}
            >
              <Input
                id="service-date"
                type="date"
                aria-invalid={Boolean(errors.date)}
                className={fieldErrorClassName(errors.date?.message)}
                {...register("date")}
              />
            </FormField>

            <FormField
              label="Cost"
              htmlFor="service-cost"
              error={errors.cost?.message}
            >
              <Input
                id="service-cost"
                type="number"
                step="0.01"
                min={0}
                aria-invalid={Boolean(errors.cost)}
                className={fieldErrorClassName(errors.cost?.message)}
                {...register("cost", { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Notes (optional)"
              htmlFor="service-notes"
              error={errors.notes?.message}
              className="md:col-span-2"
            >
              <Textarea
                id="service-notes"
                rows={3}
                aria-invalid={Boolean(errors.notes)}
                className={fieldErrorClassName(errors.notes?.message)}
                {...register("notes")}
              />
            </FormField>
          </div>

          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending && <Spinner />}
            Log maintenance
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
