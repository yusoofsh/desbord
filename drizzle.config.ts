import type { Config } from "drizzle-kit"

import { existsSync, readdirSync } from "fs"
import { resolve } from "path"

const getLocalD1 = () => {
  const basePath = resolve(".wrangler")

  if (!existsSync(basePath)) return

  const dbFile = readdirSync(basePath, {
    encoding: "utf-8",
    recursive: true,
  }).find((file) => file.endsWith(".sqlite"))

  if (!dbFile) return

  return resolve(basePath, dbFile)
}

const getCredentials = () => {
  const prod = {
    driver: "d1-http",
    dbCredentials: {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
      databaseId: process.env.CLOUDFLARE_DB_ID!,
      token: process.env.CLOUDFLARE_D1_TOKEN!,
    },
  }

  const dev = {
    dbCredentials: {
      url: getLocalD1(),
    },
  }

  return process.env.NODE_ENV === "production" ? prod : dev
}

const drizzleConfig = {
  dialect: "sqlite",
  schema: "src/lib/utils/schema.ts",
  out: ".drizzle/migrations",
  ...getCredentials(),
} satisfies Config
export default drizzleConfig
