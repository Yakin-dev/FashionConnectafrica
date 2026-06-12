import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { agency: true },
    })

    if (!user?.agency) return NextResponse.json({ models: [] })

    const models = await prisma.model.findMany({
      where: { agencyId: user.agency.id },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { user: { createdAt: "desc" } },
    })

    return NextResponse.json({ models })
  } catch (error) {
    console.error("[agency/models]", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
