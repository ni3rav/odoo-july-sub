import { z } from "zod"

export const dashboardFilterSchema = z.object({
  type: z.string().optional(),
  status: z.string().optional(),
  region: z.string().optional(),
})

export type DashboardFilterInput = z.infer<typeof dashboardFilterSchema>
