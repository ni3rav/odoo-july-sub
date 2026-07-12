import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/server"
import type { maintenanceRecord } from "@/db/schema"
import type {
  CreateMaintenanceInput,
  MaintenanceQueryInput,
} from "@/modules/operations"

export type MaintenanceRecord = Omit<
  typeof maintenanceRecord.$inferSelect,
  "cost"
> & {
  cost: number
  vehicleName: string
  vehicleReg: string
  vehicleStatus?: string
}

const MAINTENANCE_KEY = "maintenance"
const VEHICLES_KEY = "fleet-vehicles"

export function useMaintenanceQuery(filters: MaintenanceQueryInput) {
  return useQuery({
    queryKey: [MAINTENANCE_KEY, filters],
    queryFn: async () => {
      const { data, error } = await api.api.maintenance.get({ query: filters })
      if (error) {
        throw new Error(String(error.value))
      }
      return data.records as MaintenanceRecord[]
    },
  })
}

export function useCreateMaintenanceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateMaintenanceInput) => {
      const { data, error } = await api.api.maintenance.post(input)
      if (error) {
        throw new Error(String(error.value))
      }
      return data.record as MaintenanceRecord
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MAINTENANCE_KEY] })
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] })
    },
  })
}

export function useCloseMaintenanceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.api.maintenance({ id }).close.post()
      if (error) {
        throw new Error(String(error.value))
      }
      return data.record as MaintenanceRecord
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MAINTENANCE_KEY] })
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] })
    },
  })
}

export function useDeleteMaintenanceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.api.maintenance({ id }).delete()
      if (error) {
        throw new Error(String(error.value))
      }
      return data.record as MaintenanceRecord
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [MAINTENANCE_KEY] })
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] })
    },
  })
}
