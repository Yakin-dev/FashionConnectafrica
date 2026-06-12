import type { NextAuthConfig } from "next-auth"

// Edge-safe config: no Prisma imports, no Node.js APIs.
// Used by middleware to verify JWT sessions without hitting the DB.
export const authConfig = {
  pages: {
    signIn: "/login",
    newUser: "/signup",
  },
  session: { strategy: "jwt" as const },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as any).role as string
        token.onboardingCompleted = (user as any).onboardingCompleted as boolean
        token.avatarUrl = (user as any).avatarUrl as string | null | undefined
        token.name = user.name
      }
      return token
    },
    session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
          onboardingCompleted: token.onboardingCompleted as boolean,
          avatarUrl: (token.avatarUrl ?? null) as string | null,
          name: token.name as string,
        },
      }
    },
  },
  providers: [],
} satisfies NextAuthConfig
