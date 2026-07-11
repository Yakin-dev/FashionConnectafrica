import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/** Plans whose agencies get featured/priority ranking */
const FEATURED_PLANS = ["PRO_MONTHLY", "PRO_ANNUAL", "ULTIMATE_MONTHLY", "ULTIMATE_ANNUAL"]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Number(searchParams.get("limit") ?? 50)
    const search = searchParams.get("q")

    const agencies = await prisma.agency.findMany({
      where: {
        isVerified: true,
        user: { status: "ACTIVE" },
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        _count: { select: { models: true, castings: true } },
      },
      orderBy: { user: { createdAt: "desc" } },
      take: limit * 2, // Fetch extra to account for reordering
    })

    // Find which agencies have active Pro/Ultimate subscriptions
    const agencyIds = agencies.map((a) => a.id)
    const subscriptionTierMap = new Map<string, "PRO" | "ULTIMATE">()
    if (agencyIds.length > 0) {
      const subscriptions = await prisma.subscription.findMany({
        where: {
          user: { agency: { id: { in: agencyIds } } },
          plan: { in: FEATURED_PLANS },
          status: "ACTIVE",
        },
        include: {
          user: {
            select: { agency: { select: { id: true } } },
          },
        },
      })
      for (const sub of subscriptions) {
        const agencyId = sub.user.agency?.id
        if (agencyId) {
          const plan = sub.plan as string
          const tier = plan.startsWith("ULTIMATE") ? "ULTIMATE" : "PRO"
          subscriptionTierMap.set(agencyId, tier)
        }
      }
    }

    // Sort: featured agencies first, then by model count descending, then by name
    const sortedAgencies = [...agencies].sort((a, b) => {
      const aFeatured = subscriptionTierMap.has(a.id)
      const bFeatured = subscriptionTierMap.has(b.id)

      if (aFeatured && !bFeatured) return -1
      if (!aFeatured && bFeatured) return 1

      const aModels = a._count?.models ?? 0
      const bModels = b._count?.models ?? 0
      if (aModels !== bModels) return bModels - aModels

      return a.name.localeCompare(b.name)
    })

    // Attach subscriptionTier to each agency
    const agenciesWithTier = sortedAgencies.slice(0, limit).map((a) => ({
      ...a,
      subscriptionTier: subscriptionTierMap.get(a.id) ?? null,
    }))

    return NextResponse.json({ agencies: agenciesWithTier })
  } catch (error) {
    console.error("[GET /api/agencies] failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({
      error: "Unable to load agencies right now.",
      code: "AGENCIES_LOAD_FAILED",
    }, { status: 500 })
  }
}
