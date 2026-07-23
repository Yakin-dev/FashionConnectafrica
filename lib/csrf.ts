/**
 * CSRF (Cross-Site Request Forgery) protection using the double-submit cookie pattern.
 *
 * How it works:
 * 1. A cryptographically-random CSRF token is stored in a non-HttpOnly cookie
 *    (so client-side JS can read it) AND in a server-side session store.
 * 2. The client reads the token from the cookie and sends it as an
 *    `x-csrf-token` header on every POST/PATCH/DELETE request.
 * 3. The server validates that the header value matches the cookie value.
 *
 * This works because:
 * - A malicious site cannot read the cookie's value (cross-origin JS can't
 *   read cookies from another origin).
 * - The `x-csrf-token` header must be explicitly set, which a cross-origin
 *   form/request cannot do without JavaScript reading the cookie first.
 *
 * Combined with `SameSite=Strict` on the session cookie, this provides
 * defense-in-depth against CSRF attacks.
 */

import { cookies } from "next/headers"
import crypto from "crypto"

export const CSRF_COOKIE_NAME = "csrf_token"
const CSRF_TOKEN_LENGTH = 32 // bytes
const CSRF_MAX_AGE_SECONDS = 7 * 24 * 60 * 60 // 7 days (same as session)

/**
 * Generate a cryptographically-random CSRF token.
 */
function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString("hex")
}

/**
 * Get the CSRF token from the cookie.
 * Returns null if the cookie doesn't exist or is invalid.
 */
export async function getCsrfTokenFromCookie(): Promise<string | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(CSRF_COOKIE_NAME)?.value
  return token && token.length === CSRF_TOKEN_LENGTH * 2 ? token : null
}

/**
 * Ensure a CSRF token exists in the cookie.
 * If one exists, return it. If not, generate and set a new one.
 */
export async function ensureCsrfToken(): Promise<string> {
  const existing = await getCsrfTokenFromCookie()
  if (existing) return existing

  const token = generateCsrfToken()
  const cookieStore = await cookies()
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,       // Client-side JS needs to read it
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",    // Still same-site to prevent CSRF in older browsers
    path: "/",
    maxAge: CSRF_MAX_AGE_SECONDS,
  })
  return token
}

/**
 * Validate that the CSRF token from the request header matches the cookie.
 *
 * @param tokenFromHeader - The CSRF token from the `x-csrf-token` request header
 * @returns `true` if the token is valid, `false` otherwise
 */
export async function validateCsrfToken(tokenFromHeader: string | null): Promise<boolean> {
  if (!tokenFromHeader) return false

  const cookieToken = await getCsrfTokenFromCookie()
  if (!cookieToken) return false

  // Constant-time comparison to prevent timing attacks
  if (tokenFromHeader.length !== cookieToken.length) return false

  return crypto.timingSafeEqual(
    Buffer.from(tokenFromHeader),
    Buffer.from(cookieToken)
  )
}

/**
 * List of API route prefixes that are exempt from CSRF protection.
 * Auth endpoints use their own CSRF token flow (login/signup need the token
 * endpoint to be accessible without one).
 * Webhooks are called by third-party services and have their own signature verification.
 */
export const CSRF_EXEMPT_PATHS = [
  "/api/auth/login",
  "/api/auth/signup",
  "/api/auth/logout",
  "/api/auth/csrf",
  "/api/webhooks",
  "/api/health",
]

/**
 * Check if a given path is exempt from CSRF validation.
 */
export function isCsrfExempt(path: string): boolean {
  return CSRF_EXEMPT_PATHS.some((exempt) => path.startsWith(exempt))
}
