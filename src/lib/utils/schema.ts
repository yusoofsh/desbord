import {
  sqliteTable,
  integer,
  text,
  blob,
  uniqueIndex,
} from "drizzle-orm/sqlite-core"

export const users = sqliteTable(
  "users",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    emailVerified: integer("email_verified", { mode: "boolean" })
      .notNull()
      .default(false),
    recoveryCode: text("recovery_code").notNull(),
  },
  (user) => [uniqueIndex("email_index").on(user.email)],
)

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull(),
  twoFactorVerified: integer("two_factor_verified", { mode: "boolean" })
    .notNull()
    .default(false),
})

export const emailVerificationRequests = sqliteTable(
  "email_verification_requests",
  {
    id: text("id").primaryKey().notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    email: text("email").notNull(),
    code: text("code").notNull(),
    expiresAt: integer("expires_at").notNull(),
  },
)

export const passwordResetSessions = sqliteTable("password_reset_sessions", {
  id: text("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: integer("expires_at").notNull(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .notNull()
    .default(false),
  twoFactorVerified: integer("two_factor_verified", { mode: "boolean" })
    .notNull()
    .default(false),
})

export const totps = sqliteTable("totps", {
  id: integer("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  key: blob("key").notNull(),
})

export const passkeys = sqliteTable("passkeys", {
  id: blob("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  algorithm: integer("algorithm").notNull(),
  publicKey: blob("public_key").notNull(),
})

export const securityKeys = sqliteTable("security_keys", {
  id: blob("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  algorithm: integer("algorithm").notNull(),
  publicKey: blob("public_key").notNull(),
})

export const revenues = sqliteTable("revenues", {
  month: text("month").notNull(),
  revenue: integer("revenue").notNull(),
})

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  imageUrl: text("image_url").notNull(),
})

export const invoices = sqliteTable("invoices", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id),
  amount: integer("amount").notNull(),
  status: text("status").notNull(),
  date: text("date").notNull(),
})

export const metadata = sqliteTable("metadata", {
  key: text("key").primaryKey().notNull(),
  value: text("value").notNull(),
  description: text("description"),
})
