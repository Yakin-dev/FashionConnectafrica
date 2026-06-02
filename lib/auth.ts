import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;
    return await prisma.user.findUnique({ where: { clerkUserId: userId } });
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
