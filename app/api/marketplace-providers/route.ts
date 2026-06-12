import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const providers = await prisma.marketplaceProvider.findMany({
      include: {
        user: { select: { name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return NextResponse.json({ providers })
  } catch (error: any) {
    console.error("[api/marketplace-providers]", error)
    return NextResponse.json({ providers: [] }, { status: 200 })
  }
}
