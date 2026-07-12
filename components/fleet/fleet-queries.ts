import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/server"
import type { vehicle } from "@/db/schema"
import type {
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleQueryInput,
} from "@/modules/fleet"

export type VehicleRecord = Omit<
  typeof vehicle.$inferSelect,
  "acquisitionCost"
> & { acquisitionCost: number }

const VEHICLES_KEY = "fleet-vehicles"

export function useVehiclesQuery(filters: VehicleQueryInput) {
  return useQuery({
    queryKey: [VEHICLES_KEY, filters],
    queryFn: async () => {
      const { data, error } = await api.api.fleet.vehicles.get({
        query: filters,
      })
      if (error) {
        throw new Error(String(error.value))
      }
      return data.vehicles
    },
  })
}

export function useCreateVehicleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateVehicleInput) => {
      const { data, error } = await api.api.fleet.vehicles.post(input)
      if (error) {
        throw new Error(String(error.value))
      }
      return data.vehicle
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] })
    },
  })
}

export function useUpdateVehicleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdateVehicleInput
    }) => {
      const { data, error } = await api.api.fleet.vehicles({ id }).put(input)
      if (error) {
        throw new Error(String(error.value))
      }
      return data.vehicle
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] })
    },
  })
}

export function useRetireVehicleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.api.fleet.vehicles({ id }).retire.patch()
      if (error) {
        throw new Error(String(error.value))
      }
      return data.vehicle
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] })
    },
  })
}
