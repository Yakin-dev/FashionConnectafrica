import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
          include: { profile: { select: { avatarUrl: true } } },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as string,
          onboardingCompleted: user.onboardingCompleted,
          avatarUrl: user.avatarUrl ?? user.profile?.avatarUrl ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as any).role as string
        token.onboardingCompleted = (user as any).onboardingCompleted as boolean
        token.avatarUrl = (user as any).avatarUrl as string | null
        token.name = user.name as string
      }
      // When session.update() is called from the client, refresh data from DB
      if (trigger === "update" && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          include: { profile: { select: { avatarUrl: true } } },
        })
        if (dbUser) {
          token.role = dbUser.role as string
          token.onboardingCompleted = dbUser.onboardingCompleted
          token.avatarUrl = dbUser.avatarUrl ?? dbUser.profile?.avatarUrl ?? null
          token.name = dbUser.name
        }
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
})
