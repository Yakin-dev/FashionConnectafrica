import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  endpoint: z.string().url(),
  keys: z.object({ p256dh: z.string(), auth: z.string() }),
  userAgent: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkUserId: userId } });
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const { endpoint, keys, userAgent } = schema.parse(body);

    await prisma.pushSubscription.upsert({
      where: { endpoint },
      update: { p256dh: keys.p256dh, auth: keys.auth, userAgent },
      create: { userId: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth, userAgent },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[push/subscribe]", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
