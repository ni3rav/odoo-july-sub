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
import { useCreateExpenseMutation } from "@/components/operations/operations-queries"
import { handleFormSubmitError } from "@/lib/handle-form-submit-error"
import { tryCatch } from "@/lib/try-catch"
import {
  createExpenseSchema,
  type CreateExpenseInput,
} from "@/modules/operations"

type ExpenseFormDialogProps = {
  trigger: React.ReactNode
}

const EXPENSE_CATEGORY_LABELS: Record<CreateExpenseInput["category"], string> =
  {
    toll: "Toll",
    other: "Other",
  }

const emptyExpenseValues = {
  vehicleId: "",
  category: "toll",
  amount: Number.NaN,
  date: "",
} satisfies CreateExpenseInput

export function ExpenseFormDialog({ trigger }: ExpenseFormDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  const vehiclesQuery = useVehiclesQuery({})
  const createMutation = useCreateExpenseMutation()

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema),
    mode: "onTouched",
    defaultValues: emptyExpenseValues,
  })

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      setFormError(null)
      clearErrors()
      reset(emptyExpenseValues)
    }
  }

  async function onSubmit(values: CreateExpenseInput) {
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
          <DialogTitle>Add expense</DialogTitle>
          <DialogDescription>
            Record a toll or miscellaneous expense for a vehicle.
          </DialogDescription>
        </DialogHeader>

        <FormErrorBanner message={formError} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Vehicle"
            htmlFor="expense-vehicle-id"
            error={errors.vehicleId?.message}
          >
            <Controller
              control={control}
              name="vehicleId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    id="expense-vehicle-id"
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
              label="Category"
              htmlFor="expense-category"
              error={errors.category?.message}
            >
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="expense-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EXPENSE_CATEGORY_LABELS).map(
                        ([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              label="Amount"
              htmlFor="expense-amount"
              error={errors.amount?.message}
            >
              <Input
                id="expense-amount"
                type="number"
                step="0.01"
                aria-invalid={Boolean(errors.amount)}
                className={fieldErrorClassName(errors.amount?.message)}
                {...register("amount", { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <FormField
            label="Date"
            htmlFor="expense-date"
            error={errors.date?.message}
          >
            <Input
              id="expense-date"
              type="date"
              aria-invalid={Boolean(errors.date)}
              className={fieldErrorClassName(errors.date?.message)}
              {...register("date")}
            />
          </FormField>

          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Spinner />}
              Add expense
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
