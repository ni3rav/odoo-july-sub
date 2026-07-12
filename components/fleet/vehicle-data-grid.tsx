"use client"

import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from "@mui/x-data-grid"
import { ThemeProvider, createTheme } from "@mui/material/styles"
import { Button } from "@/components/ui/button"
import { VehicleStatusBadge } from "@/components/fleet/vehicle-status-badge"
import { VehicleFormDialog } from "@/components/fleet/vehicle-form-dialog"
import {
  useRetireVehicleMutation,
  type VehicleRecord,
} from "@/components/fleet/fleet-queries"
import type { VehicleStatus } from "@/db/schema/constants"

const theme = createTheme()

type VehicleDataGridProps = {
  vehicles: VehicleRecord[]
  loading: boolean
  canEdit: boolean
  canDelete: boolean
}

export function VehicleDataGrid({
  vehicles,
  loading,
  canEdit,
  canDelete,
}: VehicleDataGridProps) {
  const retireMutation = useRetireVehicleMutation()

  const columns: GridColDef<VehicleRecord>[] = [
    {
      field: "registrationNumber",
      headerName: "Reg. No. (Unique)",
      flex: 1,
      minWidth: 150,
    },
    { field: "name", headerName: "Name/Model", flex: 1, minWidth: 120 },
    { field: "type", headerName: "Type", width: 100 },
    {
      field: "maxLoadCapacityKg",
      headerName: "Capacity (kg)",
      width: 130,
      type: "number",
    },
    {
      field: "odometerKm",
      headerName: "Odometer (km)",
      width: 140,
      type: "number",
    },
    {
      field: "acquisitionCost",
      headerName: "Acq. Cost",
      width: 130,
      type: "number",
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params: GridRenderCellParams<VehicleRecord>) => (
        <VehicleStatusBadge status={params.value as VehicleStatus} />
      ),
    },
  ]

  if (canEdit || canDelete) {
    columns.push({
      field: "actions",
      headerName: "",
      width: canEdit && canDelete ? 190 : 110,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params: GridRenderCellParams<VehicleRecord>) => (
        <div className="flex items-center gap-2">
          {canEdit && (
            <VehicleFormDialog
              vehicle={params.row}
              trigger={
                <Button size="sm" variant="outline">
                  Edit
                </Button>
              }
            />
          )}
          {canDelete && params.row.status !== "Retired" && (
            <Button
              size="sm"
              variant="outline"
              disabled={retireMutation.isPending}
              onClick={() => retireMutation.mutate(params.row.id)}
            >
              Retire
            </Button>
          )}
        </div>
      ),
    })
  }

  return (
    <ThemeProvider theme={theme}>
      <div className="rounded-md border">
        <DataGrid
          rows={vehicles}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
        />
      </div>
    </ThemeProvider>
  )
}
