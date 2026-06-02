import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  title:        z.string().min(3),
  providerName: z.string().min(2),
  providerRole: z.string().min(2),
  description:  z.string().min(10),
  price:        z.number().min(0),
  location:     z.string().min(2),
  imageUrl:     z.string().optional(),
  cloudinaryPublicId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const limit    = Number(searchParams.get("limit") ?? 20);

    const services = await prisma.marketplaceService.findMany({
      where: category ? { providerRole: { contains: category, mode: "insensitive" } } : {},
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error("[marketplace GET]", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const data = schema.parse(body);

    const service = await prisma.marketplaceService.create({ data });
    return NextResponse.json({ service }, { status: 201 });
  } catch (error) {
    console.error("[marketplace POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

