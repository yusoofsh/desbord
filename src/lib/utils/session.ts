import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding"
import { sha256 } from "@oslojs/crypto/sha2"
import { cookies } from "next/headers"
import { eq } from "drizzle-orm"
import db from "@/lib/utils/db"
import {
  passkeys,
  securityKeys,
  sessions,
  totps,
  users,
} from "@/lib/utils/schema"
import { cache } from "react"

export async function validateSessionToken(token: string) {
  const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)))

  const result = await db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      twoFactorVerified: sessions.twoFactorVerified,
      userId: users.id,
      email: users.email,
      username: users.username,
      emailVerified: users.emailVerified,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .leftJoin(totps, eq(sessions.userId, totps.userId))
    .leftJoin(passkeys, eq(users.id, passkeys.userId))
    .leftJoin(securityKeys, eq(users.id, securityKeys.userId))
    .where(eq(sessions.id, sessionId))
    .get()

  if (!result) return null

  let expiresAt = new Date(result.expiresAt * 1000)

  if (Date.now() >= expiresAt.getTime()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId)).run()
    return null
  }

  if (Date.now() >= expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    await db
      .update(sessions)
      .set({ expiresAt: Math.floor(expiresAt.getTime() / 1000) })
      .where(eq(sessions.id, sessionId))
      .run()
  }

  return { ...result, expiresAt }
}

export const getCurrentSession = cache(async () => {
  const token = (await cookies()).get("session")?.value ?? null

  if (!token) return null

  return validateSessionToken(token)
})

export async function invalidateSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId)).run()
}

export async function invalidateUserSessions(userId: number) {
  await db.delete(sessions).where(eq(sessions.userId, userId)).run()
}

export async function setSessionTokenCookie(token: string, expiresAt: Date) {
  ;(await cookies()).set("session", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  })
}

export async function deleteSessionTokenCookie() {
  ;(await cookies()).set("session", "", {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  })
}

export function generateSessionToken() {
  const tokenBytes = new Uint8Array(20)
  crypto.getRandomValues(tokenBytes)
  const token = encodeBase32LowerCaseNoPadding(tokenBytes)
  return token
}

export async function createSession(token: string, userId: number) {
  const session = {
    userId,
    id: encodeHexLowerCase(sha256(new TextEncoder().encode(token))),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
  }

  await db
    .insert(sessions)
    .values({
      id: session.id,
      userId: session.userId,
      expiresAt: Math.floor(session.expiresAt.getTime() / 1000),
    })
    .run()

  return session
}

export async function setSessionAs2FAVerified(sessionId: string) {
  await db
    .update(sessions)
    .set({ twoFactorVerified: true })
    .where(eq(sessions.id, sessionId))
    .run()
}
