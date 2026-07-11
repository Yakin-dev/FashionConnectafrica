import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { PLANS, type PlanId, planIdToPrismaPlan } from "@/lib/flutterwave"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/session"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIp(request)
    const rateCheck = checkRateLimit(ip, "payment:create")
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many payment attempts. Please try again later." },
        { status: 429 }
      )
    }

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
    const prismaPlan = planIdToPrismaPlan(plan)

    // Save a pending subscription reference in the DB
    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        plan: prismaPlan as any,
        status: "EXPIRED",
        flwReference: txRef,
        amount: planConfig.amount,
        currency: planConfig.currency,
      },
      update: {
        flwReference: txRef,
        plan: prismaPlan as any,
        amount: planConfig.amount,
        currency: planConfig.currency,
        status: "EXPIRED",
      },
    })

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    // Use Flutterwave's hosted checkout
    const flwSecretKey = process.env.FLW_SECRET_KEY ?? ""

    const flwResponse = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${flwSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tx_ref: txRef,
        amount: planConfig.amount,
        currency: planConfig.currency,
        redirect_url: `${appUrl}/upgrade?success=true&tx_ref=${txRef}`,
        customer: {
          email: user.email,
          name: user.name,
        },
        meta: {
          userId: user.id,
          plan: planConfig.id,
          tier: planConfig.tier,
        },
        customizations: {
          title: "FashionConnect.Africa",
          description: `${planConfig.name} — ${planConfig.description}`,
          logo: `${appUrl}/logo.jpeg`,
        },
        payment_options: "mobilemoneyrwanda,card",
      }),
    })

    const flwData = await flwResponse.json()

    if (flwData.status === "success" && flwData.data?.link) {
      return NextResponse.json({ url: flwData.data.link })
    }

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
