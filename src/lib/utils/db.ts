import { getRequestContext } from "@cloudflare/next-on-pages"
import { drizzle } from "drizzle-orm/d1"
import * as schema from "@/lib/utils/schema"

/**
 * Cache the database connection.
 * This avoids creating a new connection on every HMR update.
 */
const globalForDB = globalThis as unknown as {
  client?: D1Database
}

function getDBClient() {
  let client

  if (process.env.NODE_ENV === "development") {
    client =
      globalForDB.client ?? (getRequestContext().env as { DB: D1Database }).DB
  } else {
    client = globalForDB.client ?? (process.env.DB as unknown as D1Database)
  }

  globalForDB.client = client

  return drizzle(client, { schema })
}

export default getDBClient()
