import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkUserId: userId,
      },
    });

    return user;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
}