import { eq } from "drizzle-orm"
import { users } from "@/lib/utils/server/schema"
import db from "./db"

export function verifyEmailInput(email: string): boolean {
  return /^.+@.+\..+$/.test(email) && email.length < 256
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
  return (await db.$count(users, eq(users.email, email))) === 0
}
