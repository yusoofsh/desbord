import {
  encodeBase32LowerCaseNoPadding,
  encodeHexLowerCase,
} from "@oslojs/encoding"
import { sha256 } from "@oslojs/crypto/sha2"
import { cookies } from "next/headers"
import { eq, sql } from "drizzle-orm"
import db from "@/lib/utils/db"
import {
  passkeyCredentials,
  securityKeyCredentials,
  sessions,
  totpCredentials,
  users,
} from "@/lib/utils/schema"
import { cache } from "react"
import type {
  Session,
  SessionValidationResult,
  User,
  SessionFlags,
} from "@/lib/utils/definition"

export async function validateSessionToken(
  token: string,
): Promise<SessionValidationResult> {
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
      hasTotp: sql`CASE WHEN ${totpCredentials.id} IS NOT NULL THEN 1 ELSE 0 END`,
      hasPasskey: sql`CASE WHEN ${passkeyCredentials.id} IS NOT NULL THEN 1 ELSE 0 END`,
      hasSecurityKey: sql`CASE WHEN ${securityKeyCredentials.id} IS NOT NULL THEN 1 ELSE 0 END`,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .leftJoin(totpCredentials, eq(sessions.userId, totpCredentials.userId))
    .leftJoin(passkeyCredentials, eq(users.id, passkeyCredentials.userId))
    .leftJoin(
      securityKeyCredentials,
      eq(users.id, securityKeyCredentials.userId),
    )
    .where(eq(sessions.id, sessionId))
    .get()

  if (!result) {
    return { session: null, user: null }
  }

  const session: Session = {
    id: result.sessionId,
    userId: result.userId,
    expiresAt: new Date(result.expiresAt * 1000),
    twoFactorVerified: Boolean(result.twoFactorVerified),
  }

  const user: User = {
    id: result.userId,
    email: result.email,
    username: result.username,
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

  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId)).run()
    return { session: null, user: null }
  }

  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    session.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    await db
      .update(sessions)
      .set({ expiresAt: Math.floor(session.expiresAt.getTime() / 1000) })
      .where(eq(sessions.id, sessionId))
      .run()
  }

  return { session, user }
}

export const getCurrentSession = cache(
  async (): Promise<SessionValidationResult> => {
    const token = (await cookies()).get("session")?.value ?? null
    if (token === null) {
      return { session: null, user: null }
    }

    return validateSessionToken(token)
  },
)

export async function invalidateSession(sessionId: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId)).run()
}

export async function invalidateUserSessions(userId: number): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId)).run()
}

export async function setSessionTokenCookie(
  token: string,
  expiresAt: Date,
): Promise<void> {
  ;(await cookies()).set("session", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  })
}

export async function deleteSessionTokenCookie(): Promise<void> {
  ;(await cookies()).set("session", "", {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  })
}

export function generateSessionToken(): string {
  const tokenBytes = new Uint8Array(20)
  crypto.getRandomValues(tokenBytes)
  const token = encodeBase32LowerCaseNoPadding(tokenBytes)
  return token
}

export async function createSession(
  token: string,
  userId: number,
  flags: SessionFlags,
): Promise<Session> {
  const session: Session = {
    userId,
    id: encodeHexLowerCase(sha256(new TextEncoder().encode(token))),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    twoFactorVerified: flags.twoFactorVerified,
  }

  await db
    .insert(sessions)
    .values({
      id: session.id,
      userId: session.userId,
      expiresAt: Math.floor(session.expiresAt.getTime() / 1000),
      twoFactorVerified: Number(session.twoFactorVerified),
    })
    .run()

  return session
}

export async function setSessionAs2FAVerified(
  sessionId: string,
): Promise<void> {
  await db
    .update(sessions)
    .set({ twoFactorVerified: 1 })
    .where(eq(sessions.id, sessionId))
    .run()
}
