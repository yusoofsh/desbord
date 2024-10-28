import {
  sqliteTable,
  integer,
  text,
  blob,
  uniqueIndex,
} from "drizzle-orm/sqlite-core"

// Users table
export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey().notNull(),
    email: text("email").notNull(),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull(),
    emailVerified: integer("email_verified").notNull().default(0),
    recoveryCode: blob("recovery_code").notNull(),
  },
  (user) => ({
    emailIndex: uniqueIndex("email_index").on(user.email),
  }),
)

// Sessions table
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull(),
  twoFactorVerified: integer("two_factor_verified").notNull().default(0),
})

// Email Verification Requests table
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

// Password Reset Sessions table
export const passwordResetSessions = sqliteTable("password_reset_sessions", {
  id: text("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: integer("expires_at").notNull(),
  emailVerified: integer("email_verified").notNull().default(0),
  twoFactorVerified: integer("two_factor_verified").notNull().default(0),
})

// TOTP Credentials table
export const totpCredentials = sqliteTable("totp_credentials", {
  id: integer("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id),
  key: blob("key").notNull(),
})

// Passkey Credentials table
export const passkeyCredentials = sqliteTable("passkey_credentials", {
  id: blob("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  algorithm: integer("algorithm").notNull(),
  publicKey: blob("public_key").notNull(),
})

// Security Key Credentials table
export const securityKeyCredentials = sqliteTable("security_key_credentials", {
  id: blob("id").primaryKey().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  algorithm: integer("algorithm").notNull(),
  publicKey: blob("public_key").notNull(),
})
