import { decodeBase64 } from "@oslojs/encoding"
import { DynamicBuffer } from "@oslojs/binary"

async function getKey() {
  return crypto.subtle.importKey(
    "raw",
    decodeBase64(process.env.ENCRYPTION_KEY ?? ""),
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  )
}

async function encrypt(data: Uint8Array) {
  const iv = crypto.getRandomValues(new Uint8Array(12)) // 12-byte IV for AES-GCM
  const encodedData =
    data instanceof Uint8Array ? data : new TextEncoder().encode(data)

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    await getKey(),
    encodedData,
  )

  const encrypted = new DynamicBuffer(0)
  encrypted.write(iv) // Write the IV first
  encrypted.write(new Uint8Array(encryptedBuffer)) // Write the encrypted data

  return encrypted.bytes()
}

export async function encryptString(data: string) {
  return encrypt(new TextEncoder().encode(data))
}

async function decrypt(encrypted: Uint8Array) {
  if (encrypted.byteLength < 13) {
    throw new Error("Invalid data")
  }

  const iv = encrypted.slice(0, 12) // Extract the 12-byte IV
  const ciphertext = encrypted.slice(12) // Remaining bytes are the ciphertext

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    await getKey(),
    ciphertext,
  )

  return new Uint8Array(decryptedBuffer)
}

export async function decryptToString(data: Uint8Array) {
  const decryptedData = await decrypt(data)
  return new TextDecoder().decode(decryptedData)
}
