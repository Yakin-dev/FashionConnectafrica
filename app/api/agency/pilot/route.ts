import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST /api/agency/pilot — Agency requests pilot access
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { agency: true },
    });

    if (!user || user.role !== "AGENCY") {
      return NextResponse.json({ error: "Agency role required" }, { status: 403 });
    }

    if (!user.agency) {
      return NextResponse.json({ error: "Agency profile not found" }, { status: 404 });
    }

    const agency = await prisma.agency.update({
      where: { id: user.agency.id },
      data: { pilotStatus: "PENDING" },
    });

    return NextResponse.json({ agency });
  } catch (error) {
    console.error("[agency/pilot POST]", error);
    return NextResponse.json({ error: "Failed to request pilot" }, { status: 500 });
  }
}
