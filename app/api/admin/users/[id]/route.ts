import { getCurrentUser } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const admin = await prisma.user.findUnique({ where: { id: currentUser.id } })
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const { id } = await params

    // Prevent admin from deleting themselves
    if (id === currentUser.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Delete user — cascading deletes handle related records
    await prisma.user.delete({ where: { id } })

    return NextResponse.json({ success: true, message: `User ${user.email} has been deleted.` })
  } catch (error) {
    console.error("[admin/users/delete]", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
