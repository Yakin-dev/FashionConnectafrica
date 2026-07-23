# FashionConnect.Africa — Implementation Roadmap

> ⚠️ **CRITICAL — AUTH STATE (read before continuing):**
> Clerk is **fully removed**. The app uses **NextAuth v5 (Auth.js)** with:
> - Credentials provider (email + password + bcrypt)
> - JWT sessions (no Prisma adapter, no database sessions)
> - Custom `auth.config.ts`, `auth.ts`, `middleware.ts`, `lib/auth.ts`
>
> **If you see `@clerk/nextjs`, `ClerkProvider`, `auth()` from Clerk, or `clerkUserId` — those are dead references that need removal.**
> The auth migration (Phase 15) is still **in progress** — signup, login, and many API routes still need updating.
>
> Full audit completed. 6 of 11 enterprise phases implemented.

---

## ✅ PHASE 0 — Database Connection (COMPLETE)
- [x] Prisma v7 schema — NO `url` in datasource block
- [x] `prisma.config.ts` — DIRECT_DATABASE_URL for migrations
- [x] `lib/prisma.ts` — PrismaPg adapter (Prisma v7 requirement)
- [x] `npx prisma generate` + `npx prisma db push` — schema synced to Neon
- [x] `npx tsx scripts/check-db.ts` — confirmed connected

---

## ✅ PHASE 1 — Foundation: SEO + Security Headers (COMPLETE)
- [x] `app/robots.ts` — allow public pages, disallow private areas, block AI crawlers
- [x] `app/sitemap.ts` — dynamic sitemap with static + model + agency + casting pages
- [x] `lib/seo.ts` — centralized metadata helpers, JSON-LD schema generators
- [x] `middleware.ts` — enterprise security headers (CSP, HSTS, X-Frame, Permissions-Policy, etc.)
- [x] OPTIONS handler with CORS headers

---

## ✅ PHASE 2 — Dynamic Metadata (COMPLETE)
- [x] Root layout uses `defaultMetadata` from `lib/seo.ts`
- [x] Static pages (Privacy, Terms, Pricing, Forgot-Password) have proper metadata
- [x] Model detail page: server wrapper with `generateMetadata` + client component
- [x] Agency detail page: server wrapper with `generateMetadata` + client component
- [x] All listing pages use `buildListingMetadata()`

---

## ✅ PHASE 3 — Schema.org JSON-LD (COMPLETE)
- [x] `organizationSchema()` + `websiteSchema()` in root layout
- [x] `personSchema()` on model detail pages
- [x] `localBusinessSchema()` on agency detail pages
- [x] `breadcrumbSchema()` on all detail pages
- [x] `imageObjectSchema()` for portfolio images
- [x] `collectionPageSchema()` for listing pages

---

## ✅ PHASE 4 — Security Hardening (COMPLETE)
- [x] `lib/rate-limit.ts` — in-memory rate limiter
- [x] Rate limiting on auth endpoints (login, signup)
- [x] Rate limiting on payment endpoints (create, verify)
- [x] Rate limiting on contact endpoint
- [x] `sameSite: "strict"` on session cookie (was `"lax"`)
- [x] File upload magic byte validation (JPEG, PNG, GIF, WebP)
- [x] File upload size limits enforced server-side

---

## ✅ PHASE 5 — Image SEO (COMPLETE)
- [x] `lib/images.ts` — cloudinary blur placeholders, alt text generators, shimmer fallback
- [x] `imageObjectSchema()` in `lib/seo.ts` — ImageObject JSON-LD for portfolio
- [x] ModelCard: blur placeholders, descriptive alt text, proper `sizes` attribute
- [x] Model detail page: ImageObject schema, blur placeholders on hero + gallery + lightbox
- [x] Agency detail page: better alt text for logo and model images

---

## ✅ PHASE 6 — URL Slugs (COMPLETE)
- [x] `lib/slug.ts` — `toSlug()`, `makeUniqueSlug()`, `modelSlug()`, `agencySlug()`
- [x] `lib/db-helpers.ts` — `findModelWithIncludes()`, `findAgencyByIdOrSlug()` etc.
- [x] `prisma/schema.prisma` — added `slug String? @unique` to Model + Agency
- [x] Model creation auto-generates slug (`app/api/models/route.ts`)
- [x] Agency creation auto-generates slug (`app/api/onboarding/route.ts`)
- [x] API routes support slug lookups (`app/api/models/[id]`, `app/api/agencies/[id]`)
- [x] Detail pages: single OR query (slug/ID) + 301 redirect to canonical slug URL
- [x] `lib/seo.ts` uses `slug || id` in canonical URLs, OG URLs, JSON-LD
- [x] `app/sitemap.ts` uses slug URLs
- [x] Internal links use `slug || id` fallback (model-card, agency-card, agency-client)

---

## ✅ PHASE 7-9 — Notifications + PWA + Email (COMPLETE)
- [x] `lib/notifications.ts` — createAndDeliverNotification()
- [x] `lib/push.ts` — sendPushNotification() + mock fallback
- [x] `lib/email.ts` — sendEmailNotification() + mock fallback
- [x] `/api/notifications` — GET + PATCH (mark read)
- [x] `/api/push/subscribe` + `/api/push/unsubscribe`
- [x] `app/notifications/page.tsx` — tabs, mark read, empty state
- [x] `app/manifest.ts` — PWA manifest
- [x] `public/sw.js` — service worker for push
- [x] `components/notification-permission.tsx` — PWA push permission UI
- [x] Navbar bell — real unread count from DB

---

## ✅ PHASE 10 — Contact Page (COMPLETE)
- [x] `/api/contact` — POST saves to DB, GET for admin
- [x] `app/contact/page.tsx` — name, email, role, subject, message → DB

---

## ✅ PHASE 11 — Marketplace (COMPLETE)
- [x] `/api/marketplace` — GET + POST

---

## ✅ PHASE 13 — TypeScript / Type Safety (COMPLETE)
- [x] `tsc --noEmit` — zero errors

---

## ✅ PHASE 14 — Onboarding Flow (COMPLETE)
- [x] `app/onboarding/page.tsx` — 3-step: purpose → details → confirm
- [x] `/api/onboarding` — sets role, creates role-specific profile, marks onboardingCompleted=true
- [x] `lib/user-routing.ts` — getDashboardRouteForUser() maps role → dashboard path

---

## ✅ PHASE 15 — Auth Migration: Clerk → Custom Session Auth (COMPLETE)

**Implementation:** Migrated from Clerk to a custom session-based authentication system using:
- `lib/session.ts` — SHA256-hashed tokens stored in DB, HTTP-only cookies, 7-day expiry
- `lib/password.ts` — bcrypt password hashing (12 salt rounds)
- `lib/auth.ts` — `getCurrentUser()` wrapper used by all API routes
- `lib/auth-context.tsx` — React context with `useAuth()` hook (user, isLoading, signOut, refreshUser)
- `components/session-provider.tsx` — wraps AuthProvider
- `components/user-dropdown.tsx` — professional avatar dropdown with role badge
- `components/navbar.tsx` — uses `useAuth()` + `UserDropdown`
- `app/api/auth/login/route.ts` — bcrypt verify + session creation
- `app/api/auth/signup/route.ts` — Zod validation + bcrypt hash + session creation
- `app/api/auth/logout/route.ts` — session destruction + cookie clear
- `app/api/auth/me/route.ts` — return current user data
- Custom login/signup pages with password strength meter, error handling
- All 17+ API routes updated to use `getCurrentUser()`
- `middleware.ts` — no Clerk middleware, only security headers
- `scripts/seed-admin.ts` — seed script for admin user

---

## ✅ PHASE 16 — Accessibility (COMPLETE)

**Implementation:**
- Added `sr-only` utility class to `globals.css` for screen-reader-only text
- Added `skip-to-content` link in root layout (visually hidden until focused, skips to main)
- Added `focus-visible` ring styles with gold accent color across all interactive elements
- Added `prefers-reduced-motion` media query to disable animations for users with vestibular disorders
- Added `aria-label` to icon-only buttons: nav menu toggle, file upload/clear, notification dismiss, slide controls
- Added `aria-expanded` to mobile menu toggle in navbar
- Added `aria-labelledby` to footer navigation lists
- Added `aria-current` to carousel dot indicators
- Added `role="dialog"`, `aria-modal="true"`, `aria-label` to mobile drawer in dashboard sidebar
- Added Escape key handler to close mobile drawer in dashboard sidebar
- Added `aria-label` to booking/apply buttons in service-card and casting-card

---

## ✅ PHASE 17 — PWA & Performance (COMPLETE)

**Implementation:**
- Enhanced service worker (`public/sw.js`) with full caching strategy (CacheFirst for static assets, StaleWhileRevalidate for pages, NetworkFirst for API calls)
- Proper cache versioning with `v1`, automatic old cache cleanup, graceful offline fallback
- Improved PWA manifest (`app/manifest.ts`) with SVG icons, `scope`, `orientation`, `categories`, `shortcuts` to key pages
- Optimized `force-dynamic` usages: replaced with `revalidate = 60` on server detail pages, removed from all client components
- Added `next/dynamic` with `ssr: false` for heavy ModelCreateWizard component (5-step form with media uploads)
- Added `priority` to above-fold images (navbar logo, footer logo)
- Added `preconnect` hint for Cloudinary CDN in layout
- Images already use proper `sizes`, `loading="lazy"`, and blur placeholders where applicable

---

## ✅ PHASE 18 — Error Handling & Monitoring (COMPLETE)

**Implementation:**
- Created `lib/errors.ts` — typed error classes with standardized `ApiErrorResponse`:
  - `AppError` base class with status, code, message, details, fieldErrors, upgradeUrl
  - Static factory methods: `.badRequest()`, `.unauthorized()`, `.forbidden()`, `.notFound()`, `.conflict()`, `.rateLimited()`, `.planLimit()`, `.internal()`
  - Convenience subclasses: `NotFoundError`, `AuthError`, `ValidationError`, `ForbiddenError`
  - `toResponse()` method for consistent API error JSON serialization
  - Full error code union type: `ErrorCode`
- Created `lib/logger.ts` — structured logging helper:
  - Log levels: debug, info, warn, error
  - ISO-8601 timestamps and optional `requestId` via `generateRequestId()`
  - Production: JSON output for cloud log ingestion
  - Development: human-readable formatted output
  - Optional duration, data, and structured error fields
- Created `app/not-found.tsx` — custom 404 page with brand design language
- Created `app/error.tsx` — global error boundary UI with Try Again + Home buttons
- Created `app/global-error.tsx` — root-level error boundary with standalone HTML (catches errors in layout)
- Created `app/api/health/route.ts` — health check endpoint with database ping, uptime, duration, environment info
- Updated `middleware.ts` — added request duration tracking for API routes, warnings for slow requests (>1s)

---

## ✅ PHASE 19 — Testing (COMPLETE)

**Implementation:**
- Set up Vitest with `vitest.config.ts` (path aliases, Node environment, V8 coverage)
- Added `test` and `test:watch` scripts to `package.json`
- Wrote 66 unit tests across 4 test files — all passing:
  - `lib/__tests__/slug.test.ts` (21 tests) — `toSlug()`, `makeUniqueSlug()`, `modelSlug()`, `agencySlug()`
  - `lib/__tests__/rate-limit.test.ts` (13 tests) — `checkRateLimit()` (limiting, route isolation, IP isolation, defaults), `getClientIp()` (header precedence, fallbacks, Headers class support)
  - `lib/__tests__/errors.test.ts` (22 tests) — `AppError` factory methods, `toResponse()` serialization, `NotFoundError`, `AuthError`, `ValidationError`, `ForbiddenError`, `ErrorCode` type coverage
  - `lib/__tests__/logger.test.ts` (10 tests) — each log level calls correct console method, optional fields (requestId, error, duration, data)
- `npx tsc --noEmit` passes with zero errors
- `npx vitest run` passes with zero failures

---

## ✅ PHASE 20 — Database & Performance Optimization (COMPLETE)

**Implementation:**
- Added 22 missing Prisma indexes across 11 models:
  - **User**: `@@index([role])`, `@@index([status])` — admin filtering by role/status
  - **Model**: `@@index([agencyId])`, `@@index([profileStatus])`, `@@index([viewsCount])` — FK + filter + sort
  - **Casting**: `@@index([agencyId])`, `@@index([clientId])`, `@@index([isActive])` — FK + filter
  - **CastingApplication**: `@@index([castingId])`, `@@index([modelId])`, `@@index([status])` — FK + filter
  - **Review**: `@@index([modelId])` — FK
  - **Notification**: `@@index([userId])`, `@@index([isRead])` — FK + filter (unread)
  - **PushSubscription**: `@@index([userId])` — FK
  - **Message**: `@@index([senderId])`, `@@index([receiverId])` — FK for messaging queries
  - **Booking**: `@@index([modelId])`, `@@index([clientId])`, `@@index([status])` — FK + filter
  - **ContactMessage**: `@@index([userId])` — FK
  - **BusinessProfile**: `@@index([verificationStatus])` — admin filtering
  - **Agency**: `@@index([isVerified])`, `@@index([verificationStatus])` — listing + admin
  - **Subscription**: `@@index([status, plan])` — composite index for featured subscription queries
- N+1 query pattern already fixed in `/api/agencies` and `/api/models` (batch subscription queries via `findMany` with `in:` clause)
- Include hints already present in all listing queries (eager-loading relations)

---

## ✅ PHASE 21 — CSRF Protection (COMPLETE)

**Implementation:**
- Created `lib/csrf.ts` — double-submit cookie pattern:
  - `ensureCsrfToken()` generates and sets a non-HttpOnly `csrf_token` cookie
  - `validateCsrfToken()` uses Node.js `crypto.timingSafeEqual` for server-side validation
  - `CSRF_EXEMPT_PATHS` list: `/api/auth/*`, `/api/webhooks/*`, `/api/health`
  - Edge-compatible constant-time comparison helper in middleware
- Created `app/api/auth/csrf/route.ts` — authenticated endpoint to retrieve and set CSRF token
- Created `lib/csrf-client.ts` — client-side CSRF token reader and `csrfFetch()` wrapper
- Updated `middleware.ts` — CSRF validation for all POST/PATCH/DELETE/PUT API routes
  - Uses timing-safe XOR comparison (compatible with Edge runtime)
  - Checks exempt paths before validation
  - Returns 403 with `CSRF_VALIDATION_FAILED` code on mismatch
- Updated `lib/auth-context.tsx`:
  - Global `window.fetch` override that auto-includes `x-csrf-token` header on mutations
  - `ensureCsrfToken()` called after successful user authentication
  - Interceptor skips `/api/auth/*` to align with exempt paths
- `SameSite=Strict` + `Secure` + `HttpOnly` already configured on session cookie
- All 66 tests pass, zero type errors

---

## ✅ PHASE 22 — CI/CD & DevOps (COMPLETE)

**Implementation:**
- Created `.github/workflows/ci.yml` — CI pipeline:
  - Runs on push/PR to main
  - Steps: checkout → Node 20 setup → npm ci → Prisma generate → tsc → lint → vitest → next build
  - Concurrent group with cancel-in-progress
  - Sets minimal env vars for CI build
- Created `.github/workflows/deploy.yml` — Deployment pipeline:
  - Triggered on push to main
  - Uses Docker Buildx with GitHub Actions cache (gha)
  - Tags: SHA-commit, branch, latest
  - Pushes to GitHub Container Registry (ghcr.io)
  - Template deploy step (commented out) for provider-specific deployment
- Created `Dockerfile` — Multi-stage Docker build:
  - Stage 1 (deps): npm ci
  - Stage 2 (builder): Prisma generate + next build with standalone output
  - Stage 3 (runner): Minimal production image using `node:20-alpine`
  - Non-root `nextjs` user for security
  - Copies Prisma runtime dependencies for database access
- Created `.dockerignore` — Excludes node_modules, .next, git, tests, configs
- Updated `scripts/validate-env.ts` — Startup env validation:
  - Checks 6 required vars: DATABASE_URL, DIRECT_DATABASE_URL, NEXT_PUBLIC_APP_URL, Cloudinary vars
  - Clear error messages with descriptions
  - Exits with code 1 on failure
- Updated `.env.example` — Complete env template with all current variables
- Updated `next.config.ts` — Production configuration:
  - `output: "standalone"` for Docker deployment
  - `serverExternalPackages` for Prisma + bcrypt
  - Conditional fetch logging (development only)
- All 66 tests pass, zero type errors

---

## Environment Variables (Current State)

```env
# ─── Database (Neon) ──────────────────────────────────────────────────────────
DATABASE_URL=postgresql://...pooler...
DIRECT_DATABASE_URL=postgresql://...direct...

# ─── NextAuth (replaces Clerk) ────────────────────────────────────────────────
AUTH_SECRET=<generate: npx auth secret>
NEXTAUTH_URL=http://localhost:3000

# ─── App URL ──────────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ─── Cloudinary ───────────────────────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=duslhrrdh
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# ─── Push Notifications (VAPID) ───────────────────────────────────────────────
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@modelconnect.africa

# ─── Email (optional) ─────────────────────────────────────────────────────────
RESEND_API_KEY=
EMAIL_FROM=ModelConnect.Africa <notifications@modelconnect.africa>
```

---

## Summary

| Phase | Status |
|-------|--------|
|  0. Database Connection | ✅ Complete |
|  1. SEO + Security Headers | ✅ Complete |
|  2. Dynamic Metadata | ✅ Complete |
|  3. Schema.org JSON-LD | ✅ Complete |
|  4. Security Hardening | ✅ Complete |
|  5. Image SEO | ✅ Complete |
|  6. URL Slugs | ✅ Complete |
|  7-9. Notifications + PWA + Email | ✅ Complete |
| 10. Contact Page | ✅ Complete |
| 11. Marketplace | ✅ Complete |
| 13. TypeScript Safety | ✅ Complete |
| 14. Onboarding Flow | ✅ Complete |
| 15. Auth Migration (Clerk → Custom Session Auth) | ✅ Complete |
| 16. Accessibility | ✅ Complete |
| 17. PWA & Performance | ✅ Complete |
| 18. Error Handling & Monitoring | ✅ Complete |
| 19. Testing | ✅ Complete |
| 20. DB Optimization | ✅ Complete |
| 21. CSRF Protection | ✅ Complete |
| 22. CI/CD & DevOps | ✅ Complete |
