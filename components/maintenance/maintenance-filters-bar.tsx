"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { MaintenanceQueryInput } from "@/modules/operations"
import { MAINTENANCE_STATUSES } from "@/db/schema/constants"

type MaintenanceFiltersBarProps = {
  filters: MaintenanceQueryInput
  onFiltersChange: (filters: MaintenanceQueryInput) => void
}

export function MaintenanceFiltersBar({
  filters,
  onFiltersChange,
}: MaintenanceFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="maintenance-search">Search</Label>
        <Input
          id="maintenance-search"
          placeholder="Vehicle, service, notes..."
          value={filters.search ?? ""}
          onChange={(event) =>
            onFiltersChange({
              ...filters,
              search: event.target.value || undefined,
            })
          }
          className="w-56"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maintenance-status">Status</Label>
        <Select
          value={filters.status ?? "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              status:
                value === "all"
                  ? undefined
                  : (value as MaintenanceQueryInput["status"]),
            })
          }
        >
          <SelectTrigger id="maintenance-status" className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {MAINTENANCE_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
