"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Filter, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DashboardFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentType = searchParams.get("type") || "ALL"
  const currentStatus = searchParams.get("status") || "ALL"
  const currentRegion = searchParams.get("region") || "ALL"

  function handleFilterChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "ALL") {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/dashboard?${params.toString()}`)
  }

  function handleClear() {
    router.push("/dashboard")
  }

  const hasFilters =
    (currentType && currentType !== "ALL") ||
    (currentStatus && currentStatus !== "ALL") ||
    (currentRegion && currentRegion !== "ALL")

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
      <div className="mr-2 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span>Filters</span>
      </div>

      <div className="flex min-w-[200px] flex-1 flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <Select
            value={currentType}
            onValueChange={(val) => handleFilterChange("type", val)}
          >
            <SelectTrigger id="filter-type" className="h-9 w-full text-xs">
              <SelectValue placeholder="All Vehicle Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Vehicle Types</SelectItem>
              <SelectItem value="LCV">LCV</SelectItem>
              <SelectItem value="Heavy Duty">Heavy Duty</SelectItem>
              <SelectItem value="Semi-Trailer">Semi-Trailer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <Select
            value={currentStatus}
            onValueChange={(val) => handleFilterChange("status", val)}
          >
            <SelectTrigger id="filter-status" className="h-9 w-full text-xs">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="OnTrip">On Trip</SelectItem>
              <SelectItem value="InShop">In Shop</SelectItem>
              <SelectItem value="Retired">Retired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-1 flex-col gap-1.5">
          <Select
            value={currentRegion}
            onValueChange={(val) => handleFilterChange("region", val)}
          >
            <SelectTrigger id="filter-region" className="h-9 w-full text-xs">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Regions</SelectItem>
              <SelectItem value="North">North</SelectItem>
              <SelectItem value="South">South</SelectItem>
              <SelectItem value="East">East</SelectItem>
              <SelectItem value="West">West</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="h-9 gap-1.5 px-3 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="h-3.5 w-3.5" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
