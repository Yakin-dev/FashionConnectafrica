import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

/**
 * Returns the full Prisma User record for the currently authenticated user,
 * or null if unauthenticated.
 */
export async function getCurrentUser() {
  try {
    const session = await auth()
    if (!session?.user?.id) return null

    return prisma.user.findUnique({
      where: { id: session.user.id },
    })
  } catch {
    return null
  }
}

/**
 * Returns the session user object (lightweight — from JWT, no DB round-trip).
 */
export async function getSessionUser() {
  const session = await auth()
  return session?.user ?? null
}
