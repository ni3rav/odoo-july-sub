import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/server"
import type { trip } from "@/db/schema"
import type {
  CompleteTripInput,
  CreateTripInput,
  TripQueryInput,
  UpdateTripInput,
} from "@/modules/trips"

export type TripRecord = Omit<
  typeof trip.$inferSelect,
  "revenue" | "fuelConsumedLiters"
> & {
  revenue: number | null
  fuelConsumedLiters: number | null
  vehicleName: string
  vehicleReg: string
  vehicleMaxLoadKg: number
  driverName: string
  vehicleStatus?: string
  driverStatus?: string
  licenseExpiryDate?: Date | string
}

const TRIPS_KEY = "trips"
const VEHICLES_KEY = "fleet-vehicles"
const DRIVERS_KEY = "fleet-drivers"

export function useTripsQuery(filters: TripQueryInput) {
  return useQuery({
    queryKey: [TRIPS_KEY, filters],
    queryFn: async () => {
      const { data, error } = await api.api.trips.get({ query: filters })
      if (error) {
        throw new Error(String(error.value))
      }
      return data.trips as TripRecord[]
    },
  })
}

export function useTripQuery(tripId: string | null) {
  return useQuery({
    queryKey: [TRIPS_KEY, tripId],
    enabled: Boolean(tripId),
    queryFn: async () => {
      if (!tripId) {
        throw new Error("Trip id is required")
      }
      const { data, error } = await api.api.trips({ id: tripId }).get()
      if (error) {
        throw new Error(String(error.value))
      }
      return data.trip as TripRecord
    },
  })
}

export function useDispatchPreviewQuery(
  tripId: string | null,
  enabled: boolean
) {
  return useQuery({
    queryKey: [TRIPS_KEY, tripId, "dispatch-preview"],
    enabled: Boolean(tripId) && enabled,
    queryFn: async () => {
      if (!tripId) {
        return { errors: [] as string[] }
      }
      const { data, error } = await api.api
        .trips({ id: tripId })
        ["dispatch-preview"].get()
      if (error) {
        throw new Error(String(error.value))
      }
      return data as { errors: string[] }
    },
  })
}

function invalidateTripQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: [TRIPS_KEY] })
  queryClient.invalidateQueries({ queryKey: [VEHICLES_KEY] })
  queryClient.invalidateQueries({ queryKey: [DRIVERS_KEY] })
}

export function useCreateTripMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateTripInput) => {
      const { data, error } = await api.api.trips.post(input)
      if (error) {
        throw new Error(String(error.value))
      }
      return data.trip as TripRecord
    },
    onSuccess: () => {
      invalidateTripQueries(queryClient)
    },
  })
}

export function useUpdateTripMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdateTripInput
    }) => {
      const { data, error } = await api.api.trips({ id }).put(input)
      if (error) {
        throw new Error(String(error.value))
      }
      return data.trip as TripRecord
    },
    onSuccess: () => {
      invalidateTripQueries(queryClient)
    },
  })
}

export function useDeleteTripMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.api.trips({ id }).delete()
      if (error) {
        throw new Error(String(error.value))
      }
      return data.trip
    },
    onSuccess: () => {
      invalidateTripQueries(queryClient)
    },
  })
}

export function useDispatchTripMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.api.trips({ id }).dispatch.post()
      if (error) {
        throw new Error(String(error.value))
      }
      return data.trip as TripRecord
    },
    onSuccess: () => {
      invalidateTripQueries(queryClient)
    },
  })
}

export function useStartTransitMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.api
        .trips({ id })
        ["start-transit"].post()
      if (error) {
        throw new Error(String(error.value))
      }
      return data.trip as TripRecord
    },
    onSuccess: () => {
      invalidateTripQueries(queryClient)
    },
  })
}

export function useCompleteTripMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: CompleteTripInput
    }) => {
      const { data, error } = await api.api.trips({ id }).complete.post(input)
      if (error) {
        throw new Error(String(error.value))
      }
      return data.trip as TripRecord
    },
    onSuccess: () => {
      invalidateTripQueries(queryClient)
    },
  })
}

export function useCancelTripMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.api.trips({ id }).cancel.post()
      if (error) {
        throw new Error(String(error.value))
      }
      return data.trip as TripRecord
    },
    onSuccess: () => {
      invalidateTripQueries(queryClient)
    },
  })
}
