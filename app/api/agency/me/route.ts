import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Authentication required." }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: {
        agency: {
          include: { _count: { select: { models: true, castings: true } } },
        },
      },
    })

    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })
    if (!user?.agency) {
      return NextResponse.json({
        error: "Agency profile not found. Complete agency onboarding first.",
      }, { status: 404 })
    }

    return NextResponse.json({ agency: user.agency })
  } catch (error) {
    console.error("[GET /api/agency/me] failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({
      error: "Unable to load agency profile right now.",
      code: "AGENCY_LOAD_FAILED",
    }, { status: 500 })
  }
}
