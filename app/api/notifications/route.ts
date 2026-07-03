import { getCurrentUser } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { NotificationType } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: currentUser.id } })
    if (!user) return NextResponse.json({ notifications: [], unreadCount: 0 })

    const { searchParams } = new URL(req.url)
    const onlyUnread = searchParams.get("unread") === "true"
    const type = searchParams.get("type")
    const limit = Number(searchParams.get("limit") ?? 20)

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        ...(onlyUnread ? { isRead: false } : {}),
        ...(type ? { type: type as NotificationType } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    const unreadCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error("[notifications GET]", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: currentUser.id } })
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const body = await req.json().catch(() => ({}))
    const { id, markAll } = body as { id?: string; markAll?: boolean }

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: { isRead: true },
      })
      return NextResponse.json({ success: true })
    }

    if (id) {
      await prisma.notification.update({
        where: { id, userId: user.id },
        data: { isRead: true },
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Provide id or markAll" }, { status: 400 })
  } catch (error) {
    console.error("[notifications PATCH]", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
