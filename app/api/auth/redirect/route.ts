import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const { userId } = await auth();
    console.log("[auth/redirect] userId:", userId);
    if (!userId) {
      console.log("[auth/redirect] No userId, redirecting to login");
      return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
    }

    const clerkUser = await currentUser();
    console.log("[auth/redirect] clerkUser exists:", !!clerkUser);
    if (!clerkUser) {
      console.log("[auth/redirect] No clerkUser, redirecting to login");
      return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const name =
      `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
      clerkUser.username ||
      email.split("@")[0];

    const user = await prisma.user.upsert({
      where: { clerkUserId: userId },
      update: { email, name },
      create: {
        clerkUserId: userId,
        email,
        name,
        role: "MODEL",
        status: "PENDING",
      },
    });

    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    if (!user.onboardingCompleted) {
      return NextResponse.redirect(new URL("/onboarding", base));
    }

    const { getDashboardRouteForUser } = await import("@/lib/user-routing");
    const redirectUrl = getDashboardRouteForUser(user);
    
    return NextResponse.redirect(new URL(redirectUrl, base));
  } catch (error) {
    console.error("[auth/redirect]", error);
    return NextResponse.redirect(
      new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    );
  }
}

