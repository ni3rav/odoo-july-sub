import { z } from "zod"

const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
})

function validateClientEnv() {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  })
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n")
    console.error("Invalid client environment variables:\n", issues)
    throw new Error("Invalid client environment variables")
  }
  return parsed.data
}

export const clientEnv = validateClientEnv()

export type ClientEnv = z.infer<typeof clientSchema>
