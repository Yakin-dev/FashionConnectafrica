import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  action: z.enum(["approve", "reject", "activate"]),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const adminUser = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!adminUser || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { action } = schema.parse(body)

    const pilotStatusMap = {
      approve: "APPROVED",
      reject: "REJECTED",
      activate: "PILOT_ACTIVE",
    } as const

    const agency = await prisma.agency.update({
      where: { id },
      data: {
        pilotStatus: pilotStatusMap[action],
        ...(action === "approve" || action === "activate" ? { isVerified: true } : {}),
      },
      include: { user: { select: { name: true, email: true } } },
    })

    if (action === "approve" || action === "activate") {
      await prisma.user.update({
        where: { id: agency.userId },
        data: { status: "ACTIVE" },
      })
    }

    return NextResponse.json({ agency })
  } catch (error) {
    console.error("[admin/agencies/[id] PATCH]", error)
    return NextResponse.json({ error: "Failed to update agency" }, { status: 500 })
  }
}
