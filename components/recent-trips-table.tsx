"use client"

import * as React from "react"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface TripRow {
  id: string
  orderId: string
  source: string
  destination: string
  vehicleName: string
  vehicleReg: string
  driverName: string
  revenue: number
  status: string
  createdAt: string | Date
}

interface RecentTripsTableProps {
  trips: TripRow[]
}

const statusColors: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground border-border",
  Dispatched: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  InTransit: "bg-primary/10 text-primary border-primary/20",
  Completed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
}

export function RecentTripsTable({ trips }: RecentTripsTableProps) {
  const columns: GridColDef[] = [
    {
      field: "orderId",
      headerName: "Trip ID",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <span className="font-semibold text-foreground text-xs">{params.value}</span>
      ),
    },
    {
      field: "route",
      headerName: "Route",
      flex: 2,
      minWidth: 180,
      valueGetter: (value, row) => `${row.source} → ${row.destination}`,
      renderCell: (params) => (
        <span className="text-foreground text-xs">{params.value}</span>
      ),
    },
    {
      field: "vehicle",
      headerName: "Vehicle",
      flex: 1.5,
      minWidth: 140,
      valueGetter: (value, row) => `${row.vehicleName} (${row.vehicleReg})`,
      renderCell: (params) => (
        <span className="text-foreground text-xs">{params.value}</span>
      ),
    },
    {
      field: "driverName",
      headerName: "Driver",
      flex: 1.2,
      minWidth: 110,
      renderCell: (params) => (
        <span className="text-foreground text-xs">{params.value}</span>
      ),
    },
    {
      field: "revenue",
      headerName: "Revenue",
      flex: 1,
      minWidth: 90,
      renderCell: (params) => (
        <span className="font-medium text-foreground text-xs">
          ${Number(params.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 100,
      renderCell: (params) => (
        <Badge
          className={cn(
            "text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded border",
            statusColors[params.value] || "bg-muted text-muted-foreground"
          )}
        >
          {params.value}
        </Badge>
      ),
    },
  ]

  const formattedRows = trips.map((t) => ({
    ...t,
    id: t.id || t.orderId,
  }))

  return (
    <div className="w-full bg-card rounded-xl overflow-hidden border border-border" style={{ height: 350 }}>
      <DataGrid
        rows={formattedRows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
        disableRowSelectionOnClick
        sx={{
          border: 0,
          fontFamily: "var(--font-sans), sans-serif",
          "& .MuiDataGrid-main": {
            color: "var(--foreground)",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "var(--muted)",
            borderBottom: "1px solid var(--border)",
            fontSize: "0.75rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "var(--accent)",
          },
          "& .MuiTablePagination-root": {
            color: "var(--muted-foreground)",
            fontSize: "0.75rem",
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
            fontSize: "0.75rem",
          },
        }}
      />
    </div>
  )
}
