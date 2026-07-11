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

## 🔄 PHASE 15 — Auth Migration: Clerk → NextAuth (IN PROGRESS)

**Context:** Clerk completely removed. Replaced with NextAuth v5 (Auth.js) using
Credentials provider + JWT sessions + bcrypt. No OAuth providers. No Prisma adapter.

### Already Done ✅
- [x] Removed `@clerk/nextjs` package
- [x] Installed `next-auth@beta`, `bcryptjs`, `@types/bcryptjs`
- [x] `prisma/schema.prisma` — removed `clerkUserId`, added `password`, `firstName`, `lastName`, `username`, `avatarUrl`, `emailVerified` to User model
- [x] `auth.config.ts` (root) — edge-safe JWT config for middleware (no Prisma)
- [x] `auth.ts` (root) — full NextAuth config with Credentials + bcrypt + DB session refresh on `update()`
- [x] `middleware.ts` — replaced Clerk middleware with NextAuth JWT-based route protection
- [x] `lib/auth.ts` — `getCurrentUser()` now uses NextAuth session (no Clerk)
- [x] `types/next-auth.d.ts` — TypeScript type extensions for Session and JWT

### Still TODO ❌
- [ ] `proxy.ts` — DELETE (dead Clerk file)
- [ ] `app/api/auth/[...nextauth]/route.ts` — CREATE NextAuth route handler
- [ ] `app/api/auth/signup/route.ts` — CREATE registration endpoint (email+password+name, bcrypt hash, returns 201)
- [ ] `app/api/auth/redirect/route.ts` — DELETE (Clerk redirect flow, no longer needed)
- [ ] `app/api/user/sync/route.ts` — DELETE (Clerk sync, no longer needed)
- [ ] `app/api/user/role/route.ts` — DELETE (role set in onboarding, not Clerk)
- [ ] `app/layout.tsx` — replace `<ClerkProvider>` with `<SessionProvider>` from `components/session-provider.tsx`
- [ ] `components/session-provider.tsx` — CREATE thin wrapper around NextAuth SessionProvider
- [ ] `components/user-dropdown.tsx` — CREATE professional avatar dropdown (replaces Clerk UserButton)
- [ ] `components/navbar.tsx` — replace `useAuth()` / `UserButton` / `SignInButton` with `useSession()` / `UserDropdown`
- [ ] `app/signup/[[...signup]]/page.tsx` — DELETE; CREATE `app/signup/page.tsx` with custom form
- [ ] `app/login/[[...login]]/page.tsx` — DELETE; CREATE `app/login/page.tsx` with custom form
- [ ] `app/onboarding/page.tsx` — add `useSession().update()` call after POST succeeds (refreshes JWT with new role)
- [ ] `.env.local` — remove all CLERK_* vars; add `AUTH_SECRET` and `NEXTAUTH_URL=http://localhost:3000`

#### API Routes — Replace `auth()` from Clerk + `clerkUserId` lookup with NextAuth session:
- [ ] `app/api/user/me/route.ts`
- [ ] `app/api/agency/me/route.ts`
- [ ] `app/api/agency/models/route.ts`
- [ ] `app/api/agency/pilot/route.ts`
- [ ] `app/api/admin/agencies/route.ts`
- [ ] `app/api/admin/agencies/[id]/route.ts`
- [ ] `app/api/admin/users/route.ts`
- [ ] `app/api/castings/route.ts`
- [ ] `app/api/castings/[id]/apply/route.ts`
- [ ] `app/api/castings/[id]/applications/route.ts`
- [ ] `app/api/models/route.ts`
- [ ] `app/api/models/[id]/route.ts`
- [ ] `app/api/upload/route.ts`
- [ ] `app/api/notifications/route.ts`
- [ ] `app/api/contact/route.ts`
- [ ] `app/api/push/subscribe/route.ts`
- [ ] `app/api/push/unsubscribe/route.ts`
- [ ] `app/api/onboarding/route.ts`
- [ ] `app/api/marketplace/route.ts`

#### Final Steps:
- [ ] `npx prisma db push` — apply schema changes to Neon DB
- [ ] `scripts/seed-admin.ts` — CREATE seed script for admin user
- [ ] Run seed: admin email=niyikizaoberto@gmail.com, username=Yakin-dev
- [ ] `npm run dev` — verify app starts with no errors
- [ ] Test signup → onboarding → dashboard flow end-to-end
- [ ] Test login → dashboard flow end-to-end
- [ ] Test logout works
- [ ] Test role-based redirects

---

## ⏳ PHASE 16 — Accessibility (NOT STARTED)

**Context:** Most pages are `"use client"` with minimal semantic HTML. ARIA labels,
keyboard navigation, focus management, and color contrast need improvement.

- [ ] Add `aria-label` to all icon-only buttons (nav, share, favorite, close)
- [ ] Add `role` attributes to custom interactive elements
- [ ] Improve focus management: visible focus rings, skip-to-content link
- [ ] Add keyboard event handlers for modals (Escape to close, trap focus)
- [ ] Ensure color contrast ratios meet WCAG AA standards
- [ ] Add `html` lang attribute, heading hierarchy (h1→h2→h3)
- [ ] Add `alt` text to all decorative images (or `aria-hidden="true"`)
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Add `sr-only` utility class for screen-reader-only text

---

## ⏳ PHASE 17 — PWA & Performance (NOT STARTED)

**Context:** Basic service worker exists for push notifications. No caching strategy,
no lazy loading for non-critical components, no bundle analysis.

- [ ] Implement service worker caching strategy (StaleWhileRevalidate for pages, CacheFirst for static assets)
- [ ] Replace `force-dynamic` on listing pages with `revalidate` or ISR where possible
- [ ] Add `next/dynamic` with `ssr: false` for heavy components (modals, complex forms)
- [ ] Run `next build` bundle analyzer to identify large dependencies
- [ ] Optimize images: use Next.js `<Image>` with proper `sizes`, `priority` for above-fold
- [ ] Add preload hints for critical fonts/scripts
- [ ] Implement route prefetching for dashboard pages
- [ ] Add `loading="lazy"` to all below-fold iframes and images
- [ ] Measure and improve Core Web Vitals (LCP, FID, CLS)

---

## ⏳ PHASE 18 — Error Handling & Monitoring (NOT STARTED)

**Context:** Most API routes have try/catch with `console.error`. No global error
boundary, no structured logging, no monitoring service integrated.

- [ ] Create `app/error.tsx` — global error boundary UI
- [ ] Create `app/global-error.tsx` — root-level error boundary
- [ ] Create `app/not-found.tsx` — custom 404 page
- [ ] Standardize API error responses with `ApiError` type (code, message, details)
- [ ] Add structured logging helper (log level, request ID, timestamp)
- [ ] Integrate monitoring service (e.g., Sentry, Logflare, or custom)
- [ ] Add health check endpoint (`/api/health`)
- [ ] Add request duration logging middleware
- [ ] Create `lib/errors.ts` — typed error classes (NotFoundError, AuthError, ValidationError)

---

## ⏳ PHASE 19 — Testing (NOT STARTED)

**Context:** No tests exist in the project. Zero test files.

- [ ] Set up Vitest for unit/integration tests
- [ ] Set up Playwright or Cypress for E2E tests
- [ ] Write unit tests for `lib/slug.ts` — `toSlug()`, `makeUniqueSlug()`
- [ ] Write unit tests for `lib/seo.ts` — metadata builders
- [ ] Write unit tests for `lib/rate-limit.ts`
- [ ] Write unit tests for `lib/images.ts` — alt text generators, blur URL
- [ ] Write integration tests for auth API routes (login, signup)
- [ ] Write integration tests for model/agency CRUD API routes
- [ ] Write E2E tests for critical flows: signup → onboarding → dashboard
- [ ] Write E2E tests for model browsing and portfolio viewing
- [ ] Add CI pipeline (GitHub Actions) to run tests on push

---

## ⏳ PHASE 20 — Database & Performance Optimization (NOT STARTED)

**Context:** Missing indexes on key foreign keys, offset-based pagination,
N+1 query potential in listings.

- [ ] Add `@@index([userId])` to all models with userId foreign keys
- [ ] Add `@@index([agencyId])` to `Model`, `Casting`, `Inquiry`
- [ ] Add `@@index([modelId])` to `CastingApplication`, `Review`, `Inquiry`
- [ ] Migrate from offset pagination (`skip/take`) to cursor-based pagination in listing APIs
- [ ] Fix N+1 query in `/api/agencies` (subscriptions query per agency → batch)
- [ ] Add `include` hints for eager-loading common relations
- [ ] Consider Prisma raw queries for complex aggregation (e.g., model counts with filters)

---

## ⏳ PHASE 21 — CSRF Protection (NOT STARTED)

**Context:** No CSRF token validation on any mutation endpoint. `sameSite: strict`
cookie provides partial protection but not full CSRF mitigation.

- [ ] Implement double-submit cookie pattern or CSRF token endpoint
- [ ] Add CSRF token validation middleware for all POST/PATCH/DELETE requests
- [ ] Include CSRF token in all mutation API calls from the frontend
- [ ] CSRF-exempt endpoints: webhooks, auth endpoints
- [ ] Add `SameSite=Strict` + `Secure` + `HttpOnly` cookie attributes

---

## ⏳ PHASE 22 — CI/CD & DevOps (NOT STARTED)

**Context:** No CI pipeline, no deployment config, no staging environment.

- [ ] Create `.github/workflows/ci.yml` — lint, typecheck, test on PR
- [ ] Create `.github/workflows/deploy.yml` — deploy to production on main push
- [ ] Set up staging environment for preview deployments
- [ ] Add `Dockerfile` for containerized deployment
- [ ] Add environment variable validation on app startup
- [ ] Configure logging to stdout for cloud logging integration

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
| 15. Auth Migration (Clerk → NextAuth) | 🔄 In Progress |
| 16. Accessibility | ⏳ Not Started |
| 17. PWA & Performance | ⏳ Not Started |
| 18. Error Handling & Monitoring | ⏳ Not Started |
| 19. Testing | ⏳ Not Started |
| 20. DB Optimization | ⏳ Not Started |
| 21. CSRF Protection | ⏳ Not Started |
| 22. CI/CD & DevOps | ⏳ Not Started |
