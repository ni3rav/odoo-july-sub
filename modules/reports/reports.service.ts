import { db } from "@/db"
import {
  vehicle,
  driver,
  trip,
  maintenanceRecord,
  fuelLog,
  expense,
} from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { tryCatch } from "@/lib/try-catch"
import type { VehicleStatus } from "@/db/schema/constants"

export async function getDashboardKPIs(filters?: {
  type?: string
  status?: string
  region?: string
}) {
  const whereConditions = []
  if (filters?.type) {
    whereConditions.push(eq(vehicle.type, filters.type))
  }
  if (filters?.status) {
    whereConditions.push(eq(vehicle.status, filters.status as VehicleStatus))
  }
  if (filters?.region) {
    whereConditions.push(eq(vehicle.region, filters.region))
  }

  const vehiclesResult = await tryCatch(
    whereConditions.length > 0
      ? db
          .select()
          .from(vehicle)
          .where(and(...whereConditions))
      : db.select().from(vehicle)
  )
  const vehicles = vehiclesResult.data || []

  const driversResult = await tryCatch(db.select().from(driver))
  const drivers = driversResult.data || []

  const tripsResult = await tryCatch(db.select().from(trip))
  const trips = tripsResult.data || []

  const maintenancesResult = await tryCatch(db.select().from(maintenanceRecord))
  const maintenances = maintenancesResult.data || []

  const fuelLogsResult = await tryCatch(db.select().from(fuelLog))
  const fuelLogs = fuelLogsResult.data || []

  const expensesResult = await tryCatch(db.select().from(expense))
  const expenses = expensesResult.data || []

  const totalVehicles = vehicles.filter((v) => v.status !== "Retired").length
  const activeVehicles = vehicles.filter(
    (v) => v.status === "OnTrip" || v.status === "InShop"
  ).length
  const utilization =
    totalVehicles > 0 ? Math.round((activeVehicles / totalVehicles) * 100) : 0

  const activeTrips = trips.filter(
    (t) => t.status === "Dispatched" || t.status === "InTransit"
  ).length
  const availableDrivers = drivers.filter(
    (d) => d.status === "Available"
  ).length
  const vehiclesInShop = vehicles.filter((v) => v.status === "InShop").length

  const totalFuelCost = fuelLogs.reduce((acc, log) => acc + Number(log.cost), 0)
  const totalMaintCost = maintenances.reduce(
    (acc, rec) => acc + Number(rec.cost),
    0
  )
  const totalExpenseCost = expenses.reduce(
    (acc, exp) => acc + Number(exp.amount),
    0
  )
  const totalCost = totalFuelCost + totalMaintCost + totalExpenseCost

  const totalRevenue = trips
    .filter((t) => t.status === "Completed" && t.revenue)
    .reduce((acc, t) => acc + Number(t.revenue), 0)

  const statusBreakdown = {
    Available: vehicles.filter((v) => v.status === "Available").length,
    OnTrip: vehicles.filter((v) => v.status === "OnTrip").length,
    InShop: vehicles.filter((v) => v.status === "InShop").length,
    Retired: vehicles.filter((v) => v.status === "Retired").length,
  }

  const recentTripsList = trips.map((t) => {
    const v = vehicles.find((veh) => veh.id === t.vehicleId)
    const d = drivers.find((drv) => drv.id === t.driverId)
    return {
      id: t.id,
      orderId: t.orderId,
      source: t.source,
      destination: t.destination,
      vehicleName: v?.name ?? "Unknown Vehicle",
      vehicleReg: v?.registrationNumber ?? "N/A",
      driverName: d?.name ?? "Unknown Driver",
      revenue: t.revenue ? Number(t.revenue) : 0,
      status: t.status,
      createdAt: t.createdAt,
    }
  })

  return {
    kpis: {
      totalVehicles,
      activeVehicles,
      utilization,
      activeTrips,
      availableDrivers,
      vehiclesInShop,
      totalCost,
      totalRevenue,
    },
    statusBreakdown,
    recentTrips: recentTripsList,
  }
}

export async function getAnalyticsData() {
  const vehiclesResult = await tryCatch(db.select().from(vehicle))
  const vehicles = vehiclesResult.data || []

  const tripsResult = await tryCatch(db.select().from(trip))
  const trips = tripsResult.data || []

  const fuelLogsResult = await tryCatch(db.select().from(fuelLog))
  const fuelLogs = fuelLogsResult.data || []

  const maintenancesResult = await tryCatch(db.select().from(maintenanceRecord))
  const maintenances = maintenancesResult.data || []

  const expensesResult = await tryCatch(db.select().from(expense))
  const expenses = expensesResult.data || []

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  const monthlyChartData = months.map((month) => ({
    month,
    revenue: 0,
    cost: 0,
  }))

  trips.forEach((t) => {
    if (t.status === "Completed" && t.revenue) {
      const monthIdx = new Date(t.createdAt).getMonth() % 6
      monthlyChartData[monthIdx].revenue += Number(t.revenue)
    }
  })

  fuelLogs.forEach((f) => {
    const monthIdx = new Date(f.date).getMonth() % 6
    monthlyChartData[monthIdx].cost += Number(f.cost)
  })

  maintenances.forEach((m) => {
    const monthIdx = new Date(m.date).getMonth() % 6
    monthlyChartData[monthIdx].cost += Number(m.cost)
  })

  expenses.forEach((e) => {
    const monthIdx = new Date(e.date).getMonth() % 6
    monthlyChartData[monthIdx].cost += Number(e.amount)
  })

  const fuelCost = fuelLogs.reduce((acc, f) => acc + Number(f.cost), 0)
  const maintenanceCost = maintenances.reduce(
    (acc, m) => acc + Number(m.cost),
    0
  )
  const otherCost = expenses.reduce((acc, e) => acc + Number(e.amount), 0)

  const costBreakdown = [
    { name: "Fuel", value: fuelCost },
    { name: "Maintenance", value: maintenanceCost },
    { name: "Tolls & Fees", value: otherCost },
  ]

  let totalDistance = 0
  let totalFuel = 0
  trips.forEach((t) => {
    if (t.status === "Completed") {
      totalDistance += t.actualOdometerKm ?? t.plannedDistanceKm
      totalFuel += Number(t.fuelConsumedLiters ?? 0)
    }
  })
  const fuelEfficiency =
    totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : "0.00"

  const topCostliestVehicles = vehicles
    .map((v) => {
      const vehicleFuelCost = fuelLogs
        .filter((f) => f.vehicleId === v.id)
        .reduce((acc, f) => acc + Number(f.cost), 0)
      const vehicleMaintenanceCost = maintenances
        .filter((m) => m.vehicleId === v.id)
        .reduce((acc, m) => acc + Number(m.cost), 0)
      const vehicleExpenseCost = expenses
        .filter((e) => e.vehicleId === v.id)
        .reduce((acc, e) => acc + Number(e.amount), 0)

      return {
        vehicleName: v.name,
        vehicleReg: v.registrationNumber,
        totalCost:
          vehicleFuelCost + vehicleMaintenanceCost + vehicleExpenseCost,
      }
    })
    .filter((row) => row.totalCost > 0)
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 5)

  return {
    monthlyData: monthlyChartData,
    costBreakdown,
    fuelEfficiency,
    topCostliestVehicles,
  }
}

export async function generateCSVExport() {
  const tripsResult = await tryCatch(db.select().from(trip))
  const trips = tripsResult.data || []

  const vehiclesResult = await tryCatch(db.select().from(vehicle))
  const vehicles = vehiclesResult.data || []

  const driversResult = await tryCatch(db.select().from(driver))
  const drivers = driversResult.data || []

  const headers = [
    "Trip ID",
    "Vehicle",
    "Driver",
    "Source",
    "Destination",
    "Distance (km)",
    "Revenue ($)",
    "Status",
    "Date",
  ]
  const rows = trips.map((t) => {
    const v = vehicles.find((veh) => veh.id === t.vehicleId)
    const d = drivers.find((drv) => drv.id === t.driverId)
    return [
      t.orderId,
      v?.name ?? "Unknown",
      d?.name ?? "Unknown",
      t.source,
      t.destination,
      t.plannedDistanceKm.toString(),
      t.revenue ? t.revenue.toString() : "0",
      t.status,
      t.createdAt.toISOString().split("T")[0],
    ]
  })

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n")

  return csvContent
}
