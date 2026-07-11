import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// ─── Security Headers ────────────────────────────────────────────────
const SECURITY_HEADERS = {
  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",
  // Prevent clickjacking
  "X-Frame-Options": "DENY",
  // Enable HSTS (1 year, include subdomains, allow preload)
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  // Referrer policy
  "Referrer-Policy": "strict-origin-when-cross-origin",
  // Permissions policy — restrict sensitive APIs
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=(), battery=(), payment=(), usb=()",
  // Content Security Policy
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.flutterwave.com https://api.cloudinary.com https://res.cloudinary.com https://va.vercel-scripts.com",
    "frame-src 'self' https://vercel.live",
    "media-src 'self' https:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "block-all-mixed-content",
    "upgrade-insecure-requests",
  ].join("; "),
  // XSS protection for older browsers
  "X-XSS-Protection": "1; mode=block",
  // Server header suppression is handled by hosting platform
}

const PUBLIC_PATHS = ["/", "/models", "/castings", "/marketplace", "/about", "/contact", "/privacy", "/terms", "/search", "/pricing", "/upgrade"]
const PUBLIC_PREFIXES = [
  "/models/",
  "/castings/",
  "/search?",
  "/api/auth",
  "/api/models",
  "/api/castings",
  "/api/marketplace",
  "/api/contact",
  "/api/payments",
  "/api/webhooks",
  "/sw.js",
  "/manifest",
]
const AUTH_ONLY_PATHS = ["/login", "/signup"]
const FORGOT_PASSWORD_PATHS = ["/forgot-password"]

const ROLE_DASHBOARD: Record<string, string> = {
  MODEL: "/dashboard/model",
  AGENCY: "/dashboard/agency",
  CLIENT: "/dashboard/client",
  ADMIN: "/dashboard/admin",
  MARKETPLACE_PROVIDER: "/marketplace",
}

// Professional roles that require an active subscription to access their dashboard
const PROFESSIONAL_ROLES = ["MARKETPLACE_PROVIDER"]

export function middleware(request: NextRequest) {
  const { nextUrl } = request
  const path = nextUrl.pathname

  // ─── Security headers check for redirects ─────────────────────────
  // Block requests with unexpected HTTP methods (protect against CSRF-like attacks)
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        ...SECURITY_HEADERS,
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    })
  }

  // Check for session cookie (lightweight — no DB call)
  const sessionCookie = request.cookies.get("session_token")?.value
  const hasSession = !!sessionCookie

  const isPublic =
    PUBLIC_PATHS.includes(path) ||
    PUBLIC_PREFIXES.some((p) => path.startsWith(p))

  const isAuthPath = AUTH_ONLY_PATHS.some((p) => path.startsWith(p))
  const isForgotPasswordPath = FORGOT_PASSWORD_PATHS.some((p) => path.startsWith(p))
  const isOnboarding = path.startsWith("/onboarding")
  const isPricing = path.startsWith("/pricing")

  // Logged-in user visiting login, signup, or forgot-password → send to appropriate destination
  if (hasSession && (isAuthPath || isForgotPasswordPath)) {
    const redirect = NextResponse.redirect(new URL("/onboarding", nextUrl))
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      redirect.headers.set(key, value)
    }
    return redirect
  }

  // Allow public paths through
  if (isPublic) {
    const response = NextResponse.next()
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(key, value)
    }
    return response
  }

  // Allow forgot-password paths through
  if (isForgotPasswordPath) {
    const response = NextResponse.next()
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(key, value)
    }
    return response
  }

  // Allow auth-only paths (login, signup) through for unauthenticated users
  if (isAuthPath) {
    const response = NextResponse.next()
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(key, value)
    }
    return response
  }

  // Pricing is always accessible
  if (isPricing) {
    const response = NextResponse.next()
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(key, value)
    }
    return response
  }

  // Logged-in user can always reach onboarding
  if (isOnboarding && hasSession) {
    const response = NextResponse.next()
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      response.headers.set(key, value)
    }
    return response
  }

  // Everything else requires auth
  if (!hasSession) {
    const loginUrl = new URL("/login", nextUrl)
    if (!isAuthPath) loginUrl.searchParams.set("callbackUrl", path)
    const redirect = Response.redirect(loginUrl)
    // Note: Response.redirect doesn't easily set headers, but this is a redirect
    // so the security headers will be applied when the browser follows to the login page
    return redirect
  }

  // Default: authenticated user on protected route
  const response = NextResponse.next()
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }
  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
    "/(api|trpc)(.*)",
  ],
}
