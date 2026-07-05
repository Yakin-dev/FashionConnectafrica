import { getCurrentUser } from "@/lib/auth"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createSchema = z.object({
  url: z.string().url("Valid URL is required for portfolio media."),
  publicId: z.string().min(1, "Public ID is required."),
  mediaType: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  altText: z.string().optional(),
  sortOrder: z.number().int().min(0).default(0),
  isCover: z.boolean().default(false),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: { agency: true },
    })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { id } = await params

    // Verify the agency owns this model profile
    const model = await prisma.model.findUnique({
      where: { id },
      select: { agencyId: true },
    })
    if (!model) return NextResponse.json({ error: "Model profile not found" }, { status: 404 })

    const isOwnerAgency = user.agency && model.agencyId === user.agency.id
    const isAdmin = user.role === "ADMIN"
    if (!isOwnerAgency && !isAdmin) {
      return NextResponse.json({ error: "Only the representing agency can add portfolio media." }, { status: 403 })
    }

    const body = await req.json()
    const data = createSchema.parse(body)

    const media = await prisma.modelPortfolioMedia.create({
      data: {
        modelProfileId: id,
        url: data.url,
        publicId: data.publicId,
        mediaType: data.mediaType,
        altText: data.altText || null,
        sortOrder: data.sortOrder,
        isCover: data.isCover,
      },
    })

    // If this is the first cover image or explicitly set as cover, update the model's profileImageUrl
    if (data.isCover || data.sortOrder === 0) {
      await prisma.model.update({
        where: { id },
        data: {
          profileImageUrl: data.url,
          profileImagePublicId: data.publicId,
        },
      })
    }

    return NextResponse.json({ media }, { status: 201 })
  } catch (error) {
    console.error("[models/media POST]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to add portfolio media" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: { agency: true },
    })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const { id } = await params

    // Verify ownership
    const model = await prisma.model.findUnique({
      where: { id },
      select: { agencyId: true },
    })
    if (!model) return NextResponse.json({ error: "Model profile not found" }, { status: 404 })

    const isOwnerAgency = user.agency && model.agencyId === user.agency.id
    const isAdmin = user.role === "ADMIN"
    if (!isOwnerAgency && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const mediaId = searchParams.get("mediaId")
    if (!mediaId) return NextResponse.json({ error: "mediaId query parameter required" }, { status: 400 })

    await prisma.modelPortfolioMedia.delete({
      where: { id: mediaId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[models/media DELETE]", error)
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 })
  }
}
