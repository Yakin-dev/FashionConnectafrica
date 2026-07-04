import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { PLANS, type PlanId } from "@/lib/flutterwave"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"

export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { plan } = (await request.json()) as { plan: PlanId }
    const planConfig = PLANS[plan]

    if (!planConfig) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const txRef = `fc-${user.id.slice(0, 8)}-${Date.now()}-${uuidv4().slice(0, 6)}`

    // Save a pending subscription in the DB so the webhook can match it
    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        plan: plan === "marketplace_annual" ? "MARKETPLACE_ANNUAL" : "MARKETPLACE_MONTHLY",
        status: "EXPIRED",
        flwReference: txRef,
        amount: planConfig.amount,
        currency: planConfig.currency,
      },
      update: {
        flwReference: txRef,
        plan: plan === "marketplace_annual" ? "MARKETPLACE_ANNUAL" : "MARKETPLACE_MONTHLY",
        amount: planConfig.amount,
        currency: planConfig.currency,
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    // Use Flutterwave's hosted checkout (Payments API) which supports
    // MTN MoMo, Airtel Money, Visa, and Mastercard out of the box for RWF.
    const flwSecretKey = process.env.FLW_SECRET_KEY ?? ""

    const flwResponse = await fetch(
      "https://api.flutterwave.com/v3/payments",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${flwSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tx_ref: txRef,
          amount: planConfig.amount,
          currency: planConfig.currency,
          redirect_url: `${appUrl}/pricing?success=true&tx_ref=${txRef}`,
          customer: {
            email: user.email,
            name: user.name,
          },
          meta: {
            userId: user.id,
            plan: planConfig.id,
          },
          customizations: {
            title: "FashionConnect.Africa",
            description: `${planConfig.name} — ${planConfig.description}`,
            logo: `${appUrl}/logo.jpeg`,
          },
          // Support all Rwandan payment methods
          payment_options: "mobilemoneyrwanda,card",
        }),
      }
    )

    const flwData = await flwResponse.json()

    if (flwData.status === "success" && flwData.data?.link) {
      return NextResponse.json({ url: flwData.data.link })
    }

    // Log the error for debugging but return a friendly message
    console.error("[payments/create] Flutterwave error:", flwData)
    return NextResponse.json(
      { error: "Payment provider is temporarily unavailable. Please try again." },
      { status: 502 }
    )
  } catch (error) {
    console.error("[payments/create]", error)
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 })
  }
}
