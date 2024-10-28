import { sql } from "drizzle-orm"
import db from "./db"
import { decryptToString, encryptString } from "./encryption"
import { hashPassword } from "./password"
import { generateRandomRecoveryCode } from "./random"
import { users } from "@/lib/utils/server/schema"

export function verifyUsernameInput(username: string): boolean {
  return (
    username.length > 3 && username.length < 32 && username.trim() === username
  )
}

export async function createUser(
  username: string,
  email: string,
  password: string,
): Promise<User> {
  const passwordHash = await hashPassword(password)
  const recoveryCode = generateRandomRecoveryCode()
  const encryptedRecoveryCode = await encryptString(recoveryCode)
  const result = await db
    .insert(users)
    .values({
      email: email,
      username: username,
      passwordHash: passwordHash,
      recoveryCode: encryptedRecoveryCode,
    })
    .returning({ id: users.id })
    .execute()
  if (result === null) {
    throw new Error("Unexpected error")
  }
  const user: User = {
    id: row.number(0),
    username,
    email,
    emailVerified: false,
    registeredTOTP: false,
    registeredPasskey: false,
    registeredSecurityKey: false,
    registered2FA: false,
  }
  return user
}

export async function updateUserPassword(
  userId: number,
  password: string,
): Promise<void> {
  const passwordHash = await hashPassword(password)
  await db.run(
    sql`UPDATE user SET password_hash = ${passwordHash} WHERE id = ${userId}`,
  )
}

export async function updateUserEmailAndSetEmailAsVerified(
  userId: number,
  email: string,
): Promise<void> {
  await db.run(
    sql`UPDATE user SET email = ${email}, email_verified = 1 WHERE id = ${userId}`,
  )
}

export async function setUserAsEmailVerifiedIfEmailMatches(
  userId: number,
  email: string,
): Promise<boolean> {
  const result = await db.run(
    sql`UPDATE user SET email_verified = 1 WHERE id = ${userId} AND email = ${email}`,
  )
  return result.changes > 0
}

export async function getUserPasswordHash(userId: number): Promise<string> {
  const row = await db.run(
    sql`SELECT password_hash FROM user WHERE id = ${userId}`,
  )
  if (row === null) {
    throw new Error("Invalid user ID")
  }
  return row.string(0)
}

export async function getUserRecoverCode(userId: number): Promise<string> {
  const row = await db.run(
    sql`SELECT recovery_code FROM user WHERE id = ${userId}`,
  )
  if (row === null) {
    throw new Error("Invalid user ID")
  }
  return decryptToString(row.bytes(0))
}

export async function resetUserRecoveryCode(userId: number): Promise<string> {
  const recoveryCode = generateRandomRecoveryCode()
  const encrypted = encryptString(recoveryCode)
  await db.run(
    sql`UPDATE user SET recovery_code = ${encrypted} WHERE id = ${userId}`,
  )
  return recoveryCode
}

export async function getUserFromEmail(email: string): Promise<User | null> {
  const row = await db.run(
    sql`
      SELECT users.id, users.email, users.username, users.email_verified, IIF(totp_credentials.id IS NOT NULL, 1, 0), IIF(passkey_credentials.id IS NOT NULL, 1, 0), IIF(security_key_credentials.id IS NOT NULL, 1, 0) FROM users
      LEFT JOIN totp_credentials ON users.id = totp_credentials.user_id
      LEFT JOIN passkey_credentials ON users.id = passkey_credentials.user_id
      LEFT JOIN security_key_credentials ON users.id = security_key_credentials.user_id
      WHERE users.email = ${email}
    `,
  )
  if (row === null) {
    return null
  }
  const user: User = {
    id: row.number(0),
    email: row.string(1),
    username: row.string(2),
    emailVerified: Boolean(row.number(3)),
    registeredTOTP: Boolean(row.number(4)),
    registeredPasskey: Boolean(row.number(5)),
    registeredSecurityKey: Boolean(row.number(6)),
    registered2FA: false,
  }
  if (
    user.registeredPasskey ||
    user.registeredSecurityKey ||
    user.registeredTOTP
  ) {
    user.registered2FA = true
  }
  return user
}

export interface User {
  id: number
  email: string
  username: string
  emailVerified: boolean
  registeredTOTP: boolean
  registeredSecurityKey: boolean
  registeredPasskey: boolean
  registered2FA: boolean
}
