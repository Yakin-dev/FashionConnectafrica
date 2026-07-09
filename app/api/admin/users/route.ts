import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const admin = await prisma.user.findUnique({ where: { id: currentUser.id } })
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        profile: {
          select: { location: true, phoneNumber: true, bio: true },
        },
        model: {
          select: {
            id: true,
            professionalName: true,
            category: true,
            categories: true,
            profileStatus: true,
            isAvailable: true,
            height: true,
            experienceLevel: true,
            location: true,
            agency: { select: { name: true } },
          },
        },
        agency: {
          select: {
            id: true,
            name: true,
            location: true,
            isVerified: true,
            verificationStatus: true,
            pilotStatus: true,
            modelCount: true,
            _count: { select: { models: true, castings: true } },
          },
        },
        client: {
          select: { company: true, purpose: true, location: true },
        },
        businessProfile: {
          select: { role: true, businessName: true, verificationStatus: true, city: true },
        },
        marketplaceProvider: {
          select: { businessName: true, serviceCategory: true, location: true },
        },
        subscription: {
          select: {
            plan: true,
            status: true,
            amount: true,
            currency: true,
            currentPeriodStart: true,
            currentPeriodEnd: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            sentMessages: true,
            notifications: true,
            contactMessages: true,
          },
        },
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("[admin/users]", error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}
