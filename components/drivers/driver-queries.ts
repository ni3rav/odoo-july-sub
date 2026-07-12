import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/server"
import type { driver } from "@/db/schema"
import type {
  CreateDriverInput,
  DriverQueryInput,
  UpdateDriverInput,
} from "@/modules/fleet"

export type DriverRecord = typeof driver.$inferSelect

const DRIVERS_KEY = "fleet-drivers"

export function useDriversQuery(filters: DriverQueryInput) {
  return useQuery({
    queryKey: [DRIVERS_KEY, filters],
    queryFn: async () => {
      const { data, error } = await api.api.fleet.drivers.get({
        query: filters,
      })
      if (error) {
        throw new Error(String(error.value))
      }
      return data.drivers
    },
  })
}

export function useCreateDriverMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateDriverInput) => {
      const { data, error } = await api.api.fleet.drivers.post(input)
      if (error) {
        throw new Error(String(error.value))
      }
      return data.driver
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DRIVERS_KEY] })
    },
  })
}

export function useUpdateDriverMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdateDriverInput
    }) => {
      const { data, error } = await api.api.fleet.drivers({ id }).put(input)
      if (error) {
        throw new Error(String(error.value))
      }
      return data.driver
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DRIVERS_KEY] })
    },
  })
}

export function useSuspendDriverMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.api.fleet
        .drivers({ id })
        .suspend.patch()
      if (error) {
        throw new Error(String(error.value))
      }
      return data.driver
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DRIVERS_KEY] })
    },
  })
}
