import { prisma } from "@/lib/prisma"
import { createAndDeliverNotification } from "@/lib/notifications"

export type SubscriptionInfo = {
  subscribed: boolean
  plan: string | null
  planTier: "FREE" | "PRO" | "ULTIMATE"
  status: string | null
  currentPeriodEnd: Date | null
}

export async function getSubscription(userId: string): Promise<SubscriptionInfo> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription || subscription.status !== "ACTIVE") {
    return { subscribed: false, plan: null, planTier: "FREE", status: null, currentPeriodEnd: null }
  }

  const planStr = subscription.plan as string
  const planTier = planStr === "PRO_MONTHLY" || planStr === "PRO_ANNUAL" ? "PRO" : "ULTIMATE"

  return {
    subscribed: true,
    plan: subscription.plan,
    planTier,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
  }
}

export async function hasPremiumAccess(userId: string): Promise<boolean> {
  const info = await getSubscription(userId)
  return info.subscribed
}

/**
 * Check subscription expiry and send reminders if needed.
 * Called on dashboard load (user-triggered check).
 */
export async function checkSubscriptionExpiry(userId: string): Promise<{
  expired: boolean
  daysRemaining: number | null
  reminderSent: boolean
}> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription || !subscription.currentPeriodEnd || subscription.status !== "ACTIVE") {
    return { expired: true, daysRemaining: null, reminderSent: false }
  }

  const now = new Date()
  const end = subscription.currentPeriodEnd
  const daysRemaining = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  // If expired, downgrade to free
  if (daysRemaining <= 0) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "EXPIRED" },
    })

    // If the user is an agency, disable their public listing — requires admin re-review
    const agency = await prisma.agency.findUnique({ where: { userId } })
    if (agency) {
      await prisma.agency.update({
        where: { userId },
        data: {
          isVerified: false,
          verificationStatus: "PENDING_REVIEW",
        },
      })
    }

    await createAndDeliverNotification({
      userId,
      title: "Plan Expired",
      message: "Your subscription has expired. Your account has been downgraded to Free limits, and your agency listing has been removed from public view. Renew and contact admin to restore visibility.",
      type: "SYSTEM",
      actionUrl: "/upgrade",
    })

    return { expired: true, daysRemaining: 0, reminderSent: true }
  }

  // Send reminders at 5, 3, and 1 days before expiry
  const reminderDays = [5, 3, 1]
  let reminderSent = false

  for (const day of reminderDays) {
    if (daysRemaining === day) {
      // Check if we already sent this reminder
      const existingReminders = await prisma.notification.count({
        where: {
          userId,
          title: { contains: `expires in ${day}` },
          createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
      })

      if (existingReminders === 0) {
        const planLabel = (subscription.plan as string).startsWith("PRO") ? "Pro" : "Ultimate"
        await createAndDeliverNotification({
          userId,
          title: `Plan Expires in ${day} Day${day > 1 ? "s" : ""}`,
          message: `Your ${planLabel} plan expires in ${day} day${day > 1 ? "s" : ""}. Renew now to keep your portfolio, expanded listing visibility, and premium tools.`,
          type: "SYSTEM",
          actionUrl: "/upgrade",
        })
        reminderSent = true
      }
    }
  }

  return { expired: false, daysRemaining, reminderSent }
}

/**
 * Professional roles that require a subscription to access premium features.
 */
export const PROFESSIONAL_INTENTS = [
  "photographer", "designer", "studio",
  "makeup_artist", "fashion_stylist", "hair_stylist", "videographer",
]

export function requiresSubscription(intent: string | null | undefined): boolean {
  if (!intent) return false
  return PROFESSIONAL_INTENTS.includes(intent)
}
