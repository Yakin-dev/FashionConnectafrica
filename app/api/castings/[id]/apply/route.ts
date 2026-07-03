import { getCurrentUser } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createAndDeliverNotification } from "@/lib/notifications"
import { z } from "zod"

const schema = z.object({
  coverNote: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: { model: true },
    })

    if (!user || user.role !== "MODEL" || !user.model) {
      return NextResponse.json({ error: "Model role required" }, { status: 403 })
    }

    const { id: castingId } = await params

    const casting = await prisma.casting.findUnique({
      where: { id: castingId },
      include: { agency: { include: { user: true } }, client: { include: { user: true } } },
    })

    if (!casting || !casting.isActive) {
      return NextResponse.json({ error: "Casting not found or closed" }, { status: 404 })
    }

    const existing = await prisma.castingApplication.findFirst({
      where: { castingId, modelId: user.model.id },
    })

    if (existing) {
      return NextResponse.json({ error: "You have already applied to this casting" }, { status: 409 })
    }

    const body = await req.json().catch(() => ({}))
    const { coverNote } = schema.parse(body)

    const application = await prisma.castingApplication.create({
      data: {
        castingId,
        modelId: user.model.id,
        coverNote,
        status: "PENDING",
      },
    })

    const ownerId = casting.agency?.userId ?? casting.client?.userId
    if (ownerId) {
      await createAndDeliverNotification({
        userId: ownerId,
        title: "New Casting Application",
        message: `${user.name} applied to "${casting.title}"`,
        type: "APPLICATION",
        actionUrl: `/dashboard/${casting.agency ? "agency" : "client"}`,
      }).catch(console.error)
    }

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    console.error("[castings/apply]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 })
  }
}
