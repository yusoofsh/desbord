import { getRequestContext } from "@cloudflare/next-on-pages"
import { drizzle } from "drizzle-orm/d1"
import * as schema from "@/lib/utils/schema"

export let client: D1Database

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client?: D1Database
}

const createDb = () => {
  client = globalForDb.client ?? getRequestContext().env.DB

  if (process.env.NODE_ENV === "development") globalForDb.client = client

  return drizzle(client, { schema })
}

export default createDb()
