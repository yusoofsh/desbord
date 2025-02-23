import { eq, sql } from "drizzle-orm"
import db from "./db"
import { customers, invoices, revenues, metadata, users } from "./schema"
import { createUser } from "./user"

function generateId() {
  return crypto.randomUUID()
}

function randomDate(start: Date, end: Date) {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  )
    .toISOString()
    .split("T")[0]
}

function generateCustomers(count: number) {
  const firstNames = [
    "James",
    "Mary",
    "John",
    "Patricia",
    "Robert",
    "Jennifer",
    "Michael",
    "Linda",
    "William",
    "Elizabeth",
    "David",
    "Barbara",
    "Richard",
    "Susan",
    "Joseph",
    "Jessica",
    "Thomas",
    "Sarah",
    "Charles",
    "Karen",
  ]
  const lastNames = [
    "Smith",
    "Johnson",
    "Williams",
    "Brown",
    "Jones",
    "Garcia",
    "Miller",
    "Davis",
    "Rodriguez",
    "Martinez",
    "Hernandez",
    "Lopez",
    "Gonzalez",
    "Wilson",
    "Anderson",
    "Thomas",
    "Taylor",
    "Moore",
    "Jackson",
    "Martin",
  ]
  const domains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "example.com",
  ]

  return Array.from({ length: count }, () => {
    const firstName =
      firstNames[Math.floor(Math.random() * firstNames.length)] ?? "John"
    const lastName =
      lastNames[Math.floor(Math.random() * lastNames.length)] ?? "Doe"
    const domain =
      domains[Math.floor(Math.random() * domains.length)] ?? "example.com"
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`
    const seed = Math.random().toString(36).substring(7)
    const imageUrl = `https://api.dicebear.com/9.x/big-smile/svg?seed=${seed}`

    return {
      id: generateId(),
      name: `${firstName} ${lastName}`,
      email,
      imageUrl,
    }
  })
}

function generateInvoices(customers: Array<{ id: string }>, count: number) {
  const statuses = ["paid", "pending", "overdue"]
  const startDate = new Date("2023-01-01")
  const endDate = new Date("2024-03-10")

  // Ensure each customer has at least 3 invoices
  const invoices = customers.flatMap((customer) =>
    Array.from({ length: 3 }, () => ({
      customerId: customer.id,
      amount: Math.floor(Math.random() * 100000) + 1000,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      date: randomDate(startDate, endDate),
    })),
  )

  // Add remaining random invoices
  const remainingCount = count - invoices.length
  if (remainingCount > 0) {
    const randomInvoices = Array.from({ length: remainingCount }, () => {
      const customer = customers[Math.floor(Math.random() * customers.length)]
      if (!customer) return null
      return {
        customerId: customer.id,
        amount: Math.floor(Math.random() * 100000) + 1000,
        status:
          statuses[Math.floor(Math.random() * statuses.length)] ?? "pending",
        date: randomDate(startDate, endDate),
      }
    }).filter(
      (invoice): invoice is NonNullable<typeof invoice> => invoice !== null,
    )
    invoices.push(...randomInvoices)
  }

  // Sort by date
  return invoices.sort((a, b) => {
    if (!a.date || !b.date) return 0
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

function generateRevenues() {
  const baseRevenue = 150000 // Base revenue of 150k
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ]

  return monthNames.map((month) => ({
    month,
    revenue: Math.floor(
      baseRevenue + (Math.random() - 0.5) * baseRevenue * 0.5,
    ), // Fluctuate by ±25%
  }))
}

async function seed() {
  try {
    console.log("🌱 Seeding database...")

    // Clear existing data sequentially to avoid D1 limitations
    await db.delete(invoices)
    await db.delete(customers)
    await db.delete(revenues)
    await db.delete(users)
    await db.delete(metadata)

    // Create default user
    console.log("👤 Creating default user...")
    await createUser("yusoofsh", "me@yusoofsh.id", "c75e0daf")

    // Generate data
    const customersData = generateCustomers(100)
    const invoicesData = generateInvoices(customersData, 500)
    const revenuesData = generateRevenues()

    // Insert customers sequentially
    console.log("📝 Inserting customers...")
    for (const customer of customersData) {
      await db.run(
        sql`INSERT INTO customers (id, name, email, image_url) VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.imageUrl})`,
      )
    }

    // Insert invoices sequentially with correct property names
    console.log("📝 Inserting invoices...")
    for (const invoice of invoicesData) {
      await db.run(
        sql`INSERT INTO invoices (customer_id, amount, status, date) VALUES (${invoice.customerId}, ${invoice.amount}, ${invoice.status}, ${invoice.date})`,
      )
    }

    // Insert revenues sequentially
    console.log("📝 Inserting revenues...")
    for (const revenue of revenuesData) {
      await db.run(
        sql`INSERT INTO revenues (month, revenue) VALUES (${revenue.month}, ${revenue.revenue})`,
      )
    }

    console.log("✅ Database seeded successfully!")

    return true
  } catch (error) {
    return false
  }
}

export async function checkAndSeed() {
  // Check if database is already seeded
  const result = await db
    .select()
    .from(metadata)
    .where(eq(metadata.key, "seeded"))
    .get()

  if (result) return

  // Run seeding
  const success = await seed()

  if (success) {
    // Mark as seeded only if successful
    await db.insert(metadata).values({
      key: "seeded",
      value: new Date().toISOString(),
    })
  }
}
