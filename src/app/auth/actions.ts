"use server"

import { checkEmailAvailability, verifyEmailInput } from "@/lib/utils/email"
import {
  verifyPasswordHash,
  verifyPasswordStrength,
} from "@/lib/utils/password"
import {
  createSession,
  deleteSessionTokenCookie,
  generateSessionToken,
  getCurrentSession,
  invalidateSession,
  setSessionTokenCookie,
} from "@/lib/utils/session"
import {
  createUser,
  getUserFromEmail,
  getUserPasswordHash,
  verifyUsernameInput,
} from "@/lib/utils/user"
import { redirect } from "next/navigation"

export async function signinAction(
  _prevState: string | undefined,
  formData: FormData,
) {
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
  if (!user) {
    return "Account does not exist"
  }

  const passwordHash = await getUserPasswordHash(user.id)
  const validPassword = await verifyPasswordHash(passwordHash, password)
  if (!validPassword) {
    return "Invalid password"
  }

  const sessionToken = generateSessionToken()
  const session = await createSession(sessionToken, user.id)
  await setSessionTokenCookie(sessionToken, session.expiresAt)

  return redirect("/home")
}

export async function signupAction(
  _prevState: string | undefined,
  formData: FormData,
) {
  const email = formData.get("email")
  const username = formData.get("username")
  const password = formData.get("password")

  if (
    typeof email !== "string" ||
    typeof username !== "string" ||
    typeof password !== "string"
  ) {
    return "Invalid or missing fields"
  }

  if (email === "" || password === "" || username === "") {
    return "Please enter your username, email, and password"
  }

  if (!verifyEmailInput(email)) {
    return "Invalid email"
  }

  const emailAvailable = checkEmailAvailability(email)
  if (!emailAvailable) {
    return "Email is already used"
  }

  if (!verifyUsernameInput(username)) {
    return "Invalid username"
  }

  const strongPassword = await verifyPasswordStrength(password)
  if (!strongPassword) {
    return "Weak password"
  }

  const user = await createUser(username, email, password)
  if (!user.id) {
    return "Something went wrong"
  }

  const sessionToken = generateSessionToken()
  const session = await createSession(sessionToken, user.id)
  await setSessionTokenCookie(sessionToken, session.expiresAt)

  return redirect("/home")
}

export async function signoutAction() {
  const session = await getCurrentSession()
  if (!session) return "Not authenticated"

  await invalidateSession(session.sessionId)
  await deleteSessionTokenCookie()

  return redirect("/auth?mode=signin")
}
