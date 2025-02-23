import { formatCurrency } from "./more"
import db from "./db"
import { revenues } from "./schema"
import { eq, desc, like, or, sql } from "drizzle-orm"
import { invoices, customers } from "./schema"

export async function fetchRevenue() {
  // Artificially delay a response for demo purposes.
  // Don't do this in production :)
  await new Promise((resolve) => setTimeout(resolve, 3000))

  return db.select().from(revenues)
}

export async function fetchLatestInvoices() {
  const data = await db
    .select({
      amount: invoices.amount,
      name: customers.name,
      imageUrl: customers.imageUrl,
      email: customers.email,
      id: invoices.id,
    })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .orderBy(desc(invoices.date))
    .limit(5)

  return data.map((invoice) => ({
    ...invoice,
    amount: formatCurrency(invoice.amount),
  }))
}

export async function fetchCardData() {
  const data = await db
    .select({
      invoiceCount: sql<number>`count(distinct ${invoices.id})`,
      customerCount: sql<number>`count(distinct ${customers.id})`,
      paidTotal: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.amount} else 0 end)`,
      pendingTotal: sql<number>`sum(case when ${invoices.status} = 'pending' then ${invoices.amount} else 0 end)`,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))

  const numberOfInvoices = Number(data[0]?.invoiceCount ?? 0)
  const numberOfCustomers = Number(data[0]?.customerCount ?? 0)
  const totalPaidInvoices = formatCurrency(data[0]?.paidTotal ?? 0)
  const totalPendingInvoices = formatCurrency(data[0]?.pendingTotal ?? 0)

  return {
    numberOfCustomers,
    numberOfInvoices,
    totalPaidInvoices,
    totalPendingInvoices,
  }
}

const ITEMS_PER_PAGE = 6

export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE

  const data = await db
    .select({
      id: invoices.id,
      amount: invoices.amount,
      date: invoices.date,
      status: invoices.status,
      name: customers.name,
      email: customers.email,
      imageUrl: customers.imageUrl,
    })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .where(
      or(
        like(customers.name, `%${query}%`),
        like(customers.email, `%${query}%`),
        like(sql<string>`${invoices.amount}`, `%${query}%`),
        like(sql<string>`${invoices.date}`, `%${query}%`),
        like(invoices.status, `%${query}%`),
      ),
    )
    .orderBy(desc(invoices.date))
    .limit(ITEMS_PER_PAGE)
    .offset(offset)

  return data
}

export async function fetchInvoicesPages(query: string) {
  const count = await db
    .select({ count: sql<number>`count(*)` })
    .from(invoices)
    .innerJoin(customers, eq(invoices.customerId, customers.id))
    .where(
      or(
        like(customers.name, `%${query}%`),
        like(customers.email, `%${query}%`),
        like(sql<string>`${invoices.amount}`, `%${query}%`),
        like(sql<string>`${invoices.date}`, `%${query}%`),
        like(invoices.status, `%${query}%`),
      ),
    )

  return Math.ceil(Number(count[0]?.count ?? 0) / ITEMS_PER_PAGE)
}

export async function fetchInvoiceById(id: string) {
  const data = await db
    .select({
      id: invoices.id,
      customerId: invoices.customerId,
      amount: invoices.amount,
      status: invoices.status,
    })
    .from(invoices)
    .where(eq(invoices.id, Number(id)))

  const invoice = data.map((invoice) => ({
    ...invoice,
    // Convert amount from cents to dollars
    amount: invoice.amount / 100,
  }))

  return invoice[0]
}

export async function fetchCustomers() {
  return db
    .select({
      id: customers.id,
      name: customers.name,
    })
    .from(customers)
    .orderBy(desc(customers.name))
}

export async function fetchFilteredCustomers(query: string) {
  const data = await db
    .select({
      id: customers.id,
      name: customers.name,
      email: customers.email,
      imageUrl: customers.imageUrl,
      total_invoices: sql<number>`count(${invoices.id})`,
      total_pending: sql<number>`sum(case when ${invoices.status} = 'pending' then ${invoices.amount} else 0 end)`,
      total_paid: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.amount} else 0 end)`,
    })
    .from(customers)
    .leftJoin(invoices, eq(customers.id, invoices.customerId))
    .where(
      or(
        like(customers.name, `%${query}%`),
        like(customers.email, `%${query}%`),
      ),
    )
    .groupBy(customers.id, customers.name, customers.email, customers.imageUrl)
    .orderBy(desc(customers.name))

  return data.map((customer) => ({
    ...customer,
    total_pending: formatCurrency(customer.total_pending),
    total_paid: formatCurrency(customer.total_paid),
  }))
}
