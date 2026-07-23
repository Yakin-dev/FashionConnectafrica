import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export const dynamic = "force-dynamic"

export async function GET() {
  const start = Date.now()
  const checks: Record<string, "ok" | "error"> = {}
  let dbOk = false

  // Check database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = "ok"
    dbOk = true
  } catch (error) {
    checks.database = "error"
    logger.error("[health] Database check failed", { error })
  }

  const duration = Date.now() - start
  const statusCode = dbOk ? 200 : 503

  return NextResponse.json(
    {
      status: dbOk ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      duration,
      checks,
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "0.1.0",
    },
    {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    }
  )
}
