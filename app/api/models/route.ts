import { getCurrentUser } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSchema = z.object({
  name: z.string().min(2, "Full legal name is required."),
  professionalName: z.string().min(1, "Professional/stage name is required."),
  email: z.string().email().optional(),
  gender: z.string().min(1, "Gender identity is required."),
  dateOfBirth: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  nationality: z.string().optional(),
  languages: z.array(z.string()).optional(),
  representationStatus: z.string().optional(),
  travelAvailability: z.string().optional(),
  privateContactEmail: z.string().optional(),
  categories: z.array(z.string()).min(1, "Select at least one modelling category."),
  experienceLevel: z.string().optional(),
  yearsExperience: z.string().optional(),
  bio: z.string().min(80, "Professional biography must be at least 80 characters.").max(900),
  notableCredits: z.string().optional(),
  skills: z.array(z.string()).optional(),
  heightCm: z.number().min(50).max(280, "Height must be a realistic value in cm."),
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
  availability: z.string().optional(),
  isAvailable: z.boolean().optional(),
  profileStatus: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  // Consent
  consentManage: z.literal(true, { message: "You must confirm authorization to manage this model's profile." }),
  consentDisplay: z.literal(true, { message: "You must confirm images may be displayed." }),
  consentAccuracy: z.literal(true, { message: "You must confirm the information is accurate." }),
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const search = searchParams.get("q")
    const limit = Number(searchParams.get("limit") ?? 20)
    const status = searchParams.get("status") ?? "PUBLISHED"

    const models = await prisma.model.findMany({
      where: {
        profileStatus: status,
        ...(category ? { categories: { has: category } } : {}),
        ...(search ? {
          OR: [
            { professionalName: { contains: search, mode: "insensitive" } },
            { user: { name: { contains: search, mode: "insensitive" } } },
          ],
        } : {}),
      },
      include: {
        user: { select: { name: true, email: true } },
        agency: { select: { name: true, isVerified: true } },
        portfolioMedia: { orderBy: { sortOrder: "asc" }, take: 1 },
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
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const poster = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: { agency: true },
    })

    if (!poster) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Only agencies can create model profiles
    if (poster.role !== "AGENCY" || !poster.agency) {
      return NextResponse.json({ error: "Only agencies can create model profiles." }, { status: 403 })
    }

    const body = await req.json()
    const data = createSchema.parse(body)

    // Check agency verification status for publishing
    if (data.profileStatus === "PUBLISHED" && poster.agency.verificationStatus !== "APPROVED") {
      return NextResponse.json({
        error: "Your agency must be verified before publishing model profiles. Save as draft instead.",
      }, { status: 403 })
    }

    // Generate internal email if not provided
    const modelEmail = data.email || `model-${Date.now()}@${poster.agency.name.toLowerCase().replace(/\s+/g, "")}.fashionconnect.internal`;

    if (data.email) {
      const existingUser = await prisma.user.findUnique({ where: { email: modelEmail } });
      if (existingUser) {
        return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
      }
    }

    const modelUser = await prisma.user.create({
      data: {
        email: modelEmail,
        name: data.name,
        role: "MODEL",
        status: "ACTIVE",
      },
    })

    // Parse date of birth if provided
    let dateOfBirth: Date | undefined;
    if (data.dateOfBirth) {
      dateOfBirth = new Date(data.dateOfBirth);
    }

    const model = await prisma.model.create({
      data: {
        userId: modelUser.id,
        gender: data.gender,
        category: data.categories?.[0] || "Runway",
        height: data.heightCm,
        waist: data.waistCm || null,
        hips: data.hipsCm || null,
        chest: data.chestCm || null,
        shoeSize: data.shoeSize || null,
        eyeColor: data.eyeColor || null,
        hairColor: data.hairColor || null,
        agencyId: poster.agency.id,
        // New fields
        professionalName: data.professionalName,
        dateOfBirth: dateOfBirth || null,
        nationality: data.nationality || null,
        languages: data.languages || [],
        representationStatus: data.representationStatus || null,
        travelAvailability: data.travelAvailability || null,
        categories: data.categories || [],
        experienceLevel: data.experienceLevel || null,
        bio: data.bio || null,
        notableCredits: data.notableCredits || null,
        skills: data.skills || [],
        bustCm: data.bustCm || null,
        chestCm: data.chestCm || null,
        waistCm: data.waistCm || null,
        hipsCm: data.hipsCm || null,
        inseamCm: data.inseamCm || null,
        shoeSizeSystem: data.shoeSizeSystem || null,
        dressSize: data.dressSize || null,
        jacketSize: data.jacketSize || null,
        shirtSize: data.shirtSize || null,
        trouserSize: data.trouserSize || null,
        topSize: data.topSize || null,
        bottomSize: data.bottomSize || null,
        profileStatus: data.profileStatus || "DRAFT",
        privateContactEmail: data.privateContactEmail || null,
        isAvailable: data.isAvailable ?? true,
      },
    })

    if (data.city || data.country || data.bio) {
      await prisma.profile.create({
        data: {
          userId: modelUser.id,
          location: [data.city, data.country].filter(Boolean).join(", ") || null,
          bio: data.bio || null,
        },
      })
    }

    return NextResponse.json({ model }, { status: 201 })
  } catch (error) {
    console.error("[models POST]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create model profile" }, { status: 500 })
  }
}
