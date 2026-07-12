import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"
import { permissionActionEnum, permissionModuleEnum } from "./enums"

export const role = pgTable("role", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const permission = pgTable(
  "permission",
  {
    id: text("id").primaryKey(),
    module: permissionModuleEnum("module").notNull(),
    action: permissionActionEnum("action").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("permission_module_action_unique").on(
      table.module,
      table.action
    ),
    index("permission_module_action_idx").on(table.module, table.action),
  ]
)

export const rolePermission = pgTable(
  "role_permission",
  {
    roleId: text("role_id")
      .notNull()
      .references(() => role.id, { onDelete: "cascade" }),
    permissionId: text("permission_id")
      .notNull()
      .references(() => permission.id, { onDelete: "cascade" }),
    granted: boolean("granted").default(true).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.roleId, table.permissionId] }),
    index("role_permission_roleId_idx").on(table.roleId),
  ]
)

export const roleRelations = relations(role, ({ many }) => ({
  rolePermissions: many(rolePermission),
}))

export const permissionRelations = relations(permission, ({ many }) => ({
  rolePermissions: many(rolePermission),
}))

export const rolePermissionRelations = relations(rolePermission, ({ one }) => ({
  role: one(role, {
    fields: [rolePermission.roleId],
    references: [role.id],
  }),
  permission: one(permission, {
    fields: [rolePermission.permissionId],
    references: [permission.id],
  }),
}))
