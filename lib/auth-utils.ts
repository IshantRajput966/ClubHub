import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_for_dev_only"
const secretKey = new TextEncoder().encode(JWT_SECRET)

export interface AuthSession {
  username: string
  role: string
}

export async function signToken(payload: AuthSession) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h") // Set token to expire in 24 hours
    .sign(secretKey)
}

export async function verifyToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey)
    return payload as unknown as AuthSession
  } catch (error) {
    return null
  }
}

/**
 * Retrieves the current user's session from the HttpOnly cookie.
 * Use this in API routes to verifiably check who is making the request.
 */
export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return null
  }

  return await verifyToken(token)
}