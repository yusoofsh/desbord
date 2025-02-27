import {
  users,
  sessions,
  emailVerificationRequests,
  passwordResetSessions,
  totps,
  passkeys,
  securityKeys,
  revenues,
  customers,
  invoices,
  metadata,
} from "./schema"

// User types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert

// Session types
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

// Email verification types
export type EmailVerificationRequest =
  typeof emailVerificationRequests.$inferSelect
export type NewEmailVerificationRequest =
  typeof emailVerificationRequests.$inferInsert

// Password reset types
export type PasswordResetSession = typeof passwordResetSessions.$inferSelect
export type NewPasswordResetSession = typeof passwordResetSessions.$inferInsert

// TOTP types
export type Totp = typeof totps.$inferSelect
export type NewTotp = typeof totps.$inferInsert

// Passkey types
export type Passkey = typeof passkeys.$inferSelect
export type NewPasskey = typeof passkeys.$inferInsert

// Security key types
export type SecurityKey = typeof securityKeys.$inferSelect
export type NewSecurityKey = typeof securityKeys.$inferInsert

// Revenue types
export type Revenue = typeof revenues.$inferSelect
export type NewRevenue = typeof revenues.$inferInsert

// Customer types
export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert

// Invoice types
export type Invoice = typeof invoices.$inferSelect
export type NewInvoice = typeof invoices.$inferInsert

// Metadata types
export type Metadata = typeof metadata.$inferSelect
export type NewMetadata = typeof metadata.$inferInsert
