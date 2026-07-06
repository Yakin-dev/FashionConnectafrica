import { getCurrentUser } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  // Identity
  gender: z.string().optional(),
  category: z.string().optional(),
  professionalName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  languages: z.array(z.string()).optional(),
  representationStatus: z.string().optional(),
  travelAvailability: z.string().optional(),
  privateContactEmail: z.string().optional(),
  // Professional
  categories: z.array(z.string()).optional(),
  experienceLevel: z.string().optional(),
  bio: z.string().optional(),
  notableCredits: z.string().optional(),
  skills: z.array(z.string()).optional(),
  // Measurements
  height: z.number().optional(),
  bustCm: z.number().optional(),
  chestCm: z.number().optional(),
  waistCm: z.number().optional(),
  hipsCm: z.number().optional(),
  inseamCm: z.number().optional(),
  shoeSize: z.number().optional(),
  shoeSizeSystem: z.string().optional(),
  dressSize: z.string().optional(),
  jacketSize: z.string().optional(),
  shirtSize: z.string().optional(),
  trouserSize: z.string().optional(),
  topSize: z.string().optional(),
  bottomSize: z.string().optional(),
  hairColor: z.string().optional(),
  eyeColor: z.string().optional(),
  // Status
  isAvailable: z.boolean().optional(),
  profileStatus: z.enum(["DRAFT", "PUBLISHED", "HIDDEN", "ARCHIVED"]).optional(),
  profileImageUrl: z.string().optional(),
  profileImagePublicId: z.string().optional(),
  // Location
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
        agency: { select: { name: true, logoUrl: true, isVerified: true } },
        reviews: true,
        applications: {
          include: { casting: { select: { title: true, location: true } } },
          take: 10,
          orderBy: { appliedAt: "desc" },
        },
        portfolioMedia: {
          orderBy: { sortOrder: "asc" },
        },
      },
    })
    if (!model) return NextResponse.json({ error: "Model profile not found." }, { status: 404 })
    return NextResponse.json({ model })
  } catch (error) {
    console.error("[GET /api/models/:id] failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({
      error: "Unable to load model profile right now.",
      code: "MODEL_LOAD_FAILED",
    }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: { model: true, agency: true },
    })
    if (!user) return NextResponse.json({ error: "User not found." }, { status: 404 })

    const { id } = await params

    const isOwner = user.model?.id === id
    const isAgency = user.agency && await prisma.model.findFirst({ where: { id, agencyId: user.agency.id } })
    const isAdmin = user.role === "ADMIN"

    if (!isOwner && !isAgency && !isAdmin) {
      return NextResponse.json({ error: "You do not have permission to update this model profile." }, { status: 403 })
    }

    const body = await req.json()
    const validated = updateSchema.parse(body)

    // Handle dateOfBirth conversion
    const { dateOfBirth, location, bio, categories, ...modelData } = validated
    let parsedDateOfBirth: Date | undefined;
    if (dateOfBirth) {
      parsedDateOfBirth = new Date(dateOfBirth)
    }

    // Sync legacy `category` field with first entry from `categories` array
    const updatedCategories = categories || undefined
    const legacyCategory = categories && categories.length > 0 ? categories[0] : undefined

    const model = await prisma.model.update({
      where: { id },
      data: {
        ...modelData,
        ...(updatedCategories ? { categories: updatedCategories, category: legacyCategory || "Runway" } : {}),
        ...(parsedDateOfBirth ? { dateOfBirth: parsedDateOfBirth } : {}),
      },
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
    console.error("[PATCH /api/models/:id] failed", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    if (error instanceof z.ZodError) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of error.issues) {
        const path = issue.path.join(".")
        if (!fieldErrors[path]) fieldErrors[path] = []
        fieldErrors[path].push(issue.message)
      }
      return NextResponse.json({
        error: "Please fix the invalid fields.",
        fieldErrors,
      }, { status: 400 })
    }
    return NextResponse.json({
      error: "Unable to update the model profile right now.",
      code: "MODEL_UPDATE_FAILED",
    }, { status: 500 })
  }
}
