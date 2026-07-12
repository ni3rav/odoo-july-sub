import { Elysia, t } from "elysia"
import { auth } from "@/lib/auth"
import { authMiddleware } from "@/middleware/auth"
import { db } from "@/db"
import { role, user } from "@/db/schema"
import { eq } from "drizzle-orm"

export const authRoutes = new Elysia()
  .use(authMiddleware)
  .post(
    "/auth/demo-setup",
    async ({ body: { roleSlug }, status }) => {
      const existingRole = await db
        .select()
        .from(role)
        .where(eq(role.slug, roleSlug))
        .limit(1)
        .then((res) => res[0])

      if (!existingRole) {
        return status(404, { error: `Role ${roleSlug} not found` })
      }

      const email = `${roleSlug.toLowerCase()}@transitops.com`
      const password = "password123"
      const name = roleSlug.replace(/([A-Z])/g, " $1").trim()

      const existingUser = await db
        .select()
        .from(user)
        .where(eq(user.email, email))
        .limit(1)
        .then((res) => res[0])

      if (!existingUser) {
        try {
          await auth.api.signUpEmail({
            body: {
              email,
              password,
              name,
            },
          })

          await db
            .update(user)
            .set({ roleId: existingRole.id })
            .where(eq(user.email, email))
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to create demo user"
          return status(500, { error: errorMessage })
        }
      } else if (existingUser.roleId !== existingRole.id) {
        await db
          .update(user)
          .set({ roleId: existingRole.id })
          .where(eq(user.email, email))
      }

      return { email, password }
    },
    {
      body: t.Object({
        roleSlug: t.String(),
      }),
    }
  )
  .all("/auth/*", ({ request }) => {
    const BETTER_AUTH_ACCEPT_METHODS = ["POST", "GET"]
    if (BETTER_AUTH_ACCEPT_METHODS.includes(request.method)) {
      return auth.handler(request)
    }
    return new Response("Method Not Allowed", { status: 405 })
  })
  .get(
    "/users/:id",
    ({ params: { id }, user }) => ({
      id,
      name: user?.name ?? "Unknown",
      email: user?.email ?? "unknown@example.com",
    }),
    {
      params: t.Object({
        id: t.String(),
      }),
      response: t.Object({
        id: t.String(),
        name: t.String(),
        email: t.String(),
      }),
    }
  )
