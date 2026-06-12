import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSchema = z.object({
  name: z.string().min(2),
  gender: z.string().default("Female"),
  category: z.string().default("Runway"),
  height: z.number().min(100).max(250),
  location: z.string().optional(),
  bio: z.string().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const search = searchParams.get("q")
    const limit = Number(searchParams.get("limit") ?? 20)

    const models = await prisma.model.findMany({
      where: {
        ...(category ? { category } : {}),
        ...(search ? { user: { name: { contains: search, mode: "insensitive" } } } : {}),
      },
      include: {
        user: { select: { name: true, email: true } },
        agency: { select: { name: true } },
        reviews: { select: { rating: true } },
      },
      orderBy: { viewsCount: "desc" },
      take: limit,
    })

    return NextResponse.json({ models })
  } catch (error) {
    console.error("[models GET]", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const poster = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { agency: true },
    })

    if (!poster) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const body = await req.json()
    const data = createSchema.parse(body)

    if (poster.role === "AGENCY" && poster.agency) {
      const modelUser = await prisma.user.create({
        data: {
          email: `model-${Date.now()}@${poster.agency.name.toLowerCase().replace(/\s+/g, "")}.modelconnect.internal`,
          name: data.name,
          role: "MODEL",
          status: "ACTIVE",
        },
      })

      const model = await prisma.model.create({
        data: {
          userId: modelUser.id,
          gender: data.gender,
          category: data.category,
          height: data.height,
          agencyId: poster.agency.id,
        },
      })

      if (data.location || data.bio) {
        await prisma.profile.create({
          data: { userId: modelUser.id, location: data.location, bio: data.bio },
        })
      }

      return NextResponse.json({ model }, { status: 201 })
    }

    if (poster.role === "MODEL") {
      const existing = await prisma.model.findUnique({ where: { userId: poster.id } })
      if (existing) {
        const updated = await prisma.model.update({
          where: { userId: poster.id },
          data: { gender: data.gender, category: data.category, height: data.height },
        })
        return NextResponse.json({ model: updated })
      }
    }

    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  } catch (error) {
    console.error("[models POST]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
