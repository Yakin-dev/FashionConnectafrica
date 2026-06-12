import type { DefaultSession } from "next-auth"
import type { JWT as DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      onboardingCompleted: boolean
      avatarUrl?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id?: string
    role?: string
    onboardingCompleted?: boolean
    avatarUrl?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string
    role?: string
    onboardingCompleted?: boolean
    avatarUrl?: string | null
  }
}
