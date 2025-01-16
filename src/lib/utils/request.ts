import { RefillingTokenBucket } from "@/lib/utils/rate-limit"
import { headers } from "next/headers"

export const globalBucket = new RefillingTokenBucket<string>(100, 1)

export async function globalGETRateLimit(): Promise<boolean> {
  const clientIP = (await headers()).get("X-Forwarded-For")
  if (clientIP === null) {
    return true
  }

  return globalBucket.consume(clientIP, 1)
}

export async function globalPOSTRateLimit(): Promise<boolean> {
  const clientIP = (await headers()).get("X-Forwarded-For")
  if (clientIP === null) {
    return true
  }

  return globalBucket.consume(clientIP, 3)
}
