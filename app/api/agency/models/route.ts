import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Authentication required." }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: { agency: true },
    })

    if (!user?.agency) return NextResponse.json({ models: [] })

    const models = await prisma.model.findMany({
      where: { agencyId: user.agency.id },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { id: "desc" },
    })

    return NextResponse.json({ models })
  } catch (error) {
    console.error("[GET /api/agency/models] failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({
      error: "Unable to load agency models right now.",
      code: "AGENCY_MODELS_LOAD_FAILED",
    }, { status: 500 })
  }
}
