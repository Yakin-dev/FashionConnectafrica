import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: { agency: true },
    })

    if (!user || user.role !== "AGENCY") {
      return NextResponse.json({ error: "Agency role required" }, { status: 403 })
    }

    if (!user.agency) {
      return NextResponse.json({ error: "Agency profile not found" }, { status: 404 })
    }

    const agency = await prisma.agency.update({
      where: { id: user.agency.id },
      data: { pilotStatus: "PENDING" },
    })

    return NextResponse.json({ agency })
  } catch (error) {
    console.error("[agency/pilot POST]", error)
    return NextResponse.json({ error: "Failed to request pilot" }, { status: 500 })
  }
}
