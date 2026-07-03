import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"
import crypto from "crypto"

const SESSION_COOKIE_NAME = "session_token"
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60 // 7 days

/**
 * Generate a cryptographically secure random session token.
 */
function generateSessionToken(): string {
  return crypto.randomBytes(48).toString("hex")
}

/**
 * Hash a session token for storage in the database.
 * We never store the raw token — only its hash.
 */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

/**
 * Create a new session for a user.
 * Stores only the token hash in the database.
 * Sets an HTTP-only cookie with the raw token.
 */
export async function createSession(userId: string): Promise<string> {
  const token = generateSessionToken()
  const tokenHash = hashToken(token)

  // Delete expired sessions for this user first
  await prisma.session.deleteMany({
    where: {
      userId,
      expiresAt: { lt: new Date() },
    },
  })

  // Create new session
  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
    },
  })

  // Set the HTTP-only cookie
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  })

  return token
}

/**
 * Get the current session user from the database.
 * Returns the full Prisma User record, or null if not authenticated.
 * Automatically cleans up expired sessions.
 */
export async function getSessionUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!token) return null

  const tokenHash = hashToken(token)

  // Clean expired sessions
  await prisma.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })

  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!session) return null

  // Check if session has expired
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: session.id } })
    return null
  }

  return session.user
}

/**
 * Destroy the current session.
 * Removes the session from the database and clears the cookie.
 */
export async function destroySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (token) {
    const tokenHash = hashToken(token)
    await prisma.session.deleteMany({
      where: { tokenHash },
    })
  }

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

/**
 * Get the current authenticated user with role-specific includes.
 * Shorthand for getSessionUser with a consistent name.
 */
export { getSessionUser as getCurrentAppUser }
