import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAndDeliverNotification } from "@/lib/notifications";
import { z } from "zod";

const schema = z.object({
  applicationId: z.string(),
  status: z.enum(["PENDING", "SHORTLISTED", "APPROVED", "REJECTED"]),
  notes: z.string().optional(),
});

// GET applications for a casting (agency/client who owns it, or admin)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { agency: true, client: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { id: castingId } = await params;

    const casting = await prisma.casting.findUnique({ where: { id: castingId } });
    if (!casting) return NextResponse.json({ error: "Casting not found" }, { status: 404 });

    const isOwner =
      (user.agency && casting.agencyId === user.agency.id) ||
      (user.client && casting.clientId === user.client.id) ||
      user.role === "ADMIN";

    if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const applications = await prisma.castingApplication.findMany({
      where: { castingId },
      include: {
        model: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("[castings/applications GET]", error);
    return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
  }
}

// PATCH — update application status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      include: { agency: true, client: true },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { id: castingId } = await params;
    const body = await req.json();
    const { applicationId, status, notes } = schema.parse(body);

    const casting = await prisma.casting.findUnique({ where: { id: castingId } });
    const isOwner =
      (user.agency && casting?.agencyId === user.agency.id) ||
      (user.client && casting?.clientId === user.client.id) ||
      user.role === "ADMIN";

    if (!isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const application = await prisma.castingApplication.update({
      where: { id: applicationId },
      data: { status, notes },
      include: { model: { include: { user: true } }, casting: true },
    });

    // Notify model of status change
    const statusMessages: Record<string, string> = {
      SHORTLISTED: "You have been shortlisted",
      APPROVED: "Congratulations! You have been approved",
      REJECTED: "Your application was not successful this time",
    };

    if (statusMessages[status]) {
      await createAndDeliverNotification({
        userId: application.model.userId,
        title: `Application ${status.charAt(0) + status.slice(1).toLowerCase()}`,
        message: `${statusMessages[status]} for "${application.casting.title}"`,
        type: "APPLICATION",
        actionUrl: "/dashboard/model",
      }).catch(console.error);
    }

    return NextResponse.json({ application });
  } catch (error) {
    console.error("[castings/applications PATCH]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update application" }, { status: 500 });
  }
}
