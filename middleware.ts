import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

// Edge-safe NextAuth instance — reads JWT from cookie, no DB calls.
const { auth } = NextAuth(authConfig)

const PUBLIC_PATHS = ["/", "/models", "/castings", "/marketplace", "/about", "/contact", "/privacy", "/terms", "/search"]
const PUBLIC_PREFIXES = ["/models/", "/castings/", "/search?", "/api/auth", "/api/models", "/api/castings", "/api/marketplace", "/api/contact", "/sw.js", "/manifest"]
const AUTH_ONLY_PATHS = ["/login", "/signup"]

const ROLE_DASHBOARD: Record<string, string> = {
  MODEL: "/dashboard/model",
  AGENCY: "/dashboard/agency",
  CLIENT: "/dashboard/client",
  ADMIN: "/dashboard/admin",
  MARKETPLACE_PROVIDER: "/marketplace",
}

export default auth((req) => {
  const { nextUrl } = req
  const path = nextUrl.pathname
  const isLoggedIn = !!req.auth?.user?.id

  const isPublic =
    PUBLIC_PATHS.includes(path) ||
    PUBLIC_PREFIXES.some((p) => path.startsWith(p))

  const isAuthPath = AUTH_ONLY_PATHS.some((p) => path.startsWith(p))
  const isOnboarding = path.startsWith("/onboarding")

  // Logged-in user visiting login or signup → send to appropriate destination
  if (isLoggedIn && isAuthPath) {
    const user = req.auth!.user as any
    if (!user.onboardingCompleted) {
      return Response.redirect(new URL("/onboarding", nextUrl))
    }
    const dest = ROLE_DASHBOARD[user.role as string] ?? "/"
    return Response.redirect(new URL(dest, nextUrl))
  }

  // Allow public paths through
  if (isPublic) return

  // Logged-in user can always reach onboarding
  if (isOnboarding && isLoggedIn) return

  // Everything else requires auth
  if (!isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl)
    if (!isAuthPath) loginUrl.searchParams.set("callbackUrl", path)
    return Response.redirect(loginUrl)
  }
})

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
    "/(api|trpc)(.*)",
  ],
}
