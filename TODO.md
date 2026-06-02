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

## ✅ PHASE 1 — Clerk Authentication (COMPLETE)
- [x] ClerkProvider in `app/layout.tsx`
- [x] `proxy.ts` — protects /dashboard/** (Next.js 16 uses proxy.ts not middleware.ts)
- [x] `/api/user/sync`, `/api/user/role`, `/api/user/me`, `/api/auth/redirect`
- [x] `app/signup/page.tsx` — Clerk `<SignUp forceRedirectUrl="/role-selection">`
- [x] `app/login/page.tsx` — Clerk `<SignIn forceRedirectUrl="/api/auth/redirect">`
- [x] `app/role-selection/page.tsx` — saves role to DB, creates model/agency/client record
- [x] `components/navbar.tsx` — useAuth, UserButton, SignInButton

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
- [x] Zod v4: `.errors` → `.issues` fixed in all 7 API routes
- [x] Clerk v7: `afterSignInUrl` → `forceRedirectUrl`, removed `afterSignOutUrl` from UserButton
- [x] DashboardSidebar role type widened to include CLIENT + MARKETPLACE_PROVIDER
- [x] MockModel review shape fixed (date field)
- [x] useState<string> for category fields

---

## ⚠️ PHASE 14 — Build (H: DRIVE WORKAROUND)

**Root cause:** H: drive is exFAT — Windows junction points (required by Turbopack) only work on NTFS.

**Workaround applied:** Project copied to `C:\next-build\modelconnect-africa-src` for build.
- Build runs from C: using `npx next build`
- Vercel deployment: builds on Linux — no junction point issue at all

**Local dev:** `npm run dev` works perfectly on H: (dev server doesn't need junction points).

**To deploy to Vercel:**
1. Push repo to GitHub
2. Import in Vercel — it auto-detects Next.js
3. Add all .env variables in Vercel dashboard
4. Deploy — Vercel builds on Linux, no H: drive issue

---

## Environment Variables Needed

```env
DATABASE_URL=postgresql://...pooler...
DIRECT_DATABASE_URL=postgresql://...direct...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...   ← REQUIRED (currently empty)
CLERK_SECRET_KEY=sk_...                     ← REQUIRED (currently empty)
CLOUDINARY_CLOUD_NAME=duslhrrdh            ✅ set
CLOUDINARY_API_KEY=...                      ✅ set
CLOUDINARY_API_SECRET=...                   ✅ set
NEXT_PUBLIC_VAPID_PUBLIC_KEY=              ← generate with: npx web-push generate-vapid-keys
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@modelconnect.africa
RESEND_API_KEY=                            ← optional email backup
EMAIL_FROM=ModelConnect.Africa <notifications@modelconnect.africa>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## All Files — Final State

| File | Status |
|------|--------|
| `prisma/schema.prisma` | ✅ Complete schema |
| `prisma.config.ts` | ✅ DIRECT_DATABASE_URL |
| `lib/prisma.ts` | ✅ PrismaPg adapter |
| `lib/auth.ts` | ✅ getCurrentUser |
| `lib/cloudinary-server.ts` | ✅ Real upload |
| `lib/cloudinary.ts` | ✅ Client validation |
| `lib/notifications.ts` | ✅ createAndDeliverNotification |
| `lib/push.ts` | ✅ VAPID push |
| `lib/email.ts` | ✅ Resend email |
| `proxy.ts` | ✅ Clerk middleware (Next.js 16) |
| `next.config.ts` | ✅ Image domains |
| `app/layout.tsx` | ✅ ClerkProvider |
| `app/manifest.ts` | ✅ PWA |
| `app/page.tsx` | ✅ Pilot banner |
| `app/signup/page.tsx` | ✅ Clerk SignUp |
| `app/login/page.tsx` | ✅ Clerk SignIn |
| `app/role-selection/page.tsx` | ✅ Real DB |
| `app/contact/page.tsx` | ✅ Real DB |
| `app/notifications/page.tsx` | ✅ Real DB |
| `app/castings/page.tsx` | ✅ Real DB + mock |
| `app/castings/[id]/page.tsx` | ✅ Real DB + mock |
| `app/models/page.tsx` | ✅ Real DB + mock |
| `app/models/[id]/page.tsx` | ✅ Real DB + mock |
| `app/dashboard/model/page.tsx` | ✅ Real DB + mock |
| `app/dashboard/agency/page.tsx` | ✅ Real DB + mock |
| `app/dashboard/admin/page.tsx` | ✅ Real DB |
| `app/dashboard/client/page.tsx` | ✅ Created |
| `components/navbar.tsx` | ✅ Clerk + real bell |
| `components/upload-box.tsx` | ✅ Real Cloudinary |
| `components/dashboard-sidebar.tsx` | ✅ Role types widened |
| `components/notification-permission.tsx` | ✅ PWA push UI |
| `public/sw.js` | ✅ Service worker |
| `scripts/check-db.ts` | ✅ PrismaPg adapter |
| `app/api/user/sync` | ✅ |
| `app/api/user/role` | ✅ |
| `app/api/user/me` | ✅ |
| `app/api/auth/redirect` | ✅ |
| `app/api/agency/me` | ✅ |
| `app/api/agency/models` | ✅ |
| `app/api/agency/pilot` | ✅ |
| `app/api/admin/agencies` | ✅ |
| `app/api/admin/agencies/[id]` | ✅ |
| `app/api/admin/users` | ✅ |
| `app/api/castings` | ✅ |
| `app/api/castings/[id]/apply` | ✅ |
| `app/api/castings/[id]/applications` | ✅ |
| `app/api/models` | ✅ |
| `app/api/models/[id]` | ✅ |
| `app/api/upload` | ✅ |
| `app/api/notifications` | ✅ |
| `app/api/push/subscribe` | ✅ |
| `app/api/push/unsubscribe` | ✅ |
| `app/api/contact` | ✅ |
| `app/api/marketplace` | ✅ |
