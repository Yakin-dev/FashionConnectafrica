import { getCurrentUser } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  email: z.string().email("Valid email required").optional(),
  avatarUrl: z.string().optional(),
  bio: z.string().max(500).optional(),
  phoneNumber: z.string().max(20).optional(),
  location: z.string().max(100).optional(),
  website: z.string().max(200).optional(),
  instagramUrl: z.string().max(200).optional(),
})

export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Authentication required." }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: {
        profile: true,
        model: {
          include: {
            agency: { select: { name: true } },
            applications: {
              include: { casting: { select: { title: true, location: true } } },
              orderBy: { appliedAt: "desc" },
              take: 10,
            },
          },
        },
        agency: {
          include: { _count: { select: { models: true, castings: true } } },
        },
        client: true,
      },
    })

    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status, avatarUrl: user.avatarUrl, firstName: user.firstName, lastName: user.lastName },
      profile: user.profile,
      model: user.model
        ? { ...user.model, user: { name: user.name, email: user.email, profile: user.profile } }
        : null,
      agency: user.agency,
      client: user.client,
    })
  } catch (error) {
    console.error("[GET /api/user/me] failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({
      error: "Unable to load profile data right now.",
      code: "USER_PROFILE_LOAD_FAILED",
    }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Authentication required." }, { status: 401 })

    const body = await req.json()
    const validated = updateSchema.parse(body)

    // Update user fields
    if (validated.name || validated.email || validated.avatarUrl) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          ...(validated.name !== undefined ? { name: validated.name } : {}),
          ...(validated.email !== undefined ? { email: validated.email } : {}),
          ...(validated.avatarUrl !== undefined ? { avatarUrl: validated.avatarUrl } : {}),
        },
      })
    }

    // Update profile fields
    if (validated.bio !== undefined || validated.phoneNumber !== undefined || validated.location !== undefined || validated.website !== undefined || validated.instagramUrl !== undefined) {
      const profileData: Record<string, string> = {}
      if (validated.bio !== undefined) profileData.bio = validated.bio
      if (validated.phoneNumber !== undefined) profileData.phoneNumber = validated.phoneNumber
      if (validated.location !== undefined) profileData.location = validated.location
      if (validated.website !== undefined) profileData.website = validated.website
      if (validated.instagramUrl !== undefined) profileData.instagramUrl = validated.instagramUrl

      await prisma.profile.upsert({
        where: { userId: currentUser.id },
        update: profileData,
        create: { userId: currentUser.id, ...profileData },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PATCH /api/user/me] failed", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message || "Validation failed" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
