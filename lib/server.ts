import { treaty } from "@elysia/eden"
import type { App } from "@/app/api/[[...slugs]]/route"
import { clientEnv } from "@/env.client"

export const api = treaty<App>(clientEnv.NEXT_PUBLIC_APP_URL)
