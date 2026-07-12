import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/server"
import type { expense, fuelLog, inventoryItem } from "@/db/schema"
import type {
  CreateExpenseInput,
  CreateFuelLogInput,
  CreateInventoryItemInput,
  ExpenseQueryInput,
  FuelLogQueryInput,
  InventoryQueryInput,
  UpdateInventoryItemInput,
} from "@/modules/operations"

export type FuelLogRecord = Omit<
  typeof fuelLog.$inferSelect,
  "liters" | "cost"
> & {
  liters: number
  cost: number
  vehicleName: string
  vehicleReg: string
}

export type ExpenseRecord = Omit<typeof expense.$inferSelect, "amount"> & {
  amount: number
  vehicleName: string
  vehicleReg: string
  tripOrderId: string | null
}

export type InventoryItemRecord = typeof inventoryItem.$inferSelect

export type VehicleCostRow = {
  vehicleId: string
  vehicleName: string
  vehicleReg: string
  fuelCost: number
  maintenanceCost: number
  expenseCost: number
  totalCost: number
}

const FUEL_LOGS_KEY = "operations-fuel-logs"
const EXPENSES_KEY = "operations-expenses"
const INVENTORY_KEY = "operations-inventory"
const COST_SUMMARY_KEY = "operations-cost-summary"

export function useFuelLogsQuery(filters: FuelLogQueryInput) {
  return useQuery({
    queryKey: [FUEL_LOGS_KEY, filters],
    queryFn: async () => {
      const { data, error } = await api.api.operations["fuel-logs"].get({
        query: filters,
      })
      if (error) {
        throw new Error(String(error.value))
      }
      return data.fuelLogs as FuelLogRecord[]
    },
  })
}

export function useCreateFuelLogMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateFuelLogInput) => {
      const { data, error } = await api.api.operations["fuel-logs"].post(input)
      if (error) {
        throw new Error(String(error.value))
      }
      return data.fuelLog
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [FUEL_LOGS_KEY] })
      queryClient.invalidateQueries({ queryKey: [COST_SUMMARY_KEY] })
    },
  })
}

export function useExpensesQuery(filters: ExpenseQueryInput) {
  return useQuery({
    queryKey: [EXPENSES_KEY, filters],
    queryFn: async () => {
      const { data, error } = await api.api.operations.expenses.get({
        query: filters,
      })
      if (error) {
        throw new Error(String(error.value))
      }
      return data.expenses as ExpenseRecord[]
    },
  })
}

export function useCreateExpenseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateExpenseInput) => {
      const { data, error } = await api.api.operations.expenses.post(input)
      if (error) {
        throw new Error(String(error.value))
      }
      return data.expense
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXPENSES_KEY] })
      queryClient.invalidateQueries({ queryKey: [COST_SUMMARY_KEY] })
    },
  })
}

export function useInventoryQuery(filters: InventoryQueryInput) {
  return useQuery({
    queryKey: [INVENTORY_KEY, filters],
    queryFn: async () => {
      const { data, error } = await api.api.operations.inventory.get({
        query: filters,
      })
      if (error) {
        throw new Error(String(error.value))
      }
      return data.inventoryItems
    },
  })
}

export function useCreateInventoryItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateInventoryItemInput) => {
      const { data, error } = await api.api.operations.inventory.post(input)
      if (error) {
        throw new Error(String(error.value))
      }
      return data.inventoryItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_KEY] })
    },
  })
}

export function useUpdateInventoryItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdateInventoryItemInput
    }) => {
      const { data, error } = await api.api.operations
        .inventory({ id })
        .put(input)
      if (error) {
        throw new Error(String(error.value))
      }
      return data.inventoryItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_KEY] })
    },
  })
}

export function useDeleteInventoryItemMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.api.operations
        .inventory({ id })
        .delete()
      if (error) {
        throw new Error(String(error.value))
      }
      return data.inventoryItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVENTORY_KEY] })
    },
  })
}

export function useCostSummaryQuery() {
  return useQuery({
    queryKey: [COST_SUMMARY_KEY],
    queryFn: async () => {
      const { data, error } = await api.api.operations["cost-summary"].get()
      if (error) {
        throw new Error(String(error.value))
      }
      return data as { fleetTotal: number; byVehicle: VehicleCostRow[] }
    },
  })
}
