import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const admin = await prisma.user.findUnique({ where: { id: currentUser.id } })
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ subscriptions })
  } catch (error) {
    console.error("[admin/subscriptions]", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
