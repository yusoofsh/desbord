import { type QueryResultRow, sql } from "@vercel/postgres";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";

import {
  type CustomerField,
  type CustomersTable,
  type InvoiceForm,
  type InvoicesTable,
  type LatestInvoiceRaw,
  type Revenue,
  type User,
  formatCurrency,
  seed,
} from "@/lib/utils";

type NullishNumber = undefined | null | number;
type Primitive = string | number | boolean | undefined | null;

let seeding = false;

async function executeQuery<T extends QueryResultRow>(
  query: TemplateStringsArray,
  ...params: Primitive[]
): Promise<T[]> {
  noStore();

  return (await sql<T>(query, ...params)).rows;
}

async function handleDatabaseError(error: unknown, message: string) {
  if (seeding) return;

  if (error instanceof Error && error.message.includes(`does not exist`)) {
    // eslint-disable-next-line no-console -- Useful for informational purposes
    console.log("Seeding the data...");

    seeding = true;

    await seed();

    redirect("/");
  } else {
    throw new Error(message);
  }
}

export async function fetchRevenue() {
  try {
    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });

    return executeQuery<Revenue>`SELECT * FROM revenue`;
  } catch (error) {
    await handleDatabaseError(error, "Failed to fetch revenue data.");

    return [];
  }
}

export async function fetchLatestInvoices() {
  try {
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
  } catch (error) {
    await handleDatabaseError(error, "Failed to fetch the latest invoices.");

    return [];
  }
}

export async function fetchCardData() {
  try {
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
  } catch (error) {
    await handleDatabaseError(error, "Failed to fetch card data.");

    return {
      numberOfCustomers: 0,
      numberOfInvoices: 0,
      totalPaidInvoices: "",
      totalPendingInvoices: "",
    };
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
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
  } catch (error) {
    await handleDatabaseError(error, "Failed to fetch invoices.");

    return [];
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
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

    return Math.ceil(countData[0]?.count || 0 / ITEMS_PER_PAGE);
  } catch (error) {
    await handleDatabaseError(
      error,
      "Failed to fetch total number of invoices.",
    );
  }
}

export async function fetchInvoiceById(id: string) {
  try {
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
  } catch (error) {
    await handleDatabaseError(error, "Failed to fetch invoice.");
  }
}

export async function fetchCustomers() {
  try {
    const customersData = await executeQuery<CustomerField>`
    SELECT
      id,
      name
    FROM customers
    ORDER BY name ASC
  `;

    return customersData;
  } catch (err) {
    await handleDatabaseError(err, "Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
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
  } catch (err) {
    await handleDatabaseError(err, "Failed to fetch customer table.");
  }
}

export async function getUser(email: string) {
  try {
    const userData =
      await executeQuery<User>`SELECT * FROM users WHERE email=${email}`;

    return userData[0];
  } catch (error) {
    await handleDatabaseError(error, "Failed to fetch user.");
  }
}
