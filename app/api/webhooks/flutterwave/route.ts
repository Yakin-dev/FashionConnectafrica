import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const FLW_SECRET_HASH = process.env.FLW_SECRET_HASH ?? ""

/**
 * Verify Flutterwave webhook signature using the verif-hash header.
 */
function verifySignature(request: Request): boolean {
  if (!FLW_SECRET_HASH) {
    console.warn("[webhooks/flutterwave] FLW_SECRET_HASH not configured — skipping verification")
    return true
  }
  const hash = request.headers.get("verif-hash") ?? ""
  return hash === FLW_SECRET_HASH
}

export async function POST(request: Request) {
  try {
    if (!verifySignature(request)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const body = await request.text()
    const payload = JSON.parse(body)

    // Flutterwave sends "charge.completed" for successful payments
    if (payload.event === "charge.completed") {
      const data = payload.data
      const txRef = data.tx_ref as string
      const flwTransactionId = String(data.id ?? data.transaction_id ?? "")
      const status = data.status as string

      if (status === "successful" || status === "completed") {
        // Find subscription by tx_ref
        const subscription = await prisma.subscription.findFirst({
          where: { flwReference: txRef },
        })

        if (subscription) {
          // Prevent duplicate processing of the same transaction
          if (subscription.flwTransactionId === flwTransactionId) {
            return NextResponse.json({ received: true, duplicate: true })
          }

          const now = new Date()
          const periodEnd = new Date(now)

          const planStr = subscription.plan as string
          if (planStr === "PRO_ANNUAL" || planStr === "ULTIMATE_ANNUAL") {
            periodEnd.setFullYear(periodEnd.getFullYear() + 1)
          } else {
            periodEnd.setMonth(periodEnd.getMonth() + 1)
          }

          const amount = Number(data.amount) || subscription.amount
          const currency = (data.currency as string) ?? subscription.currency

          await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
              status: "ACTIVE",
              flwTransactionId,
              amount,
              currency,
              currentPeriodStart: now,
              currentPeriodEnd: periodEnd,
            },
          })

          console.log(`[webhooks/flutterwave] Subscription activated for user ${subscription.userId}`)
        } else {
          console.warn(`[webhooks/flutterwave] No subscription found for tx_ref: ${txRef}`)
        }
      } else {
        console.log(`[webhooks/flutterwave] Payment ${status} for tx_ref: ${txRef}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[webhooks/flutterwave]", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}
