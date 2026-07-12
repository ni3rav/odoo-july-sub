"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TRIP_STATUSES } from "@/db/schema/constants"
import type { TripQueryInput } from "@/modules/trips"

const ALL = "all"

type TripFiltersBarProps = {
  filters: TripQueryInput
  onFiltersChange: (filters: TripQueryInput) => void
}

export function TripFiltersBar({
  filters,
  onFiltersChange,
}: TripFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.status ?? ALL}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            status:
              value === ALL ? undefined : (value as TripQueryInput["status"]),
          })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status: All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Status: All</SelectItem>
          {TRIP_STATUSES.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Search trip id or route..."
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
