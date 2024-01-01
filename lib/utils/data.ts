import { type QueryResultRow, sql } from "@vercel/postgres";
import { unstable_noStore as noStore } from "next/cache";

import {
  type CustomerField,
  type CustomersTable,
  type InvoiceForm,
  type InvoicesTable,
  type LatestInvoiceRaw,
  type Revenue,
  type User,
  formatCurrency,
} from "@/lib/utils";

type NullishNumber = undefined | null | number;
type Primitive = string | number | boolean | undefined | null;

async function executeQuery<T extends QueryResultRow>(
  query: TemplateStringsArray,
  ...params: Primitive[]
): Promise<T[]> {
  noStore();

  return (await sql<T>(query, ...params)).rows;
}

export async function fetchRevenue() {
  await new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });

  return executeQuery<Revenue>`SELECT * FROM revenue`;
}

export async function fetchLatestInvoices() {
  const latestInvoices = await executeQuery<LatestInvoiceRaw>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

  return latestInvoices.map((invoice) => ({
    ...invoice,
    amount: formatCurrency(invoice.amount),
  }));
}

export async function fetchCardData() {
  const [invoiceCountData, customerCountData, invoiceStatusData] =
    await Promise.all([
      executeQuery<{ count: NullishNumber }>`SELECT COUNT(*) FROM invoices`,
      executeQuery<{ count: NullishNumber }>`SELECT COUNT(*) FROM customers`,
      executeQuery<{ paid: NullishNumber; pending: NullishNumber }>`SELECT
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
        FROM invoices
        `,
    ]);

  const numberOfInvoices = Number(invoiceCountData[0]?.count ?? 0);
  const numberOfCustomers = Number(customerCountData[0]?.count ?? 0);
  const totalPaidInvoices = formatCurrency(invoiceStatusData[0]?.paid ?? 0);
  const totalPendingInvoices = formatCurrency(
    invoiceStatusData[0]?.pending ?? 0,
  );

  return {
    numberOfCustomers,
    numberOfInvoices,
    totalPaidInvoices,
    totalPendingInvoices,
  };
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  const invoicesData = await executeQuery<InvoicesTable>`
    SELECT
      invoices.id,
      invoices.amount,
      invoices.date,
      invoices.status,
      customers.name,
      customers.email,
      customers.image_url
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
    ORDER BY invoices.date DESC
    LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
  `;

  return invoicesData;
}

export async function fetchInvoicesPages(query: string) {
  const countData = await executeQuery<{ count: number }>`
    SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

  return countData[0] ? Math.ceil(countData[0].count / ITEMS_PER_PAGE) : 0;
}

export async function fetchInvoiceById(id: string) {
  const invoiceData = await executeQuery<InvoiceForm>`
    SELECT
      invoices.id,
      invoices.customer_id,
      invoices.amount,
      invoices.status
    FROM invoices
    WHERE invoices.id = ${id};
  `;

  const invoice = invoiceData.map((invoice) => ({
    ...invoice,
    amount: invoice.amount / 100,
  }));

  return invoice[0];
}

export async function fetchCustomers() {
  const customersData = await executeQuery<CustomerField>`
    SELECT
      id,
      name
    FROM customers
    ORDER BY name ASC
  `;

  return customersData;
}

export async function fetchFilteredCustomers(query: string) {
  const customersData = await executeQuery<CustomersTable>`
      SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

  const customers = customersData.map((customer) => ({
    ...customer,
    total_pending: formatCurrency(customer.total_pending),
    total_paid: formatCurrency(customer.total_paid),
  }));

  return customers;
}

export async function getUser(email: string) {
  const userData =
    await executeQuery<User>`SELECT * FROM users WHERE email=${email}`;

  return userData[0];
}
