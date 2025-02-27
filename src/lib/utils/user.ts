import { and, eq } from "drizzle-orm"
import { passkeys, securityKeys, totps, users } from "@/lib/utils/schema"
import db from "@/lib/utils/db"
import { hashPassword } from "@/lib/utils/password"
import { generateRandomRecoveryCode } from "@/lib/utils/random"

export function verifyUsernameInput(username: string) {
  return (
    username.length > 3 && username.length < 32 && username.trim() === username
  )
}

export async function createUser(
  username: string,
  email: string,
  password: string,
) {
  const passwordHash = await hashPassword(password)
  const recoveryCode = generateRandomRecoveryCode()

  return db
    .insert(users)
    .values({
      email,
      username,
      passwordHash,
      recoveryCode,
    })
    .returning({ id: users.id })
    .get()
}

export async function updateUserPassword(userId: number, password: string) {
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(password) })
    .where(eq(users.id, userId))
}

export async function updateUserEmailAndSetEmailAsVerified(
  userId: number,
  email: string,
) {
  await db
    .update(users)
    .set({ email, emailVerified: true })
    .where(eq(users.id, userId))
}

export async function setUserAsEmailVerifiedIfEmailMatches(
  userId: number,
  email: string,
) {
  await db
    .update(users)
    .set({ emailVerified: true })
    .where(and(eq(users.id, userId), eq(users.email, email)))
}

export async function getUserPasswordHash(userId: number) {
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

export async function getUserRecoverCode(userId: number) {
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

export async function resetUserRecoveryCode(userId: number) {
  const recoveryCode = generateRandomRecoveryCode()
  await db.update(users).set({ recoveryCode }).where(eq(users.id, userId))
  return recoveryCode
}

export async function getUserFromEmail(email: string) {
  return db
    .select({
      id: users.id,
      email: users.email,
      username: users.username,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .leftJoin(totps, eq(users.id, totps.userId))
    .leftJoin(passkeys, eq(users.id, passkeys.userId))
    .leftJoin(securityKeys, eq(users.id, securityKeys.userId))
    .where(eq(users.email, email))
    .get()
}
