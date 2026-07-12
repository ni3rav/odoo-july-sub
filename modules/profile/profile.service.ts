import { and, eq, ne } from "drizzle-orm"
import { db } from "@/db"
import { role, user } from "@/db/schema"
import { tryCatch } from "@/lib/try-catch"
import type {
  UpdateProfileInput,
  UserProfile,
} from "@/modules/profile/profile.schema"

export async function getUserProfile(userId: string) {
  const { data: rows, error } = await tryCatch(
    db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        roleId: user.roleId,
        roleName: role.name,
      })
      .from(user)
      .leftJoin(role, eq(user.roleId, role.id))
      .where(eq(user.id, userId))
      .limit(1)
  )

  if (error || !rows?.[0]) {
    return { error: error?.message ?? "Failed to load profile" }
  }

  return { data: rows[0] satisfies UserProfile }
}

export async function updateUserProfile(
  userId: string,
  input: UpdateProfileInput
) {
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  const { data: existingUsers, error: existingUserError } = await tryCatch(
    db
      .select({ id: user.id })
      .from(user)
      .where(and(eq(user.email, email), ne(user.id, userId)))
      .limit(1)
  )

  if (existingUserError) {
    return { error: existingUserError.message }
  }

  if (existingUsers?.length) {
    return { error: "email: Email is already in use" }
  }

  const { error } = await tryCatch(
    db.update(user).set({ name, email }).where(eq(user.id, userId))
  )

  if (error) {
    return { error: error.message }
  }

  return getUserProfile(userId)
}
