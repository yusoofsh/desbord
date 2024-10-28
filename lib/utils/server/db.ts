import { getRequestContext } from "@cloudflare/next-on-pages"
import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1"
import * as schema from "@/lib/utils/server/schema"

export let client: DrizzleD1Database

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  client?: DrizzleD1Database
}

const createDb = () => {
  client =
    globalForDb.client ??
    (
      getRequestContext() as unknown as {
        env: { CLOUDFLARE_DB_ID: DrizzleD1Database }
      }
    ).env.CLOUDFLARE_DB_ID

  if (process.env.NODE_ENV === "development") globalForDb.client = client

  return drizzle(client, { schema })
}

export default createDb()
