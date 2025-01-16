import { getRequestContext } from "@cloudflare/next-on-pages"
import { drizzle } from "drizzle-orm/d1"
import * as schema from "@/lib/utils/schema"

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDB = globalThis as unknown as {
  client?: D1Database
}

export default function getDbClient() {
  const client = (getRequestContext().env as { DB: D1Database }).DB

  if (process.env.NODE_ENV === "development") globalForDB.client = client

  return drizzle(client, { schema })
}
