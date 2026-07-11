import { getCurrentUser } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.string().min(1),
  subject: z.string().min(3),
  message: z.string().min(10),
})

export async function POST(req: NextRequest) {
  try {
    // Rate limiting to prevent spam
    const ip = getClientIp(req)
    const rateCheck = checkRateLimit(ip, "contact:submit")
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many messages. Please try again later." },
        { status: 429, headers: { "Retry-After": "3600" } }
      )
    }

    const currentUser = await getCurrentUser()
    const dbUserId = currentUser?.id ?? null

    const body = await req.json()
    const data = schema.parse(body)

    const msg = await prisma.contactMessage.create({
      data: { ...data, userId: dbUserId },
    })

    return NextResponse.json({ success: true, id: msg.id }, { status: 201 })
  } catch (error) {
    console.error("[contact POST]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: currentUser.id } })
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({ messages })
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
