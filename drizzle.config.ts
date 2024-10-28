import { Config } from "drizzle-kit"

const drizzleConfig = {
  dialect: "sqlite",
  driver: "d1-http",
  schema: "lib/utils/server/schema.ts",
  out: ".drizzle/migrations",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
    databaseId: process.env.CLOUDFLARE_DB_ID!,
    token: process.env.CLOUDFLARE_D1_TOKEN!,
  },
} satisfies Config

export default drizzleConfig
