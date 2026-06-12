import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  gender: z.string().optional(),
  category: z.string().optional(),
  height: z.number().optional(),
  waist: z.number().optional(),
  hips: z.number().optional(),
  chest: z.number().optional(),
  shoeSize: z.number().optional(),
  eyeColor: z.string().optional(),
  hairColor: z.string().optional(),
  isAvailable: z.boolean().optional(),
  profileImageUrl: z.string().optional(),
  profileImagePublicId: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
})

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const model = await prisma.model.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true } },
        agency: { select: { name: true, logoUrl: true } },
        reviews: true,
        applications: {
          include: { casting: { select: { title: true, location: true } } },
          take: 10,
          orderBy: { appliedAt: "desc" },
        },
      },
    })
    if (!model) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ model })
  } catch (error) {
    console.error("[models/[id] GET]", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { model: true, agency: true },
    })
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const { id } = await params

    const isOwner = user.model?.id === id
    const isAgency = user.agency && await prisma.model.findFirst({ where: { id, agencyId: user.agency.id } })
    const isAdmin = user.role === "ADMIN"

    if (!isOwner && !isAgency && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json()
    const { bio, location, ...modelData } = updateSchema.parse(body)

    const model = await prisma.model.update({
      where: { id },
      data: modelData,
    })

    if (bio !== undefined || location !== undefined) {
      await prisma.profile.upsert({
        where: { userId: model.userId },
        update: { ...(bio !== undefined ? { bio } : {}), ...(location !== undefined ? { location } : {}) },
        create: { userId: model.userId, bio, location },
      })
    }

    return NextResponse.json({ model })
  } catch (error) {
    console.error("[models/[id] PATCH]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
