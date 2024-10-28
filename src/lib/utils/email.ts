import { eq } from "drizzle-orm"
import { users } from "@/lib/utils/schema"
import db from "@/lib/utils/db"

export function verifyEmailInput(email: string): boolean {
  return /^.+@.+\..+$/.test(email) && email.length < 256
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  return (await db.$count(users, eq(users.email, email))) === 0
}
