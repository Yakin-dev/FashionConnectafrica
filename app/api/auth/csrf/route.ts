import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { ensureCsrfToken } from "@/lib/csrf"

/**
 * GET /api/auth/csrf
 * Returns the current CSRF token. Generates one if it doesn't exist.
 * Requires authentication — CSRF tokens are tied to sessions.
 */
export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 })
    }

    const token = await ensureCsrfToken()
    return NextResponse.json({ csrfToken: token })
  } catch (error) {
    console.error("[auth/csrf]", error)
    return NextResponse.json({ error: "Failed to generate CSRF token" }, { status: 500 })
  }
}
