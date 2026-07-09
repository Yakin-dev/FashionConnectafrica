import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Number(searchParams.get("limit") ?? 50)
    const search = searchParams.get("q")

    const agencies = await prisma.agency.findMany({
      where: {
        isVerified: true,
        user: { status: "ACTIVE" },
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        _count: { select: { models: true, castings: true } },
      },
      orderBy: { user: { createdAt: "desc" } },
      take: limit,
    })

    return NextResponse.json({ agencies })
  } catch (error) {
    console.error("[GET /api/agencies] failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({
      error: "Unable to load agencies right now.",
      code: "AGENCIES_LOAD_FAILED",
    }, { status: 500 })
  }
}
