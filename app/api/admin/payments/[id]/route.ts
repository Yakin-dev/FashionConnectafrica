import { getCurrentUser } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAndDeliverNotification } from "@/lib/notifications"
import { z } from "zod"

const actionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  adminNote: z.string().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const admin = await prisma.user.findUnique({ where: { id: currentUser.id } })
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { action, adminNote } = actionSchema.parse(body)

    const payment = await prisma.manualPayment.findUnique({ where: { id } })
    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.status !== "PENDING") {
      return NextResponse.json({ error: "Payment has already been processed" }, { status: 400 })
    }

    if (action === "approve") {
      // Approve payment
      await prisma.manualPayment.update({
        where: { id },
        data: {
          status: "APPROVED",
          adminNote: adminNote || null,
          approvedAt: new Date(),
        },
      })

      // Activate the user's subscription
      const now = new Date()
      const periodEnd = new Date(now)
      const planStr = payment.plan as string
      if (planStr === "PRO_ANNUAL" || planStr === "ULTIMATE_ANNUAL") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1)
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1)
      }

      await prisma.subscription.upsert({
        where: { userId: payment.userId },
        create: {
          userId: payment.userId,
          plan: payment.plan,
          status: "ACTIVE",
          amount: payment.amount,
          currency: payment.currency,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
        update: {
          status: "ACTIVE",
          amount: payment.amount,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      })

      // Set agency to active if the user is an agency
      const agency = await prisma.agency.findUnique({ where: { userId: payment.userId } })
      if (agency) {
        await prisma.agency.update({
          where: { userId: payment.userId },
          data: {
            isVerified: true,
            verificationStatus: "APPROVED",
            pilotStatus: "PILOT_ACTIVE",
          },
        })
      }

      // Activate user
      await prisma.user.update({
        where: { id: payment.userId },
        data: { status: "ACTIVE" },
      })

      // Notify user
      await createAndDeliverNotification({
        userId: payment.userId,
        title: "Payment Approved",
        message: `Your ${payment.plan.replace(/_/g, " ")} payment of ${payment.currency} ${payment.amountPaid.toLocaleString()} has been approved! Your subscription is now active.`,
        type: "SYSTEM",
        actionUrl: "/payments",
      })

      return NextResponse.json({
        success: true,
        message: "Payment approved and subscription activated.",
      })
    } else {
      // Reject payment
      if (!adminNote) {
        return NextResponse.json({ error: "Admin note is required when rejecting" }, { status: 400 })
      }

      await prisma.manualPayment.update({
        where: { id },
        data: {
          status: "REJECTED",
          adminNote,
          rejectedAt: new Date(),
        },
      })

      // Notify user
      await createAndDeliverNotification({
        userId: payment.userId,
        title: "Payment Rejected",
        message: `Your ${payment.plan.replace(/_/g, " ")} payment was not approved. Reason: ${adminNote}. Please submit a new payment.`,
        type: "SYSTEM",
        actionUrl: "/upgrade",
      })

      return NextResponse.json({
        success: true,
        message: "Payment rejected.",
      })
    }
  } catch (error) {
    console.error("[admin/payments PATCH]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 })
  }
}
