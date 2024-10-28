"use server"

import { verifyEmailInput } from "@/lib/utils/server/email"
import { verifyPasswordHash } from "@/lib/utils/server/password"
import { RefillingTokenBucket, Throttler } from "@/lib/utils/server/rate-limit"
import {
  createSession,
  generateSessionToken,
  setSessionTokenCookie,
} from "@/lib/utils/server/session"
import { getUserFromEmail, getUserPasswordHash } from "@/lib/utils/server/user"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { globalPOSTRateLimit } from "@/lib/utils/server/request"

import type { SessionFlags } from "@/lib/utils/server/session"

const throttler = new Throttler<number>([1, 2, 4, 8, 16, 30, 60, 180, 300])
const ipBucket = new RefillingTokenBucket<string>(20, 1)

export async function loginAction(
  _prevState: string | undefined,
  formData: FormData,
): Promise<string> {
  if (!globalPOSTRateLimit()) {
    return "Too many requests"
  }
  const clientIP = (await headers()).get("X-Forwarded-For")
  if (clientIP !== null && !ipBucket.check(clientIP, 1)) {
    return "Too many requests"
  }

  const email = formData.get("email")
  const password = formData.get("password")
  if (typeof email !== "string" || typeof password !== "string") {
    return "Invalid or missing fields"
  }
  if (email === "" || password === "") {
    return "Please enter your email and password."
  }
  if (!verifyEmailInput(email)) {
    return "Invalid email"
  }
  const user = await getUserFromEmail(email)
  if (user === null) {
    return "Account does not exist"
  }

  if (clientIP !== null && !ipBucket.consume(clientIP, 1)) {
    return "Too many requests"
  }
  if (!throttler.consume(user.id)) {
    return "Too many requests"
  }

  const passwordHash = await getUserPasswordHash(user.id)
  const validPassword = await verifyPasswordHash(passwordHash, password)
  if (!validPassword) {
    return "Invalid password"
  }

  throttler.reset(user.id)
  const sessionFlags: SessionFlags = {
    twoFactorVerified: false,
  }

  const sessionToken = generateSessionToken()
  const session = await createSession(sessionToken, user.id, sessionFlags)
  setSessionTokenCookie(sessionToken, session.expiresAt)

  if (!user.emailVerified) {
    return redirect("/verify-email")
  }

  if (!user.registered2FA) {
    return redirect("/2fa/setup")
  }

  return redirect("/2fa")
}
