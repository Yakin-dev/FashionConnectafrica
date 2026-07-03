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
        agency: {
          include: { _count: { select: { models: true, castings: true } } },
        },
      },
    })

    if (!user?.agency) return NextResponse.json({ error: "Agency not found" }, { status: 404 })

    return NextResponse.json({ agency: user.agency })
  } catch (error) {
    console.error("[agency/me]", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
