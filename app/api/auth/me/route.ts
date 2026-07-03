import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        onboardingCompleted: user.onboardingCompleted,
        onboardingStep: user.onboardingStep,
        avatarUrl: user.avatarUrl,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (error) {
    console.error("[auth/me]", error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}
