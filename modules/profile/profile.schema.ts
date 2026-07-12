import { z } from "zod"

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
})

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

export type UserProfile = {
  id: string
  name: string
  email: string
  roleId: string | null
  roleName: string | null
}
