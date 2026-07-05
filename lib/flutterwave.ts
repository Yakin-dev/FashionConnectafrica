/**
 * Plan configurations for FashionConnectAfrica subscription tiers.
 * Uses Flutterwave Payments API for hosted checkout flow.
 */
export const PLANS = {
  pro_monthly: {
    id: "pro_monthly",
    name: "Pro",
    amount: 15000,
    currency: "RWF",
    interval: "monthly",
    description: "15,000 RWF/month",
    tier: "PRO",
  },
  pro_annual: {
    id: "pro_annual",
    name: "Pro Annual",
    amount: 171000,
    currency: "RWF",
    interval: "annual",
    description: "171,000 RWF/year (save 5%)",
    tier: "PRO",
  },
  ultimate_monthly: {
    id: "ultimate_monthly",
    name: "Ultimate",
    amount: 30000,
    currency: "RWF",
    interval: "monthly",
    description: "30,000 RWF/month",
    tier: "ULTIMATE",
  },
  ultimate_annual: {
    id: "ultimate_annual",
    name: "Ultimate Annual",
    amount: 342000,
    currency: "RWF",
    interval: "annual",
    description: "342,000 RWF/year (save 5%)",
    tier: "ULTIMATE",
  },
} as const

export type PlanId = keyof typeof PLANS

export function getPlanById(id: PlanId) {
  return PLANS[id]
}

/**
 * Map a plan ID to the Prisma SubscriptionPlan enum value.
 */
export function planIdToPrismaPlan(planId: PlanId): string {
  const map: Record<string, string> = {
    pro_monthly: "PRO_MONTHLY",
    pro_annual: "PRO_ANNUAL",
    ultimate_monthly: "ULTIMATE_MONTHLY",
    ultimate_annual: "ULTIMATE_ANNUAL",
  }
  return map[planId] ?? "PRO_MONTHLY"
}
