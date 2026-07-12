"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VEHICLE_STATUSES } from "@/db/schema/constants"
import type { VehicleQueryInput } from "@/modules/fleet"

const ALL = "all"

type VehicleFiltersBarProps = {
  filters: VehicleQueryInput
  onFiltersChange: (filters: VehicleQueryInput) => void
  typeOptions: string[]
  regionOptions: string[]
}

export function VehicleFiltersBar({
  filters,
  onFiltersChange,
  typeOptions,
  regionOptions,
}: VehicleFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={filters.type ?? ALL}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            type: value === ALL ? undefined : value,
          })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Type: All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Type: All</SelectItem>
          {typeOptions.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.status ?? ALL}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            status:
              value === ALL ? undefined : (value as VehicleQueryInput["status"]),
          })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Status: All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Status: All</SelectItem>
          {VEHICLE_STATUSES.map((vehicleStatus) => (
            <SelectItem key={vehicleStatus} value={vehicleStatus}>
              {vehicleStatus}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.region ?? ALL}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            region: value === ALL ? undefined : value,
          })
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Region: All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Region: All</SelectItem>
          {regionOptions.map((region) => (
            <SelectItem key={region} value={region}>
              {region}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        placeholder="Search reg. no..."
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
