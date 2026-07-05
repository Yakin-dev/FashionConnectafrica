/**
 * Centralized server-side plan limits configuration for FashionConnectAfrica.
 *
 * All upload, model-creation, listing, casting, and publishing limits
 * must be checked server-side. Never trust plan type from the browser.
 */

export type PlanTier = "FREE" | "PRO" | "ULTIMATE"

export type RoleType =
  | "agency"
  | "client"
  | "event_organizer"
  | "photographer"
  | "designer"
  | "studio"
  | "makeup_artist"
  | "fashion_stylist"
  | "hair_stylist"
  | "videographer"

// ─── Plan pricing ────────────────────────────────────────────────────
export const PLAN_PRICING = {
  FREE: { monthly: 0, annual: 0, label: "Free", description: "Build your business presence and explore the platform with essential tools." },
  PRO: { monthly: 15000, annual: 171000, label: "Pro", description: "Build a stronger professional presence, publish more work, and increase discoverability." },
  ULTIMATE: { monthly: 30000, annual: 342000, label: "Ultimate", description: "Designed for established fashion businesses that need priority visibility, larger portfolios, and stronger market presence." },
} as const

export function getPlanLabel(tier: PlanTier): string {
  return PLAN_PRICING[tier].label
}

// ─── Role-specific limits ────────────────────────────────────────────
export interface RoleLimits {
  maxModelProfiles: number        // For agencies only
  portfolioImagesPerModel: number // For agencies only
  portfolioImagesTotal: number    // For photographers, designers, artists, stylists, studios, videographers
  portfolioVideos: number
  castingSubmissionsPerMonth: number
  activeCastingsPerMonth: number  // For clients/event organizers
  featuredRanking: boolean
  featuredBadge: boolean
  advancedAnalytics: boolean
  prioritySupport: boolean
  homepageSpotlight: boolean
}

const FREE_ROLE_LIMITS: RoleLimits = {
  maxModelProfiles: 1,
  portfolioImagesPerModel: 1,
  portfolioImagesTotal: 0,
  portfolioVideos: 0,
  castingSubmissionsPerMonth: 2,
  activeCastingsPerMonth: 1,
  featuredRanking: false,
  featuredBadge: false,
  advancedAnalytics: false,
  prioritySupport: false,
  homepageSpotlight: false,
}

const PRO_ROLE_LIMITS: RoleLimits = {
  maxModelProfiles: 10,
  portfolioImagesPerModel: 8,
  portfolioImagesTotal: 12,
  portfolioVideos: 2,
  castingSubmissionsPerMonth: 15,
  activeCastingsPerMonth: 4,
  featuredRanking: false,
  featuredBadge: true,
  advancedAnalytics: false,
  prioritySupport: false,
  homepageSpotlight: false,
}

const ULTIMATE_ROLE_LIMITS: RoleLimits = {
  maxModelProfiles: 50,
  portfolioImagesPerModel: 20,
  portfolioImagesTotal: 40,
  portfolioVideos: 8,
  castingSubmissionsPerMonth: 60,
  activeCastingsPerMonth: 12,
  featuredRanking: true,
  featuredBadge: true,
  advancedAnalytics: true,
  prioritySupport: true,
  homepageSpotlight: true,
}

const PLAN_LIMITS: Record<PlanTier, RoleLimits> = {
  FREE: FREE_ROLE_LIMITS,
  PRO: PRO_ROLE_LIMITS,
  ULTIMATE: ULTIMATE_ROLE_LIMITS,
}

/**
 * Get the plan limits for a given plan tier.
 * Defaults to FREE if tier is not recognized.
 */
export function getPlanLimits(tier?: PlanTier | string | null): RoleLimits {
  if (tier && tier in PLAN_LIMITS) {
    return PLAN_LIMITS[tier as PlanTier]
  }
  return PLAN_LIMITS.FREE
}

/**
 * Get the user's current plan tier from their subscription.
 * Returns FREE if no active subscription exists.
 */
export async function getUserPlanTier(userId: string): Promise<PlanTier> {
  const { prisma } = await import("@/lib/prisma")
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription || subscription.status !== "ACTIVE") {
    return "FREE"
  }

  const plan = subscription.plan as string
  if (plan === "PRO_MONTHLY" || plan === "PRO_ANNUAL") return "PRO"
  if (plan === "ULTIMATE_MONTHLY" || plan === "ULTIMATE_ANNUAL") return "ULTIMATE"
  return "FREE"
}

/**
 * Check if a user has exceeded their plan's model profile limit (for agencies).
 */
export async function canCreateModelProfile(agencyId: string, userId: string): Promise<{ allowed: boolean; reason?: string; upgradeTier?: PlanTier }> {
  const { prisma } = await import("@/lib/prisma")
  const tier = await getUserPlanTier(userId)
  const limits = getPlanLimits(tier)

  const currentCount = await prisma.model.count({ where: { agencyId } })

  if (currentCount >= limits.maxModelProfiles) {
    const nextTier: PlanTier = tier === "FREE" ? "PRO" : "ULTIMATE"
    return {
      allowed: false,
      reason: `Your ${getPlanLabel(tier)} plan includes ${limits.maxModelProfiles} represented model profile${limits.maxModelProfiles === 1 ? "" : "s"}. Upgrade to ${getPlanLabel(nextTier)} to manage more talent.`,
      upgradeTier: nextTier,
    }
  }

  return { allowed: true }
}

/**
 * Check if a user can upload portfolio media based on their plan.
 */
export async function canUploadPortfolioMedia(
  userId: string,
  roleType: RoleType,
  currentImageCount: number,
  isVideo: boolean
): Promise<{ allowed: boolean; reason?: string; upgradeTier?: PlanTier }> {
  const tier = await getUserPlanTier(userId)
  const limits = getPlanLimits(tier)

  if (tier === "FREE") {
    // Free agencies can upload 1 cover image
    if (roleType === "agency" && currentImageCount < 1 && !isVideo) {
      return { allowed: true }
    }
    return {
      allowed: false,
      reason: "Portfolio media is available with Pro or Ultimate. Upgrade to publish your work, attract stronger inquiries, and improve your business visibility.",
      upgradeTier: "PRO",
    }
  }

  if (isVideo && currentImageCount >= limits.portfolioVideos) {
    const nextTier: PlanTier = tier === "PRO" ? "ULTIMATE" : "ULTIMATE"
    return {
      allowed: false,
      reason: `Your ${getPlanLabel(tier)} plan allows ${limits.portfolioVideos} video${limits.portfolioVideos === 1 ? "" : "s"}. Upgrade to ${getPlanLabel(nextTier)} for more.`,
      upgradeTier: nextTier,
    }
  }

  if (!isVideo && currentImageCount >= limits.portfolioImagesTotal) {
    const nextTier: PlanTier = tier === "PRO" ? "ULTIMATE" : "ULTIMATE"
    return {
      allowed: false,
      reason: `Your ${getPlanLabel(tier)} plan allows ${limits.portfolioImagesTotal} portfolio image${limits.portfolioImagesTotal === 1 ? "" : "s"}. Upgrade to ${getPlanLabel(nextTier)} for unlimited capacity.`,
      upgradeTier: nextTier,
    }
  }

  return { allowed: true }
}

/**
 * Check if an agency can create more casting submissions this month.
 */
export async function canSubmitCasting(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const { prisma } = await import("@/lib/prisma")
  const tier = await getUserPlanTier(userId)
  const limits = getPlanLimits(tier)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const monthlyCount = await prisma.castingApplication.count({
    where: {
      model: { agency: { userId } },
      appliedAt: { gte: startOfMonth },
    },
  })

  if (monthlyCount >= limits.castingSubmissionsPerMonth) {
    return {
      allowed: false,
      reason: `Your ${getPlanLabel(tier)} plan allows ${limits.castingSubmissionsPerMonth} casting submission${limits.castingSubmissionsPerMonth === 1 ? "" : "s"} per month. Upgrade for a higher limit.`,
    }
  }

  return { allowed: true }
}

/**
 * Check if a client can post more castings.
 */
export async function canPostCasting(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const { prisma } = await import("@/lib/prisma")
  const tier = await getUserPlanTier(userId)
  const limits = getPlanLimits(tier)

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const monthlyCount = await prisma.casting.count({
    where: {
      client: { userId },
      createdAt: { gte: startOfMonth },
    },
  })

  if (monthlyCount >= limits.activeCastingsPerMonth) {
    return {
      allowed: false,
      reason: `Your ${getPlanLabel(tier)} plan allows ${limits.activeCastingsPerMonth} casting${limits.activeCastingsPerMonth === 1 ? "" : "s"} per month. Upgrade to Pro or Ultimate for more.`,
    }
  }

  return { allowed: true }
}
