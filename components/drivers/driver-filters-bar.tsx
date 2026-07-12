"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DRIVER_STATUSES } from "@/db/schema/constants"
import type { DriverQueryInput } from "@/modules/fleet"

const ALL = "all"

type DriverFiltersBarProps = {
  filters: DriverQueryInput
  onFiltersChange: (filters: DriverQueryInput) => void
}

export function DriverFiltersBar({
  filters,
  onFiltersChange,
}: DriverFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.status ?? ALL}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            status:
              value === ALL ? undefined : (value as DriverQueryInput["status"]),
          })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status: All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Status: All</SelectItem>
          {DRIVER_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Search name or license..."
        className="w-56"
        value={filters.search ?? ""}
        onChange={(event) =>
          onFiltersChange({
            ...filters,
            search: event.target.value || undefined,
          })
        }
      />
    </div>
  )
}
