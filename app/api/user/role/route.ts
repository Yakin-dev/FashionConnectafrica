import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  role: z.enum(["MODEL", "AGENCY", "CLIENT", "ADMIN", "MARKETPLACE_PROVIDER"]),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { role } = schema.parse(body);

    const user = await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        role,
        status: role === "AGENCY" ? "PENDING" : "ACTIVE",
      },
    });

    if (role === "AGENCY") {
      const existingAgency = await prisma.agency.findUnique({
        where: { userId: user.id },
      });
      if (!existingAgency) {
        await prisma.agency.create({
          data: {
            userId: user.id,
            name: user.name,
            location: "Africa",
            pilotStatus: "PENDING",
          },
        });
      }
    }

    if (role === "MODEL") {
      const existingModel = await prisma.model.findUnique({
        where: { userId: user.id },
      });
      if (!existingModel) {
        await prisma.model.create({
          data: {
            userId: user.id,
            gender: "Not specified",
            category: "General",
            height: 170,
          },
        });
      }
    }

    if (role === "CLIENT") {
      const existingClient = await prisma.client.findUnique({
        where: { userId: user.id },
      });
      if (!existingClient) {
        await prisma.client.create({
          data: { userId: user.id },
        });
      }
    }

    return NextResponse.json({ user, role });
  } catch (error) {
    console.error("[user/role]", error);
    return NextResponse.json({ error: "Failed to save role" }, { status: 500 });
  }
}
