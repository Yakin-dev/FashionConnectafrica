"use client"

/**
 * Client-side CSRF token management.
 *
 * Reads the `csrf_token` cookie (non-HttpOnly) and attaches it as the
 * `x-csrf-token` header on every POST/PATCH/DELETE fetch call.
 */

const CSRF_COOKIE_NAME = "csrf_token"

/**
 * Read the CSRF token from the document cookie.
 */
export function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${CSRF_COOKIE_NAME}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Fetch wrapper that automatically includes the CSRF token header
 * on mutation requests (POST, PATCH, DELETE).
 *
 * Usage:
 * ```ts
 * import { csrfFetch } from "@/lib/csrf-client"
 *
 * const res = await csrfFetch("/api/models", {
 *   method: "POST",
 *   headers: { "Content-Type": "application/json" },
 *   body: JSON.stringify(data),
 * })
 * ```
 */
export async function csrfFetch(
  url: string | URL | globalThis.Request,
  options: RequestInit = {}
): Promise<Response> {
  const method = (options.method || "GET").toUpperCase()

  // Only add CSRF header for state-changing methods
  if (["POST", "PATCH", "DELETE", "PUT"].includes(method)) {
    const token = getCsrfToken()
    if (token) {
      options.headers = {
        ...options.headers,
        "x-csrf-token": token,
      }
    }
  }

  return fetch(url, options)
}
