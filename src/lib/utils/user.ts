import { eq, sql } from "drizzle-orm"
import {
  passkeyCredentials,
  securityKeyCredentials,
  totpCredentials,
  users,
} from "@/lib/utils/schema"
import db from "@/lib/utils/db"
import { hashPassword } from "@/lib/utils/password"
import { generateRandomRecoveryCode } from "@/lib/utils/random"
import type { User } from "@/lib/utils/definition"

export function verifyUsernameInput(username: string): boolean {
  return (
    username.length > 3 && username.length < 32 && username.trim() === username
  )
}

export async function createUser(
  username: string,
  email: string,
  password: string,
): Promise<User | undefined> {
  const passwordHash = await hashPassword(password)
  const recoveryCode = generateRandomRecoveryCode()

  const result = await db
    .insert(users)
    .values({
      email: email,
      username: username,
      passwordHash: passwordHash,
      recoveryCode: recoveryCode,
    })
    .returning({ id: users.id })
    .get()

  const user = {
    ...result,
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

// export async function setUserAsEmailVerifiedIfEmailMatches(
//   userId: number,
//   email: string,
// ): Promise<boolean> {
//   const result = await db.run(
//     sql`UPDATE user SET email_verified = 1 WHERE id = ${userId} AND email = ${email}`,
//   )
//   return result.changes > 0
// }

export async function getUserPasswordHash(userId: number): Promise<string> {
  const result = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .get()

  if (result === undefined) {
    throw new Error("Invalid user ID")
  }

  return result.passwordHash
}

export async function getUserRecoverCode(userId: number): Promise<string> {
  const result = await db
    .select({ recoveryCode: users.recoveryCode })
    .from(users)
    .where(eq(users.id, userId))
    .get()

  if (result === undefined) {
    throw new Error("Invalid user ID")
  }

  return result.recoveryCode
}

export async function resetUserRecoveryCode(userId: number): Promise<string> {
  const recoveryCode = generateRandomRecoveryCode()
  await db.run(
    sql`UPDATE user SET recovery_code = ${recoveryCode} WHERE id = ${userId}`,
  )
  return recoveryCode
}

export async function getUserFromEmail(email: string): Promise<User | null> {
  const result = await db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      emailVerified: users.emailVerified,
      hasTotp: totpCredentials.id,
      hasPasskey: passkeyCredentials.id,
      hasSecurityKey: securityKeyCredentials.id,
    })
    .from(users)
    .leftJoin(totpCredentials, eq(users.id, totpCredentials.userId))
    .leftJoin(passkeyCredentials, eq(users.id, passkeyCredentials.userId))
    .leftJoin(
      securityKeyCredentials,
      eq(users.id, securityKeyCredentials.userId),
    )
    .where(eq(users.email, email))
    .get()

  if (result === undefined) {
    return null
  }

  const user: User = {
    ...result,
    emailVerified: Boolean(result.emailVerified),
    registeredTOTP: Boolean(result.hasTotp),
    registeredPasskey: Boolean(result.hasPasskey),
    registeredSecurityKey: Boolean(result.hasSecurityKey),
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
