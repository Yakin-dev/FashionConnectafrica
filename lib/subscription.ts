import { prisma } from "@/lib/prisma"

export type SubscriptionInfo = {
  subscribed: boolean
  plan: string | null
  status: string | null
  currentPeriodEnd: Date | null
}

export async function getSubscription(userId: string): Promise<SubscriptionInfo> {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  })

  if (!subscription) {
    return { subscribed: false, plan: null, status: null, currentPeriodEnd: null }
  }

  const isActive = subscription.status === "ACTIVE"
  return {
    subscribed: isActive,
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd,
  }
}

export async function hasPremiumAccess(userId: string): Promise<boolean> {
  const info = await getSubscription(userId)
  return info.subscribed
}

/**
 * Professional roles that require a subscription to access premium features.
 */
export const PROFESSIONAL_INTENTS = ["photographer", "designer", "studio"]

export function requiresSubscription(intent: string | null | undefined): boolean {
  if (!intent) return false
  return PROFESSIONAL_INTENTS.includes(intent)
}
