"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import type { HubLocation } from "@/lib/hub-locations"
import { cn } from "@/lib/utils"

const TripLocationMapCanvas = dynamic(
  () =>
    import("@/components/trips/trip-location-map-canvas").then(
      (mod) => mod.TripLocationMapCanvas
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[380px] w-full rounded-md" />,
  }
)

type TripLocationPickerDialogProps = {
  trigger: React.ReactNode
  onConfirm: (source: string, destination: string) => void
}

export function TripLocationPickerDialog({
  trigger,
  onConfirm,
}: TripLocationPickerDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [sourceHub, setSourceHub] = React.useState<HubLocation | null>(null)
  const [destinationHub, setDestinationHub] =
    React.useState<HubLocation | null>(null)

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      setSourceHub(null)
      setDestinationHub(null)
    }
  }

  function handleMarkerClick(hub: HubLocation) {
    if (sourceHub?.name === hub.name) {
      setSourceHub(null)
      return
    }
    if (destinationHub?.name === hub.name) {
      setDestinationHub(null)
      return
    }
    if (!sourceHub) {
      setSourceHub(hub)
    } else if (!destinationHub) {
      setDestinationHub(hub)
    }
  }

  function handleReset() {
    setSourceHub(null)
    setDestinationHub(null)
  }

  function handleUseLocations() {
    if (!sourceHub || !destinationHub) return
    onConfirm(sourceHub.name, destinationHub.name)
    setOpen(false)
  }

  const nextStepLabel = !sourceHub
    ? "Click a hub to set the source"
    : !destinationHub
      ? "Click a hub to set the destination"
      : "Both locations set — click a marker to change one"

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Pick source &amp; destination</DialogTitle>
          <DialogDescription>
            Click a hub marker to set the source, then click another for the
            destination. Not on the map? Close this and type the location
            directly in the form.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "border-emerald-500/20 bg-emerald-500/10 text-emerald-500",
              !sourceHub && "border-border bg-muted text-muted-foreground"
            )}
          >
            <MapPin className="h-3 w-3" />
            Source: {sourceHub?.name ?? "Not set"}
          </Badge>
          <Badge
            variant="outline"
            className={cn(
              "border-primary/20 bg-primary/10 text-primary",
              !destinationHub && "border-border bg-muted text-muted-foreground"
            )}
          >
            <MapPin className="h-3 w-3" />
            Destination: {destinationHub?.name ?? "Not set"}
          </Badge>
          <span className="text-sm text-muted-foreground">{nextStepLabel}</span>
        </div>

        <TripLocationMapCanvas
          sourceHub={sourceHub}
          destinationHub={destinationHub}
          onMarkerClick={handleMarkerClick}
        />

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={!sourceHub && !destinationHub}
          >
            Reset
          </Button>
          <Button
            type="button"
            onClick={handleUseLocations}
            disabled={!sourceHub || !destinationHub}
          >
            Use these locations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
