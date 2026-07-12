"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { FormErrorBanner } from "@/components/form/form-error-banner"
import { fieldErrorClassName, FormField } from "@/components/form/form-field"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  type PermissionAction,
  type PermissionModule,
} from "@/db/schema/constants"
import { handleFormSubmitError } from "@/lib/handle-form-submit-error"
import { api } from "@/lib/server"
import { USER_PERMISSIONS_QUERY_KEY } from "@/hooks/use-user-permissions"
import {
  updateProfileSchema,
  type UpdateProfileInput,
  type UserProfile,
} from "@/modules/profile"
import type { PermissionMatrixRow, RoleSummary } from "@/modules/rbac"

type SettingsClientProps = {
  profile: UserProfile
  roles: RoleSummary[]
  initialMatrix: PermissionMatrixRow[]
  canEditMatrix: boolean
  initialMatrixError: string | null
}

type GrantState = Record<string, boolean>

const MODULE_LABELS: Record<PermissionModule, string> = {
  fleet: "Fleet",
  drivers: "Drivers",
  trips: "Trips",
  maintenance: "Maintenance",
  fuel: "Fuel & Expenses",
  analytics: "Analytics",
  settings: "Settings",
}

const ACTION_LABELS: Record<PermissionAction, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
}

function grantKey(roleId: string, permissionId: string) {
  return `${roleId}:${permissionId}`
}

function buildGrantState(matrix: PermissionMatrixRow[]) {
  return Object.fromEntries(
    matrix.map((row) => [grantKey(row.roleId, row.permissionId), row.granted])
  )
}

function getApiError(
  error: { value: unknown } | null,
  fallback: string
): string {
  const value = error?.value
  if (
    value &&
    typeof value === "object" &&
    "error" in value &&
    typeof value.error === "string"
  ) {
    return value.error
  }
  return fallback
}

export function SettingsClient({
  profile,
  roles,
  initialMatrix,
  canEditMatrix,
  initialMatrixError,
}: SettingsClientProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedModule, setSelectedModule] =
    React.useState<PermissionModule>("fleet")
  const [savedMatrix, setSavedMatrix] = React.useState(initialMatrix)
  const [grants, setGrants] = React.useState<GrantState>(() =>
    buildGrantState(initialMatrix)
  )
  const [matrixError, setMatrixError] = React.useState<string | null>(
    initialMatrixError
  )
  const [matrixMessage, setMatrixMessage] = React.useState<string | null>(null)
  const [isSavingMatrix, setIsSavingMatrix] = React.useState(false)
  const [profileError, setProfileError] = React.useState<string | null>(null)
  const [profileMessage, setProfileMessage] = React.useState<string | null>(
    null
  )

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    mode: "onTouched",
    defaultValues: {
      name: profile.name,
      email: profile.email,
    },
  })

  const rowsByCoordinate = React.useMemo(
    () =>
      new Map(
        savedMatrix.map((row) => [
          `${row.roleId}:${row.module}:${row.action}`,
          row,
        ])
      ),
    [savedMatrix]
  )

  const changedGrants = React.useMemo(
    () =>
      savedMatrix.flatMap((row) => {
        const granted = grants[grantKey(row.roleId, row.permissionId)] ?? false
        return granted === row.granted
          ? []
          : [{ roleId: row.roleId, permissionId: row.permissionId, granted }]
      }),
    [grants, savedMatrix]
  )

  async function onProfileSubmit(values: UpdateProfileInput) {
    setProfileError(null)
    setProfileMessage(null)
    clearErrors()

    const { data, error } = await api.api.profile.put(values)
    if (error) {
      handleFormSubmitError(
        new Error(getApiError(error, "Failed to update profile")),
        setError,
        setProfileError
      )
      return
    }

    if (data.profile) {
      setProfileMessage("Profile updated.")
      router.refresh()
    }
  }

  function toggleGrant(row: PermissionMatrixRow, granted: boolean) {
    if (!canEditMatrix) {
      return
    }
    setMatrixMessage(null)
    setGrants((current) => ({
      ...current,
      [grantKey(row.roleId, row.permissionId)]: granted,
    }))
  }

  async function saveMatrix() {
    if (!canEditMatrix || changedGrants.length === 0) {
      return
    }

    setIsSavingMatrix(true)
    setMatrixError(null)
    setMatrixMessage(null)

    const { data, error } = await api.api.rbac.permissions.put({
      grants: changedGrants,
    })

    setIsSavingMatrix(false)

    if (error) {
      setMatrixError(getApiError(error, "Failed to save permissions"))
      return
    }

    if (data.matrix) {
      setSavedMatrix(data.matrix)
      setGrants(buildGrantState(data.matrix))
    }
    await queryClient.invalidateQueries({
      queryKey: USER_PERMISSIONS_QUERY_KEY,
    })
    setMatrixMessage("Permissions saved.")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="space-y-4 rounded-lg border border-border bg-card p-4 lg:col-span-1">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Account profile
          </h2>
          <p className="text-xs text-muted-foreground">
            Update your name and email.
          </p>
        </div>

        <form onSubmit={handleSubmit(onProfileSubmit)} className="space-y-4">
          <FormErrorBanner message={profileError} />
          {profileMessage ? (
            <p className="text-xs text-primary" role="status">
              {profileMessage}
            </p>
          ) : null}

          <FormField label="Name" htmlFor="name" error={errors.name?.message}>
            <Input
              id="name"
              aria-invalid={Boolean(errors.name)}
              className={fieldErrorClassName(errors.name?.message)}
              {...register("name")}
            />
          </FormField>

          <FormField
            label="Email"
            htmlFor="email"
            error={errors.email?.message}
          >
            <Input
              id="email"
              type="email"
              aria-invalid={Boolean(errors.email)}
              className={fieldErrorClassName(errors.email?.message)}
              {...register("email")}
            />
          </FormField>

          <FormField label="Role" htmlFor="role">
            <Input
              id="role"
              value={profile.roleName ?? "Unassigned"}
              disabled
            />
          </FormField>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? <Spinner /> : null}
            Update profile
          </Button>
        </form>
      </section>

      <section className="space-y-4 rounded-lg border border-border bg-card p-4 lg:col-span-2">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              Role-based access control
            </h2>
            <p className="text-xs text-muted-foreground">
              Assign permissions for each role by module.
            </p>
          </div>

          <div className="space-y-2 sm:w-48">
            <Label htmlFor="module-filter" className="text-xs">
              Module
            </Label>
            <Select
              value={selectedModule}
              onValueChange={(value) =>
                setSelectedModule(value as PermissionModule)
              }
            >
              <SelectTrigger id="module-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERMISSION_MODULES.map((module) => (
                  <SelectItem key={module} value={module}>
                    {MODULE_LABELS[module]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <FormErrorBanner message={matrixError} />
        {matrixMessage ? (
          <p className="text-xs text-primary" role="status">
            {matrixMessage}
          </p>
        ) : null}

        {!initialMatrixError ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                {PERMISSION_ACTIONS.map((action) => (
                  <TableHead key={action} className="text-center">
                    {ACTION_LABELS[action]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  {PERMISSION_ACTIONS.map((action) => {
                    const row = rowsByCoordinate.get(
                      `${role.id}:${selectedModule}:${action}`
                    )
                    if (!row) {
                      return (
                        <TableCell key={action} className="text-center">
                          —
                        </TableCell>
                      )
                    }
                    const id = `${role.id}-${selectedModule}-${action}`
                    return (
                      <TableCell key={action} className="text-center">
                        <Checkbox
                          id={id}
                          aria-label={`${role.name} ${ACTION_LABELS[action]} for ${MODULE_LABELS[selectedModule]}`}
                          checked={
                            grants[grantKey(row.roleId, row.permissionId)] ??
                            false
                          }
                          disabled={!canEditMatrix}
                          onCheckedChange={(checked) =>
                            toggleGrant(row, checked === true)
                          }
                        />
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}

        {!canEditMatrix ? (
          <p className="text-xs text-muted-foreground">
            You have view-only access to permissions.
          </p>
        ) : null}

        {canEditMatrix ? (
          <div className="flex justify-end">
            <Button
              type="button"
              disabled={isSavingMatrix || changedGrants.length === 0}
              onClick={saveMatrix}
            >
              {isSavingMatrix ? <Spinner /> : null}
              Save changes
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  )
}
