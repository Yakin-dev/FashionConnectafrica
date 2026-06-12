import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const castingSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().default("General"),
  requirements: z.string().min(5),
  location: z.string().min(2),
  date: z.string(),
  budget: z.number().min(0),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const limit = Number(searchParams.get("limit") ?? 20)

    const castings = await prisma.casting.findMany({
      where: { isActive: true },
      include: {
        agency: { select: { name: true, logoUrl: true } },
        client: { include: { user: { select: { name: true } } } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    return NextResponse.json({ castings })
  } catch (error) {
    console.error("[castings GET]", error)
    return NextResponse.json({ error: "Failed to fetch castings" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { agency: true, client: true },
    })

    if (!user || (user.role !== "AGENCY" && user.role !== "CLIENT" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Agency or Client role required" }, { status: 403 })
    }

    const body = await req.json()
    const data = castingSchema.parse(body)

    const casting = await prisma.casting.create({
      data: {
        ...data,
        date: new Date(data.date),
        agencyId: user.agency?.id ?? null,
        clientId: user.client?.id ?? null,
      },
    })

    return NextResponse.json({ casting }, { status: 201 })
  } catch (error) {
    console.error("[castings POST]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create casting" }, { status: 500 })
  }
}
