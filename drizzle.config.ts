import { Config } from "drizzle-kit"

const drizzleConfig = {
  dialect: "sqlite",
  schema: "lib/utils/schema.ts",
  out: ".drizzle/migrations",
  migrations: { table: "drizzle_migrations" },
  ...(process.env.NODE_ENV === "development"
    ? {
        dbCredentials: { url: `file:${process.env.LOCAL_DB_PATH!}` },
      }
    : {
        driver: "d1-http",
        dbCredentials: {
          accountId: process.env.CLOUDFLARE_ACCOUNT_ID!,
          databaseId: process.env.CLOUDFLARE_DB_ID!,
          token: process.env.CLOUDFLARE_D1_TOKEN!,
        },
      }),
} satisfies Config

export default drizzleConfig
