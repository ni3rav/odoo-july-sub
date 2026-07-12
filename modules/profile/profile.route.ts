import { Elysia } from "elysia"
import { formatZodIssues } from "@/lib/zod-errors"
import { requireAuth } from "@/middleware/auth"
import { requirePermission } from "@/middleware/rbac"
import { updateProfileSchema } from "@/modules/profile/profile.schema"
import { updateUserProfile } from "@/modules/profile/profile.service"

export const profileRoutes = new Elysia({ prefix: "/profile" })
  .use(requireAuth)
  .use(requirePermission("settings", "view"))
  .put("", async ({ body, status, user }) => {
    if (!user) {
      return status(401, { error: "Unauthorized" })
    }

    const parsed = updateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return status(400, { error: formatZodIssues(parsed.error.issues) })
    }

    const result = await updateUserProfile(user.id, parsed.data)
    if (result.error) {
      return status(result.error.startsWith("email:") ? 400 : 500, {
        error: result.error,
      })
    }

    return { profile: result.data }
  })
