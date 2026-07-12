"use client"

import "leaflet/dist/leaflet.css"

import * as L from "leaflet"
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet"
import {
  HUB_LOCATIONS,
  INDIA_MAP_CENTER,
  INDIA_MAP_DEFAULT_ZOOM,
  type HubLocation,
} from "@/lib/hub-locations"

type MarkerState = "default" | "source" | "destination"

const MARKER_COLORS: Record<MarkerState, string> = {
  default: "var(--muted-foreground)",
  source: "oklch(0.627 0.194 149.214)",
  destination: "var(--primary)",
}

function createHubIcon(state: MarkerState) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${MARKER_COLORS[state]};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

type TripLocationMapCanvasProps = {
  sourceHub: HubLocation | null
  destinationHub: HubLocation | null
  onMarkerClick: (hub: HubLocation) => void
}

export function TripLocationMapCanvas({
  sourceHub,
  destinationHub,
  onMarkerClick,
}: TripLocationMapCanvasProps) {
  return (
    <MapContainer
      center={INDIA_MAP_CENTER}
      zoom={INDIA_MAP_DEFAULT_ZOOM}
      scrollWheelZoom={false}
      className="h-[380px] w-full rounded-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {HUB_LOCATIONS.map((hub) => {
        const state: MarkerState =
          sourceHub?.name === hub.name
            ? "source"
            : destinationHub?.name === hub.name
              ? "destination"
              : "default"

        return (
          <Marker
            key={hub.name}
            position={[hub.lat, hub.lng]}
            icon={createHubIcon(state)}
            eventHandlers={{ click: () => onMarkerClick(hub) }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              {hub.name}
            </Tooltip>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
