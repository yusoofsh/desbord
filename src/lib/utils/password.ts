// PBKDF2 Hashing with Web Crypto API
async function hashPasswordPBKDF2(
  password: string,
  salt: Uint8Array,
): Promise<string> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  )

  const key = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000, // Adjust iterations for security
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  )

  return Array.from(new Uint8Array(key))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16)) // 16-byte random salt
  const hashed = await hashPasswordPBKDF2(password, salt)
  const saltHex = Array.from(salt)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return `${saltHex}:${hashed}`
}

export async function verifyPasswordHash(
  storedHash: string,
  password: string,
): Promise<boolean> {
  const [saltHex, hash] = storedHash.split(":")

  if (!saltHex) {
    throw new Error("Invalid stored hash format: salt is missing.")
  }

  const saltMatch = saltHex.match(/.{1,2}/g)
  if (!saltMatch) {
    throw new Error("Failed to parse salt.")
  }

  const salt = new Uint8Array(saltMatch.map((byte) => parseInt(byte, 16)))
  const hashedPassword = await hashPasswordPBKDF2(password, salt)

  return hash === hashedPassword
}

// SHA-1 hashing using Web Crypto API
async function sha1(data: Uint8Array): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-1", data)
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function verifyPasswordStrength(
  password: string,
): Promise<boolean> {
  if (password.length < 8 || password.length > 255) {
    return false
  }

  const sha1Hash = await sha1(new TextEncoder().encode(password))
  const hashPrefix = sha1Hash.slice(0, 5)

  const response = await fetch(
    `https://api.pwnedpasswords.com/range/${hashPrefix}`,
  )
  const data = await response.text()
  const items = data.split("\n")

  for (const item of items) {
    const hashSuffix = item.slice(0, 35).toLowerCase()
    if (sha1Hash === hashPrefix + hashSuffix) {
      return false
    }
  }
  return true
}
