/**
 * Lightweight in-memory rate limiter for API protection.
 *
 * WARNING: This is in-memory only and resets on server restart.
 * For production with multiple instances, replace with a Redis-based
 * solution (e.g., @upstash/ratelimit or similar).
 *
 * Design:
 * - Sliding window per IP + endpoint combination
 * - Configurable limits per route type
 * - Automatic cleanup of expired entries every 60 seconds
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()
const CLEANUP_INTERVAL = 60_000 // 1 minute

// Periodic cleanup to prevent memory leaks
let lastCleanup = Date.now()
function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}

export interface RateLimitConfig {
  /** Maximum requests allowed within the window */
  maxRequests: number
  /** Window duration in seconds */
  windowSeconds: number
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  // Auth endpoints: strict limits
  "auth:login": { maxRequests: 10, windowSeconds: 300 },    // 10 attempts per 5 min
  "auth:signup": { maxRequests: 5, windowSeconds: 3600 },    // 5 signups per hour
  "auth:forgot": { maxRequests: 3, windowSeconds: 3600 },    // 3 password resets per hour

  // Payment endpoints: moderate limits
  "payment:create": { maxRequests: 20, windowSeconds: 300 },  // 20 payment initiations per 5 min
  "payment:verify": { maxRequests: 30, windowSeconds: 300 },  // 30 verification checks per 5 min

  // Contact form: prevent spam
  "contact:submit": { maxRequests: 5, windowSeconds: 3600 },  // 5 submissions per hour

  // General API: default
  "default": { maxRequests: 60, windowSeconds: 60 },          // 60 requests per minute
}

/**
 * Get the rate limit config for a given route.
 */
function getConfig(route: string): RateLimitConfig {
  for (const [pattern, config] of Object.entries(DEFAULT_CONFIGS)) {
    if (route.includes(pattern)) {
      return config
    }
  }
  return DEFAULT_CONFIGS.default
}

/**
 * Check if a request is rate-limited.
 *
 * @param ip - The client IP address
 * @param route - A route identifier (e.g., "auth:login" or "payment:create")
 * @returns Object with `allowed` boolean and `remaining` count
 */
export function checkRateLimit(ip: string, route: string): {
  allowed: boolean
  remaining: number
  resetAt: number
} {
  cleanup()

  const config = getConfig(route)
  const key = `${ip}:${route}`
  const now = Date.now()

  const existing = store.get(key)

  // First request or window expired
  if (!existing || now > existing.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + config.windowSeconds * 1000,
    })
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowSeconds * 1000 }
  }

  // Within window — increment
  existing.count += 1

  if (existing.count > config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  return { allowed: true, remaining: config.maxRequests - existing.count, resetAt: existing.resetAt }
}

/**
 * Extract client IP from the request, respecting proxy headers.
 */
export function getClientIp(request: Request | { headers: Headers | Record<string, string> }): string {
  const headers = request.headers

  // Cloudflare / Vercel / common proxies
  const cfIp = headers instanceof Headers
    ? headers.get("cf-connecting-ip")
    : (headers as Record<string, string>)["cf-connecting-ip"]
  if (cfIp) return cfIp

  const xForwarded = headers instanceof Headers
    ? headers.get("x-forwarded-for")
    : (headers as Record<string, string>)["x-forwarded-for"]
  if (xForwarded) return xForwarded.split(",")[0].trim()

  const realIp = headers instanceof Headers
    ? headers.get("x-real-ip")
    : (headers as Record<string, string>)["x-real-ip"]
  if (realIp) return realIp

  return "127.0.0.1"
}
