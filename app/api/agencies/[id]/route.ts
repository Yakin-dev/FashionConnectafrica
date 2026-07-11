import { NextRequest, NextResponse } from "next/server"
import { SubscriptionPlan } from "@prisma/client"
import { findAgencyByIdOrSlug } from "@/lib/db-helpers"
import { prisma } from "@/lib/prisma"

const FEATURED_PLANS: SubscriptionPlan[] = ["PRO_MONTHLY", "PRO_ANNUAL", "ULTIMATE_MONTHLY", "ULTIMATE_ANNUAL"]

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: slugOrId } = await params
    const { searchParams } = new URL(req.url)

    const page = Math.max(1, Number(searchParams.get("page") ?? 1))
    const pageSize = Math.min(50, Math.max(1, Number(searchParams.get("pageSize") ?? 6)))
    const skip = (page - 1) * pageSize

    const agency = await findAgencyByIdOrSlug(slugOrId, {
      user: { select: { name: true, email: true, avatarUrl: true } },
      _count: { select: { models: true, castings: true } },
    })

    if (!agency) {
      return NextResponse.json({ error: "Agency not found." }, { status: 404 })
    }

    // Determine the agency's subscription tier
    let subscriptionTier: string | null = null
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: agency.userId,
        plan: { in: FEATURED_PLANS },
        status: "ACTIVE",
      },
    })
    if (subscription) {
      const plan = subscription.plan as string
      subscriptionTier = plan.startsWith("ULTIMATE") ? "ULTIMATE" : "PRO"
    }

    // Fetch paginated models separately
    const [models, totalModels] = await Promise.all([
      prisma.model.findMany({
        where: {
          agencyId: agency.id,
          profileStatus: "PUBLISHED",
        },
        include: {
          user: { select: { name: true, email: true } },
          portfolioMedia: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
        orderBy: { isVerified: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.model.count({
        where: {
          agencyId: agency.id,
          profileStatus: "PUBLISHED",
        },
      }),
    ])

    return NextResponse.json({
      agency: {
        ...agency,
        models,
        subscriptionTier,
      },
      pagination: {
        page,
        pageSize,
        total: totalModels,
        totalPages: Math.ceil(totalModels / pageSize),
      },
    })
  } catch (error) {
    console.error("[GET /api/agencies/[id]] failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({
      error: "Unable to load agency profile right now.",
      code: "AGENCY_LOAD_FAILED",
    }, { status: 500 })
  }
}
