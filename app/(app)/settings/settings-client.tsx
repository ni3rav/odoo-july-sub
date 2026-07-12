"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { api } from "@/lib/server"
import { tryCatch } from "@/lib/try-catch"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  Bell,
  Cpu,
  History,
  Check,
  Info,
  Lock,
  Save,
  Plus,
  Sliders,
  ShieldCheck,
  CheckSquare,
} from "lucide-react"

interface PermissionMatrixRow {
  roleId: string
  roleSlug: string
  roleName: string
  permissionId: string
  module: string
  action: string
  granted: boolean
}

interface SettingsClientProps {
  initialMatrix: PermissionMatrixRow[]
  canEdit: boolean
}

const MODULE_LABELS: Record<string, string> = {
  fleet: "Fleet",
  drivers: "Driver",
  trips: "Trip",
  fuel: "Fuel/Exp.",
  analytics: "Analytics",
  maintenance: "Maintenance",
  settings: "Settings",
}

export function SettingsClient({
  initialMatrix,
  canEdit,
}: SettingsClientProps) {
  const [depotName, setDepotName] = useState("Gandhinagar Depot GJ4")
  const [currency, setCurrency] = useState("INR")
  const [distanceUnit, setDistanceUnit] = useState("Kilometers")
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [roleLabels, setRoleLabels] = useState<Record<string, string>>(() => {
    const labels: Record<string, string> = {}
    for (const item of initialMatrix) {
      labels[item.roleSlug] = item.roleName
    }
    if (Object.keys(labels).length === 0) {
      return {
        FleetManager: "Fleet Manager",
        Dispatcher: "Dispatcher",
        SafetyOfficer: "Safety Officer",
        FinancialAnalyst: "Financial Analyst",
      }
    }
    return labels
  })

  const [newRoleName, setNewRoleName] = useState("")
  const [isCreatingRole, setIsCreatingRole] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Local matrix state: Record<roleSlug, Record<module, Record<action, boolean>>>
  const [matrix, setMatrix] = useState<
    Record<string, Record<string, Record<string, boolean>>>
  >(() => {
    const state: any = {}
    for (const item of initialMatrix) {
      if (!state[item.roleSlug]) {
        state[item.roleSlug] = {}
      }
      if (!state[item.roleSlug][item.module]) {
        state[item.roleSlug][item.module] = {
          view: false,
          create: false,
          edit: false,
          delete: false,
        }
      }
      state[item.roleSlug][item.module][item.action] = item.granted
    }
    return state
  })

  useEffect(() => {
    const savedName = localStorage.getItem("depot_name")
    const savedCurrency = localStorage.getItem("depot_currency")
    const savedUnit = localStorage.getItem("depot_unit")

    if (savedName) setDepotName(savedName)
    if (savedCurrency) setCurrency(savedCurrency)
    if (savedUnit) setDistanceUnit(savedUnit)
  }, [])

  const handleSaveDepot = () => {
    localStorage.setItem("depot_name", depotName)
    localStorage.setItem("depot_currency", currency)
    localStorage.setItem("depot_unit", distanceUnit)
    setSuccess("Depot preferences saved successfully!")
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoleName.trim()) return

    setIsCreatingRole(true)
    setError(null)
    setSuccess(null)

    const { data: res, error: apiErr } = await tryCatch(
      api.rbac.roles.post({ name: newRoleName })
    )

    if (apiErr) {
      setIsCreatingRole(false)
      setError(apiErr.message ?? "Failed to create role")
      return
    }

    const newRole = res.role
    const roleSlug = newRole.slug
    const roleName = newRole.name

    setMatrix((prev) => ({
      ...prev,
      [roleSlug]: {
        fleet: { view: false, create: false, edit: false, delete: false },
        drivers: { view: false, create: false, edit: false, delete: false },
        trips: { view: false, create: false, edit: false, delete: false },
        fuel: { view: false, create: false, edit: false, delete: false },
        analytics: { view: false, create: false, edit: false, delete: false },
        maintenance: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
      },
    }))

    setRoleLabels((prev) => ({
      ...prev,
      [roleSlug]: roleName,
    }))

    setIsCreatingRole(false)
    setNewRoleName("")
    setDialogOpen(false)
    setSuccess(
      `Role "${roleName}" created successfully! You can now customize its permissions.`
    )
    setTimeout(() => setSuccess(null), 5000)
  }

  const togglePermission = (
    roleSlug: string,
    module: string,
    action: string,
    checked: boolean
  ) => {
    if (!canEdit) return
    setMatrix((prev) => ({
      ...prev,
      [roleSlug]: {
        ...prev[roleSlug],
        [module]: {
          ...prev[roleSlug][module],
          [action]: checked,
        },
      },
    }))
  }

  const handleSavePermissions = async () => {
    if (!canEdit) return
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    const grants: { roleId: string; permissionId: string; granted: boolean }[] =
      []

    for (const item of initialMatrix) {
      const currentGranted =
        matrix[item.roleSlug]?.[item.module]?.[item.action] ?? false
      if (currentGranted !== item.granted) {
        grants.push({
          roleId: item.roleId,
          permissionId: item.permissionId,
          granted: currentGranted,
        })
      }
    }

    if (grants.length === 0) {
      setIsSaving(false)
      setSuccess("No changes to save.")
      setTimeout(() => setSuccess(null), 3000)
      return
    }

    const { error: apiErr } = await tryCatch(
      api.rbac.permissions.put({ grants })
    )

    setIsSaving(false)

    if (apiErr) {
      setError(apiErr.message ?? "Failed to save permissions")
      return
    }

    setSuccess("Role-based permissions updated successfully!")
    setTimeout(() => setSuccess(null), 3000)
  }

  // Helper to render the permission indicator for a cell
  const renderCellStatus = (roleSlug: string, module: string) => {
    const perms = matrix[roleSlug]?.[module] || {
      view: false,
      create: false,
      edit: false,
      delete: false,
    }
    const { view, create, edit, delete: del } = perms
    const active = [view, create, edit, del].filter(Boolean).length

    // None
    if (active === 0) {
      return (
        <span className="text-xs font-medium text-muted-foreground/60">—</span>
      )
    }

    // All four
    if (view && create && edit && del) {
      return (
        <div className="mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
          <Check className="h-3 w-3 stroke-[3]" />
        </div>
      )
    }

    // Single permissions — show individual label
    if (active === 1) {
      if (view)
        return (
          <Badge
            variant="outline"
            className="mx-auto flex h-5 w-fit items-center justify-center rounded-sm px-1.5 py-0 text-[9px] font-bold tracking-wide uppercase"
          >
            View
          </Badge>
        )
      if (create)
        return (
          <Badge
            variant="outline"
            className="mx-auto flex h-5 w-fit items-center justify-center rounded-sm border border-green-500/20 bg-green-500/10 px-1.5 py-0 text-[9px] font-bold tracking-wide text-green-500 uppercase"
          >
            Create
          </Badge>
        )
      if (edit)
        return (
          <Badge
            variant="secondary"
            className="mx-auto flex h-5 w-fit items-center justify-center rounded-sm border border-amber-500/20 bg-amber-500/10 px-1.5 py-0 text-[9px] font-bold tracking-wide text-amber-500 uppercase"
          >
            Edit
          </Badge>
        )
      if (del)
        return (
          <Badge
            variant="destructive"
            className="mx-auto flex h-5 w-fit items-center justify-center rounded-sm px-1.5 py-0 text-[9px] font-bold tracking-wide uppercase"
          >
            Delete
          </Badge>
        )
    }

    // Mixed combination — show Custom with count
    return (
      <Badge
        variant="secondary"
        className="mx-auto flex h-5 w-fit items-center justify-center rounded-sm border border-amber-500/20 bg-amber-500/10 px-1.5 py-0 text-[9px] font-bold tracking-tight text-amber-500"
      >
        Custom ({active})
      </Badge>
    )
  }

  const modules = Object.keys(MODULE_LABELS)
  const roles = Object.keys(roleLabels)

  return (
    <div className="space-y-6">
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-500 transition-all">
          <Check className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive transition-all">
          <Info className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Card: General Preferences */}
        <Card className="border border-border bg-card shadow-xs md:col-span-1">
          <CardHeader className="border-b border-border pb-4">
            <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-primary uppercase">
              <Sliders className="h-4 w-4" />
              <span>General Settings</span>
            </div>
            <CardDescription className="mt-1 text-xs text-muted-foreground">
              Configure depot details and display units
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Depot Name
              </Label>
              <Input
                value={depotName}
                onChange={(e) => setDepotName(e.target.value)}
                placeholder="Depot Name"
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Currency
              </Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-10 border-border bg-background text-sm">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent className="border border-border bg-popover text-sm">
                  <SelectItem value="INR">INR (Rs)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Distance Unit
              </Label>
              <Select value={distanceUnit} onValueChange={setDistanceUnit}>
                <SelectTrigger className="h-10 border-border bg-background text-sm">
                  <SelectValue placeholder="Select Distance Unit" />
                </SelectTrigger>
                <SelectContent className="border border-border bg-popover text-sm">
                  <SelectItem value="Kilometers">Kilometers</SelectItem>
                  <SelectItem value="Miles">Miles</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSaveDepot}
              className="mt-2 h-10 w-full font-semibold"
            >
              Save changes
            </Button>
          </CardContent>
        </Card>

        {/* Right Card: RBAC Matrix */}
        <Card className="flex flex-col justify-between border border-border bg-card shadow-xs md:col-span-2">
          <div>
            <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold tracking-wide text-primary uppercase">
                  <ShieldCheck className="h-4 w-4" />
                  <span>Role-Based Access (RBAC)</span>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  Define modular access privileges for each user role
                </CardDescription>
              </div>
              {canEdit && (
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs font-medium"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create New Role
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm border border-border bg-popover shadow-lg">
                    <DialogHeader>
                      <DialogTitle className="text-sm font-semibold">
                        Create New Role
                      </DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={handleCreateRole}
                      className="space-y-4 pt-2"
                    >
                      <div className="space-y-2">
                        <Label
                          htmlFor="role-name"
                          className="text-xs tracking-wider text-muted-foreground uppercase"
                        >
                          Role Name
                        </Label>
                        <Input
                          id="role-name"
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                          placeholder="e.g. Support, Coordinator"
                          className="h-10 text-sm"
                        />
                      </div>
                      <DialogFooter className="pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => setDialogOpen(false)}
                          className="h-9 text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isCreatingRole}
                          className="h-9 text-xs"
                        >
                          {isCreatingRole ? (
                            <Spinner className="h-3.5 w-3.5" />
                          ) : (
                            "Create Role"
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>

            <CardContent className="pt-6">
              <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow className="border-b border-border hover:bg-transparent">
                      <TableHead className="h-10 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        Role Headings
                      </TableHead>
                      {modules.map((m) => (
                        <TableHead
                          key={m}
                          className="h-10 text-center text-xs font-semibold tracking-wider text-muted-foreground uppercase"
                        >
                          {MODULE_LABELS[m]}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roles.map((r) => (
                      <TableRow
                        key={r}
                        className="border-b border-border hover:bg-muted/30"
                      >
                        <TableCell className="h-12 text-xs font-medium text-foreground">
                          {roleLabels[r]}
                        </TableCell>
                        {modules.map((m) => {
                          const perms = matrix[r]?.[m] || {
                            view: false,
                            create: false,
                            edit: false,
                            delete: false,
                          }
                          return (
                            <TableCell key={m} className="h-12 p-0 text-center">
                              {canEdit ? (
                                <Popover>
                                  <PopoverTrigger className="flex h-full w-full cursor-pointer items-center justify-center transition-colors hover:bg-accent/40">
                                    {renderCellStatus(r, m)}
                                  </PopoverTrigger>
                                  <PopoverContent
                                    className="w-48 space-y-3 border border-border bg-popover p-3 shadow-md"
                                    align="center"
                                  >
                                    <div className="border-b border-border pb-1.5 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                                      {roleLabels[r]} permissions for{" "}
                                      {MODULE_LABELS[m]}
                                    </div>
                                    <div className="space-y-2.5">
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`${r}-${m}-view`}
                                          checked={perms.view}
                                          onCheckedChange={(checked) =>
                                            togglePermission(
                                              r,
                                              m,
                                              "view",
                                              !!checked
                                            )
                                          }
                                        />
                                        <Label
                                          htmlFor={`${r}-${m}-view`}
                                          className="cursor-pointer text-xs select-none"
                                        >
                                          View
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`${r}-${m}-create`}
                                          checked={perms.create}
                                          onCheckedChange={(checked) =>
                                            togglePermission(
                                              r,
                                              m,
                                              "create",
                                              !!checked
                                            )
                                          }
                                        />
                                        <Label
                                          htmlFor={`${r}-${m}-create`}
                                          className="cursor-pointer text-xs select-none"
                                        >
                                          Create
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`${r}-${m}-edit`}
                                          checked={perms.edit}
                                          onCheckedChange={(checked) =>
                                            togglePermission(
                                              r,
                                              m,
                                              "edit",
                                              !!checked
                                            )
                                          }
                                        />
                                        <Label
                                          htmlFor={`${r}-${m}-edit`}
                                          className="cursor-pointer text-xs select-none"
                                        >
                                          Edit
                                        </Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Checkbox
                                          id={`${r}-${m}-delete`}
                                          checked={perms.delete}
                                          onCheckedChange={(checked) =>
                                            togglePermission(
                                              r,
                                              m,
                                              "delete",
                                              !!checked
                                            )
                                          }
                                        />
                                        <Label
                                          htmlFor={`${r}-${m}-delete`}
                                          className="cursor-pointer text-xs select-none"
                                        >
                                          Delete
                                        </Label>
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  {renderCellStatus(r, m)}
                                </div>
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </div>

          <div className="flex flex-col gap-3 rounded-b-lg border-t border-border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex max-w-md items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Permissions marked with checkmarks allow full create/edit/delete
                actions. 'View' allows read-only access.
              </p>
            </div>
            {canEdit && (
              <Button
                onClick={handleSavePermissions}
                disabled={isSaving}
                className="h-9 shrink-0 gap-1.5 font-semibold sm:w-auto"
              >
                {isSaving ? (
                  <Spinner className="h-3.5 w-3.5" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save matrix
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
