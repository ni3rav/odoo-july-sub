import { z } from "zod"

const serverSchema = z.object({
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
})

function validateEnv() {
  const parsed = serverSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("\n")
    console.error("Invalid server environment variables:\n", issues)
    throw new Error("Invalid server environment variables")
  }
  return parsed.data
}

export const env = validateEnv()

export type ServerEnv = z.infer<typeof serverSchema>
