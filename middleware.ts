import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Public routes that don't require authentication.
 * All other routes are protected by Clerk.
 * NOTE: /api/auth/redirect is PUBLIC so Clerk can land here after OAuth
 * before the session cookie is fully set on the client.
 */
const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/privacy(.*)",
  "/terms(.*)",
  "/search(.*)",
  "/marketplace(.*)",
  "/castings(.*)",
  "/models(.*)",
  "/api/auth/redirect(.*)",
  "/api/models(.*)",
  "/api/castings(.*)",
  "/api/marketplace(.*)",
  "/api/contact(.*)",
  "/manifest.webmanifest(.*)",
  "/sw.js",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
