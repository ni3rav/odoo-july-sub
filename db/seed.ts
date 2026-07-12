import "@/db/load-env"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import {
  driver,
  expense,
  fuelLog,
  inventoryItem,
  maintenanceRecord,
  permission,
  role,
  rolePermission,
  trip,
  vehicle,
} from "@/db/schema"
import {
  DEFAULT_ROLE_PERMISSION_MATRIX,
  flattenMatrix,
} from "@/db/schema/rbac-defaults"
import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  ROLE_NAMES,
  ROLE_SLUGS,
  type RoleSlug,
} from "@/db/schema/constants"
import { tryCatch } from "@/lib/try-catch"

const RECORDS_PER_SECTION = 200

function id() {
  return crypto.randomUUID()
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randFloat(min: number, max: number, decimals = 2) {
  return Number((Math.random() * (max - min) + min).toFixed(decimals))
}

function pick<T>(items: T[]) {
  return items[randInt(0, items.length - 1)]
}

function pad(value: number, length: number) {
  return String(value).padStart(length, "0")
}

function shuffledIndices(count: number) {
  const indices = Array.from({ length: count }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = randInt(0, i)
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices
}

function daysAgo(days: number, hourJitter = 23) {
  const date = new Date()
  date.setDate(date.getDate() - days)
  date.setHours(randInt(0, hourJitter), randInt(0, 59), 0, 0)
  return date
}

async function seedRoles() {
  const roleIds = new Map<RoleSlug, string>()

  for (const slug of ROLE_SLUGS) {
    const { error } = await tryCatch(
      db
        .insert(role)
        .values({
          id: id(),
          name: ROLE_NAMES[slug],
          slug,
        })
        .onConflictDoNothing({ target: role.slug })
    )

    if (error) {
      throw error
    }

    const { data: existing, error: fetchError } = await tryCatch(
      db.select().from(role).where(eq(role.slug, slug)).limit(1)
    )

    if (fetchError || !existing?.[0]) {
      throw fetchError ?? new Error(`Failed to load role ${slug}`)
    }

    roleIds.set(slug, existing[0].id)
  }

  return roleIds
}

async function seedPermissions() {
  for (const permModule of PERMISSION_MODULES) {
    for (const action of PERMISSION_ACTIONS) {
      const { error } = await tryCatch(
        db
          .insert(permission)
          .values({ id: id(), module: permModule, action })
          .onConflictDoNothing({
            target: [permission.module, permission.action],
          })
      )

      if (error) {
        throw error
      }
    }
  }

  const { data: allPermissions, error: loadError } = await tryCatch(
    db.select().from(permission)
  )

  if (loadError || !allPermissions) {
    throw loadError ?? new Error("Failed to load permissions")
  }

  const permissionIds = new Map<string, string>()

  for (const row of allPermissions) {
    permissionIds.set(`${row.module}:${row.action}`, row.id)
  }

  return permissionIds
}

async function seedRolePermissions(
  roleIds: Map<RoleSlug, string>,
  permissionIds: Map<string, string>
) {
  const grants = flattenMatrix(DEFAULT_ROLE_PERMISSION_MATRIX)

  for (const grant of grants) {
    const roleId = roleIds.get(grant.roleSlug)
    const permissionId = permissionIds.get(`${grant.module}:${grant.action}`)

    if (!roleId || !permissionId) {
      continue
    }

    const { error } = await tryCatch(
      db
        .insert(rolePermission)
        .values({
          roleId,
          permissionId,
          granted: true,
        })
        .onConflictDoNothing()
    )

    if (error) {
      throw error
    }
  }
}

// Indian-subcontinent demo fleet data

const STATES = [
  { code: "MH", region: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur"] },
  { code: "DL", region: "Delhi NCR", cities: ["Delhi", "Gurugram", "Noida"] },
  { code: "KA", region: "Karnataka", cities: ["Bengaluru", "Mysuru"] },
  { code: "TN", region: "Tamil Nadu", cities: ["Chennai", "Coimbatore"] },
  { code: "WB", region: "West Bengal", cities: ["Kolkata", "Siliguri"] },
  { code: "TS", region: "Telangana", cities: ["Hyderabad", "Warangal"] },
  { code: "GJ", region: "Gujarat", cities: ["Ahmedabad", "Surat"] },
  { code: "RJ", region: "Rajasthan", cities: ["Jaipur", "Jodhpur"] },
  { code: "UP", region: "Uttar Pradesh", cities: ["Lucknow", "Kanpur"] },
  { code: "PB", region: "Punjab", cities: ["Chandigarh", "Ludhiana"] },
  { code: "KL", region: "Kerala", cities: ["Kochi", "Thiruvananthapuram"] },
  { code: "BR", region: "Bihar", cities: ["Patna", "Gaya"] },
]

const VEHICLE_MODELS = [
  { name: "Tata Ace Gold", type: "Mini Truck", capacity: [750, 1000], cost: [450000, 600000] },
  { name: "Mahindra Bolero Pickup", type: "Pickup", capacity: [1500, 1700], cost: [750000, 900000] },
  { name: "Ashok Leyland Dost+", type: "LCV", capacity: [1500, 2000], cost: [900000, 1100000] },
  { name: "Tata 407 Gold SFC", type: "LCV", capacity: [2500, 3000], cost: [1200000, 1500000] },
  { name: "Eicher Pro 2049", type: "HCV", capacity: [4000, 5000], cost: [1800000, 2200000] },
  { name: "Mahindra Furio 7", type: "HCV", capacity: [5500, 7000], cost: [2200000, 2600000] },
  { name: "Force Traveller", type: "Van", capacity: [1000, 1200], cost: [1500000, 1700000] },
  { name: "Tata Winger", type: "Van", capacity: [800, 1000], cost: [1300000, 1500000] },
  { name: "Maruti Suzuki Super Carry", type: "Mini Truck", capacity: [600, 740], cost: [500000, 600000] },
  { name: "Piaggio Ape Xtra", type: "Three-Wheeler", capacity: [500, 600], cost: [300000, 350000] },
  { name: "Bajaj Maxima Z", type: "Three-Wheeler", capacity: [500, 550], cost: [280000, 320000] },
  { name: "Ashok Leyland Boss", type: "HCV", capacity: [9000, 10000], cost: [2800000, 3200000] },
] as const

const FIRST_NAMES = [
  "Rajesh", "Amit", "Suresh", "Vijay", "Ramesh", "Anil", "Ganesh", "Manoj",
  "Deepak", "Arjun", "Sanjay", "Ravi", "Prakash", "Vikram", "Ashok", "Naveen",
  "Rakesh", "Sunil", "Mahesh", "Dinesh", "Priya", "Sunita", "Kavita", "Anita",
  "Pooja", "Neha", "Meena", "Geeta", "Rekha", "Shweta", "Kiran", "Farhan",
  "Imran", "Salim", "Iqbal", "Harpreet", "Gurpreet", "Jaspreet", "Balwinder",
  "Muthu", "Karthik", "Senthil", "Rajan", "Krishnan", "Venkatesh", "Srinivas",
  "Rahul", "Rohit", "Aditya", "Nitin", "Yogesh", "Pankaj", "Ajay", "Vinod",
  "Satish", "Mohan", "Raju", "Sandeep",
]

const LAST_NAMES = [
  "Kumar", "Sharma", "Reddy", "Singh", "Yadav", "Verma", "Patil", "Tiwari",
  "Nair", "Mehta", "Gupta", "Shankar", "Rao", "Chauhan", "Joshi", "Pandey",
  "Deshmukh", "Iyer", "Choudhary", "Khan", "Kaur", "Gill", "Nadar", "Pillai",
  "Menon", "Das", "Bose", "Chatterjee", "Banerjee",
]

const LICENSE_CATEGORIES = ["LMV", "HMV", "HGMV", "Transport", "Heavy Vehicle"]

const HUB_SUFFIXES = [
  "Distribution Hub", "Logistics Park", "Freight Terminal", "Cargo Depot",
  "Warehouse", "Regional Depot",
]

const ALL_CITIES = STATES.flatMap((s) => s.cities)

const MAINTENANCE_SERVICE_TYPES = [
  "Oil Change", "Brake Inspection", "Tyre Rotation", "Engine Tune-up",
  "Clutch Repair", "Battery Replacement", "AC Service", "Suspension Check",
  "Wheel Alignment", "General Service", "Radiator Flush",
  "Transmission Service", "Electrical Repair", "Denting & Painting",
]

const INVENTORY_BASE_PARTS = [
  "Brake Pad Set", "Air Filter", "Oil Filter", "Fuel Filter", "Timing Belt",
  "Battery 12V", "Tyre 7.50-16", "Clutch Plate", "Radiator Coolant",
  "Wiper Blade Set", "Headlight Assembly", "Spark Plug Set",
  "Brake Fluid DOT4", "Engine Oil 15W40 (5L)", "Cabin Air Filter", "Fan Belt",
  "Shock Absorber", "CV Joint Kit", "Alternator", "Starter Motor",
  "Leaf Spring", "Wheel Bearing", "Brake Drum", "Clutch Cable", "Gear Oil",
  "Radiator Hose", "Suspension Bush", "Horn", "Side Mirror",
  "Windshield Glass",
]

const INVENTORY_BRANDS = [
  "Bosch", "MRF", "Apollo", "Exide", "Amaron", "Tata Genuine",
  "Mahindra Genuine", "Rane", "Lucas TVS", "Minda", "Denso", "Valeo",
]

function generateHubName() {
  return `${pick(ALL_CITIES)} ${pick(HUB_SUFFIXES)}`
}

function generateContactNumber() {
  const prefix = pick(["70", "80", "90", "60"])
  const rest = pad(randInt(0, 99999999), 8)
  return `+91 ${prefix}${rest.slice(0, 3)} ${rest.slice(3)}`
}

type StatusPlan<T extends string> = {
  reservedForLive: number[]
  statusFor: (index: number) => T | "OnTrip" | "Available"
}

function buildStatusPlan<T extends string>(
  total: number,
  liveReserveCount: number,
  extras: [T, number][]
): StatusPlan<T> {
  const indices = shuffledIndices(total)
  const plan = new Map<number, T | "OnTrip">()

  let cursor = 0
  const reservedForLive = indices.slice(cursor, cursor + liveReserveCount)
  cursor += liveReserveCount
  for (const idx of reservedForLive) {
    plan.set(idx, "OnTrip" as T | "OnTrip")
  }

  for (const [status, count] of extras) {
    const slice = indices.slice(cursor, cursor + count)
    cursor += count
    for (const idx of slice) {
      plan.set(idx, status)
    }
  }

  return {
    reservedForLive,
    statusFor: (index: number) => plan.get(index) ?? "Available",
  }
}

async function countOf<T>(queryPromise: Promise<T[]>) {
  const { data } = await tryCatch(queryPromise)
  return data?.length ?? 0
}

async function seedVehicles() {
  const existing = await countOf(db.select().from(vehicle))
  if (existing >= RECORDS_PER_SECTION) {
    return {
      rows: await db.select().from(vehicle).limit(RECORDS_PER_SECTION),
      reservedForLive: [] as number[],
    }
  }

  const plan = buildStatusPlan(RECORDS_PER_SECTION, 30, [
    ["Retired", 10],
    ["InShop", 10],
  ])

  const values: (typeof vehicle.$inferInsert)[] = Array.from(
    { length: RECORDS_PER_SECTION },
    (_, i) => {
      const model = pick([...VEHICLE_MODELS])
      const state = pick(STATES)
      const capacity = randInt(model.capacity[0], model.capacity[1])
      const cost = randInt(model.cost[0], model.cost[1])

      return {
        id: id(),
        registrationNumber: `${state.code}${pad(randInt(1, 50), 2)}${pick(["AB", "CD", "EF", "GH", "JK", "LM", "PQ", "RS", "TU", "VW"])}${pad(i + 1, 4)}`,
        name: `${model.name} ${pad(i + 1, 3)}`,
        type: model.type,
        maxLoadCapacityKg: capacity,
        odometerKm: randInt(1000, 180000),
        acquisitionCost: cost.toFixed(2),
        region: state.region,
        status: plan.statusFor(i),
      }
    }
  )

  const rows = await db.insert(vehicle).values(values).returning()

  return { rows, reservedForLive: plan.reservedForLive }
}

async function seedDrivers() {
  const existing = await countOf(db.select().from(driver))
  if (existing >= RECORDS_PER_SECTION) {
    return {
      rows: await db.select().from(driver).limit(RECORDS_PER_SECTION),
      reservedForLive: [] as number[],
    }
  }

  const plan = buildStatusPlan(RECORDS_PER_SECTION, 30, [
    ["OffDuty", 15],
    ["Suspended", 10],
  ])

  const values: (typeof driver.$inferInsert)[] = Array.from(
    { length: RECORDS_PER_SECTION },
    (_, i) => {
      const state = pick(STATES)
      const isExpired = Math.random() < 0.1
      const expiry = isExpired
        ? daysAgo(randInt(1, 200))
        : (() => {
            const future = new Date()
            future.setDate(future.getDate() + randInt(90, 1100))
            return future
          })()

      return {
        id: id(),
        name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        licenseNumber: `${state.code}${pad(randInt(1, 50), 2)}${randInt(2008, 2023)}${pad(i + 1, 7)}`,
        licenseCategory: pick(LICENSE_CATEGORIES),
        licenseExpiryDate: expiry,
        contactNumber: generateContactNumber(),
        safetyScore: randInt(60, 100),
        status: plan.statusFor(i),
      }
    }
  )

  const rows = await db.insert(driver).values(values).returning()

  return { rows, reservedForLive: plan.reservedForLive }
}

async function seedTrips(
  vehicles: (typeof vehicle.$inferSelect)[],
  drivers: (typeof driver.$inferSelect)[],
  reservedVehicleIndices: number[],
  reservedDriverIndices: number[]
) {
  const existing = await countOf(db.select().from(trip))
  if (existing >= RECORDS_PER_SECTION) {
    return await db.select().from(trip).limit(RECORDS_PER_SECTION)
  }

  const rows: (typeof trip.$inferInsert)[] = []

  const liveCount = Math.min(
    reservedVehicleIndices.length,
    reservedDriverIndices.length
  )
  const dispatchedCount = Math.round(liveCount * 0.53)

  for (let i = 0; i < liveCount; i++) {
    const v = vehicles[reservedVehicleIndices[i]]
    const d = drivers[reservedDriverIndices[i]]
    const status = i < dispatchedCount ? "Dispatched" : "InTransit"
    const cargoWeightKg = Math.max(
      50,
      Math.floor(v.maxLoadCapacityKg * randFloat(0.3, 0.9, 2))
    )

    rows.push({
      id: id(),
      orderId: `TRIP-${pad(100000 + rows.length, 6)}`,
      source: generateHubName(),
      destination: generateHubName(),
      vehicleId: v.id,
      driverId: d.id,
      cargoWeightKg,
      plannedDistanceKm: randInt(80, 1400),
      revenue: randFloat(1500, 28000).toFixed(2),
      status,
      createdAt: daysAgo(randInt(0, 5)),
    })
  }

  const historicalCount = RECORDS_PER_SECTION - liveCount
  const completedCount = Math.round(historicalCount * (130 / 170))
  const cancelledCount = Math.round(historicalCount * (20 / 170))

  for (let i = 0; i < historicalCount; i++) {
    const v = pick(vehicles)
    const d = pick(drivers)
    const status =
      i < completedCount
        ? "Completed"
        : i < completedCount + cancelledCount
          ? "Cancelled"
          : "Draft"
    const cargoWeightKg = Math.max(
      50,
      Math.floor(v.maxLoadCapacityKg * randFloat(0.3, 0.9, 2))
    )
    const plannedDistanceKm = randInt(80, 1400)
    const isDraft = status === "Draft"

    rows.push({
      id: id(),
      orderId: `TRIP-${pad(100000 + rows.length, 6)}`,
      source: generateHubName(),
      destination: generateHubName(),
      vehicleId: v.id,
      driverId: d.id,
      cargoWeightKg,
      plannedDistanceKm,
      actualOdometerKm:
        status === "Completed"
          ? v.odometerKm + randInt(plannedDistanceKm, plannedDistanceKm + 40)
          : null,
      fuelConsumedLiters:
        status === "Completed"
          ? randFloat(plannedDistanceKm / 12, plannedDistanceKm / 5).toFixed(2)
          : null,
      revenue: isDraft && Math.random() < 0.5 ? null : randFloat(1500, 28000).toFixed(2),
      status,
      createdAt: isDraft ? daysAgo(randInt(0, 10)) : daysAgo(randInt(5, 180)),
    })
  }

  return await db.insert(trip).values(rows).returning()
}

async function seedMaintenanceRecords(
  vehicles: (typeof vehicle.$inferSelect)[]
) {
  const existing = await countOf(db.select().from(maintenanceRecord))
  if (existing >= RECORDS_PER_SECTION) {
    return
  }

  const inShopVehicles = vehicles.filter((v) => v.status === "InShop")
  const rows: (typeof maintenanceRecord.$inferInsert)[] = inShopVehicles.map(
    (v) => ({
      id: id(),
      vehicleId: v.id,
      serviceType: pick(MAINTENANCE_SERVICE_TYPES),
      date: daysAgo(randInt(0, 10)),
      cost: randFloat(2000, 45000).toFixed(2),
      notes: "Vehicle currently in shop for service.",
      status: "Open" as const,
    })
  )

  const remaining = RECORDS_PER_SECTION - rows.length
  for (let i = 0; i < remaining; i++) {
    rows.push({
      id: id(),
      vehicleId: pick(vehicles).id,
      serviceType: pick(MAINTENANCE_SERVICE_TYPES),
      date: daysAgo(randInt(10, 365)),
      cost: randFloat(800, 45000).toFixed(2),
      notes: Math.random() < 0.4 ? "Routine scheduled maintenance." : null,
      status: "Completed" as const,
    })
  }

  await db.insert(maintenanceRecord).values(rows)
}

async function seedFuelLogs(
  vehicles: (typeof vehicle.$inferSelect)[],
  trips: (typeof trip.$inferSelect)[]
) {
  const existing = await countOf(db.select().from(fuelLog))
  if (existing >= RECORDS_PER_SECTION) {
    return
  }

  const completedTripsByVehicle = new Map<string, string[]>()
  for (const t of trips) {
    if (t.status !== "Completed") continue
    const list = completedTripsByVehicle.get(t.vehicleId) ?? []
    list.push(t.id)
    completedTripsByVehicle.set(t.vehicleId, list)
  }

  const rows: (typeof fuelLog.$inferInsert)[] = Array.from(
    { length: RECORDS_PER_SECTION },
    () => {
      const v = pick(vehicles)
      const liters = randFloat(15, 120)
      const pricePerLiter = randFloat(90, 105)
      const linkedTrips = completedTripsByVehicle.get(v.id)
      const tripId =
        linkedTrips && Math.random() < 0.4 ? pick(linkedTrips) : null

      return {
        id: id(),
        vehicleId: v.id,
        tripId,
        liters: liters.toFixed(2),
        cost: (liters * pricePerLiter).toFixed(2),
        date: daysAgo(randInt(0, 180)),
      }
    }
  )

  await db.insert(fuelLog).values(rows)
}

async function seedExpenses(
  vehicles: (typeof vehicle.$inferSelect)[],
  trips: (typeof trip.$inferSelect)[]
) {
  const existing = await countOf(db.select().from(expense))
  if (existing >= RECORDS_PER_SECTION) {
    return
  }

  const tripsByVehicle = new Map<string, string[]>()
  for (const t of trips) {
    if (t.status !== "Completed" && t.status !== "Cancelled") continue
    const list = tripsByVehicle.get(t.vehicleId) ?? []
    list.push(t.id)
    tripsByVehicle.set(t.vehicleId, list)
  }

  const rows: (typeof expense.$inferInsert)[] = Array.from(
    { length: RECORDS_PER_SECTION },
    () => {
      const v = pick(vehicles)
      const isToll = Math.random() < 0.7
      const linkedTrips = tripsByVehicle.get(v.id)
      const tripId =
        linkedTrips && Math.random() < 0.4 ? pick(linkedTrips) : null

      return {
        id: id(),
        vehicleId: v.id,
        tripId,
        category: (isToll ? "toll" : "other") as "toll" | "other",
        amount: (isToll ? randFloat(50, 800) : randFloat(200, 5000)).toFixed(
          2
        ),
        date: daysAgo(randInt(0, 180)),
      }
    }
  )

  await db.insert(expense).values(rows)
}

async function seedInventoryItems() {
  const existing = await countOf(db.select().from(inventoryItem))
  if (existing >= RECORDS_PER_SECTION) {
    return
  }

  const combos: { name: string }[] = []
  for (const brand of INVENTORY_BRANDS) {
    for (const part of INVENTORY_BASE_PARTS) {
      combos.push({ name: `${brand} ${part}` })
    }
  }
  const shuffled = shuffledIndices(combos.length).slice(0, RECORDS_PER_SECTION)

  const rows: (typeof inventoryItem.$inferInsert)[] = shuffled.map((idx) => {
    const quantity = randInt(0, 150)
    const reorderLevel = randInt(5, 40)

    return {
      id: id(),
      name: combos[idx].name,
      quantity,
      reorderLevel,
      status: quantity <= reorderLevel ? "LowStock" : "InStock",
    }
  })

  await db.insert(inventoryItem).values(rows)
}

async function seedFleetData() {
  const { rows: vehicles, reservedForLive: reservedVehicleIndices } =
    await seedVehicles()
  console.log(`Vehicles: ${vehicles.length}`)

  const { rows: drivers, reservedForLive: reservedDriverIndices } =
    await seedDrivers()
  console.log(`Drivers: ${drivers.length}`)

  const trips = await seedTrips(
    vehicles,
    drivers,
    reservedVehicleIndices,
    reservedDriverIndices
  )
  console.log(`Trips: ${trips.length}`)

  await seedMaintenanceRecords(vehicles)
  console.log(`Maintenance records: ${await countOf(db.select().from(maintenanceRecord))}`)

  await seedFuelLogs(vehicles, trips)
  console.log(`Fuel logs: ${await countOf(db.select().from(fuelLog))}`)

  await seedExpenses(vehicles, trips)
  console.log(`Expenses: ${await countOf(db.select().from(expense))}`)

  await seedInventoryItems()
  console.log(`Inventory items: ${await countOf(db.select().from(inventoryItem))}`)
}

async function main() {
  console.log("Seeding TransitOps...")

  const roleIds = await seedRoles()
  console.log(`Roles: ${roleIds.size}`)

  const permissionIds = await seedPermissions()
  console.log(`Permissions: ${permissionIds.size}`)

  await seedRolePermissions(roleIds, permissionIds)
  console.log("Role permissions seeded")

  await seedFleetData()

  console.log("Done. Assign roleId to users after signup.")
  process.exit(0)
}

main().catch((error) => {
  console.error("Seed failed:", error)
  process.exit(1)
})
