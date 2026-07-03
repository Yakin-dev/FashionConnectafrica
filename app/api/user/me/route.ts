import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

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

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, avatarUrl: user.avatarUrl },
      model: user.model
        ? { ...user.model, user: { name: user.name, email: user.email, profile: user.profile } }
        : null,
      agency: user.agency,
      client: user.client,
    })
  } catch (error) {
    console.error("[user/me]", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
