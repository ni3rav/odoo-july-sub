import { z } from "zod"
import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  ROLE_SLUGS,
} from "@/db/schema/constants"

export const permissionModuleSchema = z.enum(PERMISSION_MODULES)
export const permissionActionSchema = z.enum(PERMISSION_ACTIONS)
export const roleSlugSchema = z.enum(ROLE_SLUGS)

export const updatePermissionGrantSchema = z.object({
  roleId: z.string().min(1),
  permissionId: z.string().min(1),
  granted: z.boolean(),
})

export const updatePermissionMatrixSchema = z.object({
  grants: z.array(updatePermissionGrantSchema).min(1),
})

export type PermissionModuleInput = z.infer<typeof permissionModuleSchema>
export type PermissionActionInput = z.infer<typeof permissionActionSchema>
export type RoleSlugInput = z.infer<typeof roleSlugSchema>
export type UpdatePermissionMatrixInput = z.infer<
  typeof updatePermissionMatrixSchema
>

export type PermissionMatrixRow = {
  roleId: string
  roleSlug: string
  roleName: string
  permissionId: string
  module: PermissionModuleInput
  action: PermissionActionInput
  granted: boolean
}

export type RoleSummary = {
  id: string
  name: string
  slug: string
}

export const createRoleSchema = z.object({
  name: z.string().min(1, "Role name is required"),
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>
