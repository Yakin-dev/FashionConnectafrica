import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

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
    return Response.redirect(new URL("/onboarding", nextUrl))
  }

  // Allow public paths through
  if (isPublic) return NextResponse.next()

  // Allow forgot-password paths through
  if (isForgotPasswordPath) return NextResponse.next()

  // Allow auth-only paths (login, signup) through for unauthenticated users
  if (isAuthPath) return NextResponse.next()

  // Pricing is always accessible
  if (isPricing) return NextResponse.next()

  // Logged-in user can always reach onboarding
  if (isOnboarding && hasSession) return NextResponse.next()

  // Everything else requires auth
  if (!hasSession) {
    const loginUrl = new URL("/login", nextUrl)
    if (!isAuthPath) loginUrl.searchParams.set("callbackUrl", path)
    return Response.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
    "/(api|trpc)(.*)",
  ],
}
