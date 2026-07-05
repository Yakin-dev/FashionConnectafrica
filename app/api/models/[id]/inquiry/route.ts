import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAndDeliverNotification } from "@/lib/notifications"
import { z } from "zod"

const inquirySchema = z.object({
  senderName: z.string().min(1, "Your name is required."),
  senderEmail: z.string().email("A valid email is required so the agency can respond."),
  senderPhone: z.string().optional(),
  preferredDate: z.string().min(1, "Preferred date is required."),
  notes: z.string().min(10, "Please provide at least a short description of your requirements.").max(2000),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get model with agency info
    const model = await prisma.model.findUnique({
      where: { id },
      include: {
        agency: { select: { userId: true, name: true } },
      },
    })

    if (!model) {
      return NextResponse.json({ error: "Model profile not found" }, { status: 404 })
    }

    if (!model.agency) {
      return NextResponse.json({ error: "This model is not currently represented by an agency on the platform." }, { status: 400 })
    }

    // Profile must be published to receive inquiries
    if (model.profileStatus !== "PUBLISHED") {
      return NextResponse.json({ error: "This profile is not currently accepting inquiries." }, { status: 400 })
    }

    const body = await req.json()
    const data = inquirySchema.parse(body)

    const professionalName = model.professionalName || (await prisma.user.findUnique({ where: { id: model.userId } }))?.name || "Model"

    // Create notification for the agency
    await createAndDeliverNotification({
      userId: model.agency.userId,
      title: `Booking Inquiry for ${professionalName}`,
      message: `${data.senderName} (${data.senderEmail}) has submitted a booking inquiry for ${professionalName}. Preferred date: ${data.preferredDate}. Notes: ${data.notes}`,
      type: "BOOKING",
      actionUrl: `/dashboard/agency`,
      sendPush: true,
      sendEmail: process.env.RESEND_API_KEY ? true : false,
    })

    return NextResponse.json({
      success: true,
      message: "Your inquiry has been sent to the representing agency.",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 })
    }
    console.error("[models/inquiry POST]", error)
    return NextResponse.json({ error: "Failed to submit inquiry. Please try again." }, { status: 500 })
  }
}
