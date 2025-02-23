import { encodeBase32UpperCaseNoPadding } from "@oslojs/encoding"

export function generateRandomOTP() {
  const bytes = new Uint8Array(5)
  crypto.getRandomValues(bytes)
  return encodeBase32UpperCaseNoPadding(bytes)
}

export function generateRandomRecoveryCode() {
  const recoveryCodeBytes = new Uint8Array(10)
  crypto.getRandomValues(recoveryCodeBytes)
  return encodeBase32UpperCaseNoPadding(recoveryCodeBytes)
}
