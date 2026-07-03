import { getSessionUser as getCurrentUser, getCurrentAppUser } from "@/lib/session"

/**
 * Returns the full Prisma User record for the currently authenticated user,
 * or null if unauthenticated.
 *
 * This is the primary auth function — use it in API routes and server components.
 * Replaces the old `auth()` from NextAuth.
 */
export { getCurrentUser }

/**
 * Re-exported for convenience with the most common name.
 * Both `getCurrentUser` and `getCurrentAppUser` do the same thing.
 */
export { getCurrentAppUser }
