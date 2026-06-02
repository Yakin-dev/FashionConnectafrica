import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        agency: {
          include: { _count: { select: { models: true, castings: true } } },
        },
      },
    });

    if (!user?.agency) return NextResponse.json({ error: "Agency not found" }, { status: 404 });

    return NextResponse.json({ agency: user.agency });
  } catch (error) {
    console.error("[agency/me]", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
