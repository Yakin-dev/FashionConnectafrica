# ModelConnect.Africa — Implementation Roadmap

> Pilot stage. No payments. No complex chat. No Socket.IO.
> Goal: Make the product real, functional, and testable.

---

## ✅ PHASE 0 — Database Connection (COMPLETE)
- [x] Prisma v7 schema — NO `url` in datasource block
- [x] `prisma.config.ts` — DIRECT_DATABASE_URL for migrations
- [x] `lib/prisma.ts` — PrismaPg adapter (Prisma v7 requirement)
- [x] `npx prisma generate` + `npx prisma db push` — schema synced to Neon
- [x] `npx tsx scripts/check-db.ts` — confirmed connected

---

## ✅ PHASE 1 — Clerk Authentication (SUPERSEDED by Phase 15)
~~Clerk has been fully removed. See Phase 15.~~

---

## ✅ PHASE 2 — Pilot Program (COMPLETE)
- [x] Homepage pilot banner — "Apply for Pilot Access"
- [x] `/api/agency/pilot` — POST requests pilot
- [x] `/api/admin/agencies` — GET list (admin only)
- [x] `/api/admin/agencies/[id]` — PATCH approve/reject/activate
- [x] Agency dashboard — pilot status badge + request button
- [x] Admin dashboard — pending agencies with approve/reject/activate

---

## ✅ PHASE 3 — Core Role Dashboards (COMPLETE)
- [x] Model dashboard — real DB + mock fallback, applications, notifications
- [x] Agency dashboard — pilot status, model roster, castings, add-model form
- [x] Admin dashboard — users, agencies, castings, contact messages
- [x] Client dashboard — castings, applications, shortlist/approve/reject

---

## ✅ PHASE 4 — Casting Workflow (COMPLETE)
- [x] `/api/castings` — GET + POST
- [x] `/api/castings/[id]/apply` — POST (no duplicate, notifies owner)
- [x] `/api/castings/[id]/applications` — GET + PATCH status
- [x] `app/castings/page.tsx` — real DB + mock fallback, apply modal
- [x] `app/castings/[id]/page.tsx` — detail page + apply modal

---

## ✅ PHASE 5 — Model Management (COMPLETE)
- [x] `/api/models` — GET list + POST create
- [x] `/api/models/[id]` — GET + PATCH
- [x] `/api/agency/me`, `/api/agency/models`
- [x] `app/models/page.tsx` — real DB + mock fallback, search + category filter
- [x] `app/models/[id]/page.tsx` — real DB + mock fallback, booking modal

---

## ✅ PHASE 6 — Cloudinary Upload (COMPLETE)
- [x] `lib/cloudinary-server.ts` — real upload + mock if no keys
- [x] `/api/upload` — validates file type/size, uploads to Cloudinary
- [x] `components/upload-box.tsx` — POSTs to /api/upload, real progress

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
- [x] Zod v4 fixes, Clerk v7 prop fixes, DashboardSidebar role type widened

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
All routes change pattern from:
```ts
// OLD
const { userId } = await auth()  // @clerk/nextjs/server
const user = await prisma.user.findUnique({ where: { clerkUserId: userId } })
// NEW
const session = await auth()     // @/auth
if (!session?.user?.id) return 401
const user = await prisma.user.findUnique({ where: { id: session.user.id } })
```

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
- [ ] Run seed: admin email=niyikizaoberto@gmail.com, username=Yakin-dev, default password=ModelConnect@Admin2024
- [ ] `npm run dev` — verify app starts with no errors
- [ ] Test signup → onboarding → dashboard flow end-to-end
- [ ] Test login → dashboard flow end-to-end
- [ ] Test logout works
- [ ] Test role-based redirects

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

## Files — Current State

| File | Status |
|------|--------|
| `auth.config.ts` | ✅ NEW — edge-safe JWT config |
| `auth.ts` | ✅ NEW — NextAuth with Credentials + bcrypt |
| `middleware.ts` | ✅ UPDATED — NextAuth JWT route protection |
| `proxy.ts` | ❌ DELETE — dead Clerk file |
| `lib/auth.ts` | ✅ UPDATED — uses NextAuth session |
| `types/next-auth.d.ts` | ✅ NEW — TypeScript type extensions |
| `prisma/schema.prisma` | ✅ UPDATED — removed clerkUserId, added password etc. |
| `app/layout.tsx` | ❌ UPDATE — replace ClerkProvider |
| `components/navbar.tsx` | ❌ UPDATE — replace Clerk hooks |
| `components/session-provider.tsx` | ❌ CREATE |
| `components/user-dropdown.tsx` | ❌ CREATE |
| `app/signup/page.tsx` | ❌ CREATE (custom form) |
| `app/login/page.tsx` | ❌ CREATE (custom form) |
| `app/onboarding/page.tsx` | ❌ UPDATE — add session.update() |
| `app/api/auth/[...nextauth]/route.ts` | ❌ CREATE |
| `app/api/auth/signup/route.ts` | ❌ CREATE |
| `app/api/auth/redirect/route.ts` | ❌ DELETE |
| `app/api/user/sync/route.ts` | ❌ DELETE |
| `app/api/user/role/route.ts` | ❌ DELETE |
| All other API routes (19 files) | ❌ UPDATE — replace Clerk auth |
