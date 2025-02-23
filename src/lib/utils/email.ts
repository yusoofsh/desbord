import { eq } from "drizzle-orm"
import { users } from "@/lib/utils/schema"
import db from "@/lib/utils/db"

export function verifyEmailInput(email: string) {
  return /^.+@.+\..+$/.test(email) && email.length < 256
}

export async function checkEmailAvailability(email: string) {
  return (await db.$count(users, eq(users.email, email))) === 0
}
