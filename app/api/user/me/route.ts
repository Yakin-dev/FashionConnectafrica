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
        profile: true,
        model: {
          include: {
            agency: { select: { name: true } },
            applications: {
              include: { casting: { select: { title: true, location: true } } },
              orderBy: { appliedAt: "desc" },
              take: 10,
            },
          },
        },
        agency: {
          include: { _count: { select: { models: true, castings: true } } },
        },
        client: true,
      },
    })

    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, avatarUrl: user.avatarUrl },
      model: user.model
        ? { ...user.model, user: { name: user.name, email: user.email, profile: user.profile } }
        : null,
      agency: user.agency,
      client: user.client,
    })
  } catch (error) {
    console.error("[GET /api/user/me] failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({
      error: "Unable to load profile data right now.",
      code: "USER_PROFILE_LOAD_FAILED",
    }, { status: 500 })
  }
}
