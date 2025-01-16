import { getRequestContext } from "@cloudflare/next-on-pages"
import { drizzle } from "drizzle-orm/d1"
import * as schema from "@/lib/utils/schema"

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
export let client: D1Database
const globalForDb = globalThis as unknown as {
  client?: D1Database
}

function createDbClient() {
  if (!globalForDb.client) {
    client = (getRequestContext().env as { DB: D1Database }).DB

    if (process.env.NODE_ENV === "development") globalForDb.client = client
  } else {
    client = globalForDb.client
  }

  return drizzle(client, { schema })
}

const db = createDbClient()
export default db
