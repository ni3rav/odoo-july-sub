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
  useCreateDriverMutation,
  useUpdateDriverMutation,
  type DriverRecord,
} from "@/components/drivers/driver-queries"
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
    formState: { errors },
  } = useForm<CreateDriverInput>({
    resolver: zodResolver(createDriverSchema),
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

  async function onSubmit(values: CreateDriverInput) {
    setFormError(null)
    const { error } = await tryCatch(
      isEdit && driver
        ? updateMutation.mutateAsync({ id: driver.id, input: values })
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit driver" : "Add driver"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this driver's profile and compliance details."
              : "Register a licensed driver for trip assignment."}
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
              <Label htmlFor="driver-name">Name</Label>
              <Input id="driver-name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="license-number">License number</Label>
              <Input id="license-number" {...register("licenseNumber")} />
              {errors.licenseNumber && (
                <p className="text-sm text-destructive">
                  {errors.licenseNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="license-category">License category</Label>
              <Input id="license-category" {...register("licenseCategory")} />
              {errors.licenseCategory && (
                <p className="text-sm text-destructive">
                  {errors.licenseCategory.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="license-expiry">License expiry</Label>
              <Input
                id="license-expiry"
                type="date"
                {...register("licenseExpiryDate")}
              />
              {errors.licenseExpiryDate && (
                <p className="text-sm text-destructive">
                  {errors.licenseExpiryDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-number">Contact number</Label>
              <Input id="contact-number" {...register("contactNumber")} />
              {errors.contactNumber && (
                <p className="text-sm text-destructive">
                  {errors.contactNumber.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="safety-score">Safety score</Label>
              <Input
                id="safety-score"
                type="number"
                min={0}
                max={100}
                {...register("safetyScore", { valueAsNumber: true })}
              />
              {errors.safetyScore && (
                <p className="text-sm text-destructive">
                  {errors.safetyScore.message}
                </p>
              )}
            </div>
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
