import { auth } from "@/auth"
import { redirect } from "next/navigation"

const ROLE_DASHBOARD: Record<string, string> = {
  MODEL: "/dashboard/model",
  AGENCY: "/dashboard/agency",
  CLIENT: "/dashboard/client",
  ADMIN: "/dashboard/admin",
  MARKETPLACE_PROVIDER: "/marketplace",
}

/**
 * Server-side redirect page visited after OAuth sign-in.
 * Sends new users to /onboarding and returning users to their dashboard.
 */
export default async function AuthRedirectPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = session.user as any

  if (!user.onboardingCompleted) {
    redirect("/onboarding")
  }

  redirect(ROLE_DASHBOARD[user.role as string] ?? "/")
}
