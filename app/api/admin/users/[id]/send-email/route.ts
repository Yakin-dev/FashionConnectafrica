import { getCurrentUser } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendEmailNotification } from "@/lib/email"
import { z } from "zod"

const emailSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200),
  message: z.string().min(1, "Message is required").max(5000),
})

export async function POST(
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

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await req.json()
    const validated = emailSchema.parse(body)

    const subscription = await prisma.subscription.findUnique({ where: { userId: id } })
    const currentPlan = subscription?.plan?.replace(/_/g, " ") || "Free"
    const planEnd = subscription?.currentPeriodEnd
      ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
      : "N/A"

    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1D1A16; font-size: 24px; font-weight: bold;">FashionConnect.Africa</h1>
          <p style="color: #C8A96A; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Admin Notification</p>
        </div>
        <p style="color: #333; font-size: 14px; line-height: 1.6;">Hi ${user.name || user.email},</p>
        <div style="background: #f8f5ef; border-left: 4px solid #C8A96A; padding: 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${validated.message}</p>
        </div>
        <hr style="border: none; border-top: 1px solid #E7DED1; margin: 24px 0;" />
        <table style="width: 100%; font-size: 12px; color: #6B6257;">
          <tr>
            <td style="padding: 4px 0;"><strong>Current Plan:</strong></td>
            <td style="padding: 4px 0; text-align: right;">${currentPlan}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0;"><strong>Plan Ends:</strong></td>
            <td style="padding: 4px 0; text-align: right;">${planEnd}</td>
          </tr>
        </table>
        <hr style="border: none; border-top: 1px solid #E7DED1; margin: 24px 0;" />
        <p style="color: #6B6257; font-size: 11px; text-align: center;">
          FashionConnect.Africa — Kigali, Rwanda<br />
          <a href="https://fashionconnect.africa/upgrade" style="color: #C8A96A;">Upgrade your plan</a>
        </p>
      </div>
    `

    await sendEmailNotification({
      to: user.email,
      subject: validated.subject,
      html: htmlContent,
      text: `${validated.message}\n\n---\nCurrent Plan: ${currentPlan}\nPlan Ends: ${planEnd}\nVisit: https://fashionconnect.africa/upgrade`,
    })

    // Log the notification
    await prisma.notification.create({
      data: {
        userId: id,
        title: validated.subject,
        message: validated.message,
        type: "ADMIN",
        emailSent: true,
        emailSentAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: `Email sent to ${user.email}`,
    })
  } catch (error) {
    console.error("[admin/users/send-email]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}
