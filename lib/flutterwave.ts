// Flutterwave SDK instance is no longer used — the create route calls the
// Flutterwave Payments API directly via fetch for the hosted checkout flow.
// The flutterwave-node-v3 package is kept in deps for potential future use
// (e.g., transaction verification, refunds via the SDK).

export const PLANS = {
  marketplace_monthly: {
    id: "marketplace_monthly",
    name: "Marketplace Premium",
    amount: 15000, // 15,000 RWF
    currency: "RWF",
    interval: "monthly",
    description: "15,000 RWF/month",
  },
  marketplace_annual: {
    id: "marketplace_annual",
    name: "Marketplace Premium",
    amount: 150000, // 150,000 RWF
    currency: "RWF",
    interval: "annual",
    description: "150,000 RWF/year (save ~17%)",
  },
} as const

export type PlanId = keyof typeof PLANS

export function getPlanById(id: PlanId) {
  return PLANS[id]
}
