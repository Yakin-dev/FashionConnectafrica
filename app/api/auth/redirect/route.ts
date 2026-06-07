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

    const roleRedirects: Record<string, string> = {
      MODEL: "/dashboard/model",
      AGENCY: "/dashboard/agency",
      CLIENT: "/dashboard/client",
      ADMIN: "/dashboard/admin",
      MARKETPLACE_PROVIDER: "/marketplace",
    };

    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    if (user.status === "PENDING" && user.role === "MODEL") {
      return NextResponse.redirect(new URL("/role-selection", base));
    }

    const redirect = roleRedirects[user.role] ?? "/role-selection";
    return NextResponse.redirect(new URL(redirect, base));
  } catch (error) {
    console.error("[auth/redirect]", error);
    return NextResponse.redirect(
      new URL("/", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000")
    );
  }
}
