import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/admin/agencies — List all agencies (admin only)
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const agencies = await prisma.agency.findMany({
      include: {
        user: { select: { name: true, email: true, createdAt: true } },
        _count: { select: { models: true, castings: true } },
      },
      orderBy: { user: { createdAt: "desc" } },
    });

    return NextResponse.json({ agencies });
  } catch (error) {
    console.error("[admin/agencies GET]", error);
    return NextResponse.json({ error: "Failed to fetch agencies" }, { status: 500 });
  }
}
