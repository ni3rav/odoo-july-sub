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
  useCreateDriverMutation,
  useUpdateDriverMutation,
  type DriverRecord,
} from "@/components/drivers/driver-queries"
import { handleFormSubmitError } from "@/lib/handle-form-submit-error"
import { tryCatch } from "@/lib/try-catch"
import { createDriverSchema, type CreateDriverInput } from "@/modules/fleet"

type DriverFormDialogProps = {
  trigger: React.ReactNode
  driver?: DriverRecord
}

function toDateInputValue(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10)
}

export function DriverFormDialog({ trigger, driver }: DriverFormDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const isEdit = Boolean(driver)
  const createMutation = useCreateDriverMutation()
  const updateMutation = useUpdateDriverMutation()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateDriverInput>({
    resolver: zodResolver(createDriverSchema),
    mode: "onTouched",
    defaultValues: driver
      ? {
          name: driver.name,
          licenseNumber: driver.licenseNumber,
          licenseCategory: driver.licenseCategory,
          licenseExpiryDate: toDateInputValue(driver.licenseExpiryDate),
          contactNumber: driver.contactNumber,
          safetyScore: driver.safetyScore,
        }
      : {
          name: "",
          licenseNumber: "",
          licenseCategory: "",
          licenseExpiryDate: "",
          contactNumber: "",
          safetyScore: 100,
        },
  })

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      setFormError(null)
      clearErrors()
      reset(
        driver
          ? {
              name: driver.name,
              licenseNumber: driver.licenseNumber,
              licenseCategory: driver.licenseCategory,
              licenseExpiryDate: toDateInputValue(driver.licenseExpiryDate),
              contactNumber: driver.contactNumber,
              safetyScore: driver.safetyScore,
            }
          : {
              name: "",
              licenseNumber: "",
              licenseCategory: "",
              licenseExpiryDate: "",
              contactNumber: "",
              safetyScore: 100,
            }
      )
    }
  }

  async function onSubmit(values: CreateDriverInput) {
    setFormError(null)
    clearErrors()

    const { error } = await tryCatch(
      isEdit && driver
        ? updateMutation.mutateAsync({ id: driver.id, input: values })
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
          <DialogTitle>{isEdit ? "Edit driver" : "Add driver"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this driver's profile and compliance details."
              : "Register a licensed driver for trip assignment."}
          </DialogDescription>
        </DialogHeader>

        <FormErrorBanner message={formError} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Name"
              htmlFor="driver-name"
              error={errors.name?.message}
            >
              <Input
                id="driver-name"
                aria-invalid={Boolean(errors.name)}
                className={fieldErrorClassName(errors.name?.message)}
                {...register("name")}
              />
            </FormField>

            <FormField
              label="License number"
              htmlFor="license-number"
              error={errors.licenseNumber?.message}
            >
              <Input
                id="license-number"
                aria-invalid={Boolean(errors.licenseNumber)}
                className={fieldErrorClassName(errors.licenseNumber?.message)}
                {...register("licenseNumber")}
              />
            </FormField>

            <FormField
              label="License category"
              htmlFor="license-category"
              error={errors.licenseCategory?.message}
            >
              <Input
                id="license-category"
                aria-invalid={Boolean(errors.licenseCategory)}
                className={fieldErrorClassName(errors.licenseCategory?.message)}
                {...register("licenseCategory")}
              />
            </FormField>

            <FormField
              label="License expiry"
              htmlFor="license-expiry"
              error={errors.licenseExpiryDate?.message}
            >
              <Input
                id="license-expiry"
                type="date"
                aria-invalid={Boolean(errors.licenseExpiryDate)}
                className={fieldErrorClassName(
                  errors.licenseExpiryDate?.message
                )}
                {...register("licenseExpiryDate")}
              />
            </FormField>

            <FormField
              label="Contact number"
              htmlFor="contact-number"
              error={errors.contactNumber?.message}
            >
              <Input
                id="contact-number"
                aria-invalid={Boolean(errors.contactNumber)}
                className={fieldErrorClassName(errors.contactNumber?.message)}
                {...register("contactNumber")}
              />
            </FormField>

            <FormField
              label="Safety score"
              htmlFor="safety-score"
              error={errors.safetyScore?.message}
            >
              <Input
                id="safety-score"
                type="number"
                min={0}
                max={100}
                aria-invalid={Boolean(errors.safetyScore)}
                className={fieldErrorClassName(errors.safetyScore?.message)}
                {...register("safetyScore", { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isEdit ? "Save changes" : "Add driver"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
