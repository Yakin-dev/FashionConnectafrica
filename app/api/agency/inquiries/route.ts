import { getCurrentUser } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Authentication required." }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: { agency: true },
    })

    if (!user?.agency) {
      return NextResponse.json({ inquiries: [] })
    }

    const inquiries = await prisma.inquiry.findMany({
      where: { agencyId: user.agency.id },
      include: {
        model: {
          select: {
            id: true,
            professionalName: true,
            profileImageUrl: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({ inquiries })
  } catch (error) {
    console.error("[GET /api/agency/inquiries] failed", {
      message: error instanceof Error ? error.message : String(error),
    })
    return NextResponse.json({
      error: "Unable to load inquiries right now.",
      code: "AGENCY_INQUIRIES_LOAD_FAILED",
    }, { status: 500 })
  }
}
