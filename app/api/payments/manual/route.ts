import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const submitSchema = z.object({
  plan: z.enum(["pro_monthly", "pro_annual", "ultimate_monthly", "ultimate_annual"]),
  senderName: z.string().min(1, "Sender name is required"),
  senderPhone: z.string().min(6, "Phone number is required"),
  transactionId: z.string().optional(),
  amountPaid: z.number().positive("Amount must be positive"),
  screenshotUrl: z.string().optional(),
  notes: z.string().optional(),
})

const PLAN_MAP: Record<string, { plan: string; amount: number }> = {
  pro_monthly: { plan: "PRO_MONTHLY", amount: 15000 },
  pro_annual: { plan: "PRO_ANNUAL", amount: 171000 },
  ultimate_monthly: { plan: "ULTIMATE_MONTHLY", amount: 30000 },
  ultimate_annual: { plan: "ULTIMATE_ANNUAL", amount: 342000 },
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validated = submitSchema.parse(body)
    const planInfo = PLAN_MAP[validated.plan]

    if (!planInfo) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    // Create manual payment record
    const payment = await prisma.manualPayment.create({
      data: {
        userId: user.id,
        plan: planInfo.plan as any,
        amount: planInfo.amount,
        senderName: validated.senderName,
        senderPhone: validated.senderPhone,
        transactionId: validated.transactionId || null,
        amountPaid: validated.amountPaid,
        screenshotUrl: validated.screenshotUrl || null,
        notes: validated.notes || null,
        status: "PENDING",
        receiverNumber: "0790305483",
        accountName: "UNITY FASHION MANAGEMENT Ltd",
      },
    })

    // Also save/update subscription record so it's ready for activation
    await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        plan: planInfo.plan as any,
        status: "EXPIRED",
        amount: planInfo.amount,
        currency: "RWF",
      },
      update: {
        plan: planInfo.plan as any,
        amount: planInfo.amount,
        currency: "RWF",
      },
    })

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
      },
    })
  } catch (error) {
    console.error("[payments/manual POST]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to submit payment" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payments = await prisma.manualPayment.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ payments })
  } catch (error) {
    console.error("[payments/manual GET]", error)
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 })
  }
}
