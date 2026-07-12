import type { FieldValues, UseFormSetError } from "react-hook-form"
import { applyFormErrorsFromMessage } from "@/lib/zod-errors"

export function handleFormSubmitError<T extends FieldValues>(
  error: Error,
  setError: UseFormSetError<T>,
  setFormError: (message: string | null) => void
) {
  const mapped = applyFormErrorsFromMessage(error.message, setError)
  if (!mapped) {
    setFormError(error.message)
  }
}
