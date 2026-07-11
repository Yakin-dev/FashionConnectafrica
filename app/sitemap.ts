import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { getBaseUrl } from "@/lib/url"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl()

  // ── Static pages ──────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/models`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/agencies`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/castings`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/marketplace`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/pricing`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/search`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${baseUrl}/upgrade`, changeFrequency: "monthly", priority: 0.5 },
  ]

  // ── Model detail pages ────────────────────────────────────────────
  // Note: Model does NOT have updatedAt, so we use User's updatedAt
  let modelPages: MetadataRoute.Sitemap = []
  try {
    const models = await prisma.model.findMany({
      where: { profileStatus: "PUBLISHED" },
      select: { id: true, slug: true, user: { select: { updatedAt: true } } },
    })
    modelPages = models.map((m) => ({
      url: `${baseUrl}/models/${m.slug || m.id}`,
      lastModified: m.user.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  } catch {
    console.warn("[sitemap] Could not fetch models")
  }

  // ── Agency detail pages ───────────────────────────────────────────
  // Note: Agency does NOT have updatedAt, so we use User's updatedAt
  let agencyPages: MetadataRoute.Sitemap = []
  try {
    const agencies = await prisma.agency.findMany({
      where: { isVerified: true, user: { status: "ACTIVE" } },
      select: { id: true, slug: true, user: { select: { updatedAt: true } } },
    })
    agencyPages = agencies.map((a) => ({
      url: `${baseUrl}/agencies/${a.slug || a.id}`,
      lastModified: a.user.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch {
    console.warn("[sitemap] Could not fetch agencies")
  }

  // ── Casting detail pages ──────────────────────────────────────────
  // Note: Casting has updatedAt directly
  let castingPages: MetadataRoute.Sitemap = []
  try {
    const castings = await prisma.casting.findMany({
      where: { isActive: true },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    })
    castingPages = castings.map((c) => ({
      url: `${baseUrl}/castings/${c.id}`,
      lastModified: c.updatedAt,
      changeFrequency: "daily" as const,
      priority: 0.7,
    }))
  } catch {
    console.warn("[sitemap] Could not fetch castings")
  }

  return [...staticPages, ...modelPages, ...agencyPages, ...castingPages]
}
