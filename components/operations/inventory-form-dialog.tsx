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
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  type InventoryItemRecord,
} from "@/components/operations/operations-queries"
import { handleFormSubmitError } from "@/lib/handle-form-submit-error"
import { tryCatch } from "@/lib/try-catch"
import {
  createInventoryItemSchema,
  type CreateInventoryItemInput,
} from "@/modules/operations"

type InventoryFormDialogProps = {
  trigger: React.ReactNode
  item?: InventoryItemRecord
}

const emptyInventoryValues = {
  name: "",
  quantity: 0,
  reorderLevel: 0,
} satisfies CreateInventoryItemInput

export function InventoryFormDialog({
  trigger,
  item,
}: InventoryFormDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const isEdit = Boolean(item)

  const createMutation = useCreateInventoryItemMutation()
  const updateMutation = useUpdateInventoryItemMutation()
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CreateInventoryItemInput>({
    resolver: zodResolver(createInventoryItemSchema),
    mode: "onTouched",
    defaultValues: item
      ? {
          name: item.name,
          quantity: item.quantity,
          reorderLevel: item.reorderLevel,
        }
      : emptyInventoryValues,
  })

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      setFormError(null)
      clearErrors()
      reset(
        item
          ? {
              name: item.name,
              quantity: item.quantity,
              reorderLevel: item.reorderLevel,
            }
          : emptyInventoryValues
      )
    }
  }

  async function onSubmit(values: CreateInventoryItemInput) {
    setFormError(null)
    clearErrors()

    const { error } = await tryCatch(
      isEdit && item
        ? updateMutation.mutateAsync({ id: item.id, input: values })
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
          <DialogTitle>
            {isEdit ? "Edit item" : "Add inventory item"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update stock quantity and reorder level."
              : "Track a spare part or consumable in inventory."}
          </DialogDescription>
        </DialogHeader>

        <FormErrorBanner message={formError} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="Name"
            htmlFor="item-name"
            error={errors.name?.message}
          >
            <Input
              id="item-name"
              aria-invalid={Boolean(errors.name)}
              className={fieldErrorClassName(errors.name?.message)}
              {...register("name")}
            />
          </FormField>

          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              label="Quantity"
              htmlFor="item-quantity"
              error={errors.quantity?.message}
            >
              <Input
                id="item-quantity"
                type="number"
                min={0}
                aria-invalid={Boolean(errors.quantity)}
                className={fieldErrorClassName(errors.quantity?.message)}
                {...register("quantity", { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Reorder level"
              htmlFor="item-reorder-level"
              error={errors.reorderLevel?.message}
            >
              <Input
                id="item-reorder-level"
                type="number"
                min={0}
                aria-invalid={Boolean(errors.reorderLevel)}
                className={fieldErrorClassName(errors.reorderLevel?.message)}
                {...register("reorderLevel", { valueAsNumber: true })}
              />
            </FormField>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isEdit ? "Save changes" : "Add item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
