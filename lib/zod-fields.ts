import { z } from "zod"

export const requiredText = (label: string, max = 120) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be at most ${max} characters`)

export const optionalText = (max = 50) =>
  z.string().trim().max(max, `Must be at most ${max} characters`).optional()

export const requiredPositiveInt = (label: string) =>
  z
    .number({ error: `${label} is required` })
    .refine((value) => !Number.isNaN(value), `${label} is required`)
    .int(`${label} must be a whole number`)
    .positive(`${label} must be greater than 0`)

export const nonNegativeInt = (label: string) =>
  z
    .number({ error: `${label} is required` })
    .refine((value) => !Number.isNaN(value), `${label} is required`)
    .int(`${label} must be a whole number`)
    .nonnegative(`${label} cannot be negative`)

export const nonNegativeNumber = (label: string) =>
  z
    .number({ error: `${label} is required` })
    .refine((value) => !Number.isNaN(value), `${label} is required`)
    .nonnegative(`${label} cannot be negative`)

export const requiredPositiveNumber = (label: string) =>
  z
    .number({ error: `${label} is required` })
    .refine((value) => !Number.isNaN(value), `${label} is required`)
    .positive(`${label} must be greater than 0`)

export const optionalNonNegativeNumber = (label: string) =>
  z
    .number()
    .optional()
    .refine(
      (value) => value === undefined || !Number.isNaN(value),
      `${label} must be a valid number`
    )
    .refine(
      (value) => value === undefined || value >= 0,
      `${label} cannot be negative`
    )

export const safetyScoreField = () =>
  z
    .number({ error: "Safety score is required" })
    .refine((value) => !Number.isNaN(value), "Safety score is required")
    .int("Safety score must be a whole number")
    .min(0, "Safety score must be at least 0")
    .max(100, "Safety score cannot exceed 100")

export const requiredDateField = (label: string) =>
  z.iso.date(`${label} must be a valid date`)

export const optionalNumberRegisterOptions = {
  setValueAs: (value: string | number) => {
    if (value === "" || value === null || value === undefined) {
      return undefined
    }
    const parsed = typeof value === "number" ? value : Number(value)
    return Number.isNaN(parsed) ? Number.NaN : parsed
  },
}
