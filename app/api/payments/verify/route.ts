import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import https from "https"

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY ?? ""

/**
 * Verify a Flutterwave transaction by tx_ref using the REST API directly.
 * flutterwave-node-v3's verify expects a numeric transaction_id, but we only
 * have the tx_ref until the webhook fires.
 */
async function verifyByTxRef(txRef: string): Promise<{
  status: string
  amount: number
  currency: string
  transactionId: string
} | null> {
  return new Promise((resolve, reject) => {
    const url = new URL(`https://api.flutterwave.com/v3/transactions/verify_by_reference?tx_ref=${txRef}`)
    
    const req = https.get(
      url,
      { headers: { Authorization: `Bearer ${FLW_SECRET_KEY}` } },
      (res) => {
        let data = ""
        res.on("data", (chunk) => (data += chunk))
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data)
            if (parsed.status === "success" && parsed.data) {
              resolve({
                status: parsed.data.status,
                amount: Number(parsed.data.amount) || 0,
                currency: parsed.data.currency ?? "RWF",
                transactionId: String(parsed.data.id ?? ""),
              })
            } else {
              resolve(null)
            }
          } catch {
            resolve(null)
          }
        })
      }
    )
    req.on("error", reject)
    req.end()
  })
}

export async function GET(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const txRef = searchParams.get("tx_ref")

    if (!txRef) {
      return NextResponse.json({ error: "Missing tx_ref" }, { status: 400 })
    }

    const result = await verifyByTxRef(txRef)

    if (!result) {
      return NextResponse.json({ success: false, status: "unknown", txRef })
    }

    const isSuccessful = result.status === "successful"

    if (isSuccessful) {
      const now = new Date()
      const subscription = await prisma.subscription.findFirst({
        where: { flwReference: txRef },
      })

      if (subscription && subscription.status !== "ACTIVE") {
        const periodEnd = new Date(now)
        if (subscription.plan === "MARKETPLACE_ANNUAL") {
          periodEnd.setFullYear(periodEnd.getFullYear() + 1)
        } else {
          periodEnd.setMonth(periodEnd.getMonth() + 1)
        }

        await prisma.subscription.update({
          where: { id: subscription.id },
          data: {
            status: "ACTIVE",
            flwTransactionId: result.transactionId,
            amount: result.amount,
            currency: result.currency,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
          },
        })
      }
    }

    return NextResponse.json({
      success: isSuccessful,
      status: result.status,
      txRef,
    })
  } catch (error) {
    console.error("[payments/verify]", error)
    return NextResponse.json({ error: "Failed to verify payment" }, { status: 500 })
  }
}
