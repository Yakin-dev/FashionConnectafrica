import { NextResponse } from "next/server"
import { getSessionUser } from "@/lib/session"
import { getSubscription } from "@/lib/subscription"

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ subscribed: false, plan: null, status: null })
    }

    const info = await getSubscription(user.id)

    return NextResponse.json({
      subscribed: info.subscribed,
      plan: info.plan,
      status: info.status,
      currentPeriodEnd: info.currentPeriodEnd,
    })
  } catch (error) {
    console.error("[payments/subscription-status]", error)
    return NextResponse.json({ subscribed: false, plan: null, status: null }, { status: 500 })
  }
}
