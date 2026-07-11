import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/password"
import { createSession, destroySession } from "@/lib/session"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(req)
    const rateCheck = checkRateLimit(ip, "auth:login")
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)) } }
      )
    }

    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Find user by email — do NOT reveal whether the email exists
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user || !user.password) {
      // Use same error message regardless of whether email exists
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 500))
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      )
    }

    // Check if user is suspended or rejected
    if (user.status === "SUSPENDED") {
      return NextResponse.json(
        { error: "Your account has been suspended. Please contact support." },
        { status: 403 }
      )
    }

    if (user.status === "REJECTED") {
      return NextResponse.json(
        { error: "Your account has been rejected. Please contact support." },
        { status: 403 }
      )
    }

    // Create session
    const sessionToken = await createSession(user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        onboardingCompleted: user.onboardingCompleted,
        avatarUrl: user.avatarUrl,
      },
    })
  } catch (error) {
    console.error("[auth/login]", error)
    return NextResponse.json(
      { error: "Login failed. Please try again." },
      { status: 500 }
    )
  }
}
