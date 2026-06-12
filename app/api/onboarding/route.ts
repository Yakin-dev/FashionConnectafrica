import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { getDashboardRouteForUser } from "@/lib/user-routing"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const data = await req.json()
    const { purpose, intentData } = data

    let role: Role = Role.MODEL
    if (purpose === "agency") role = Role.AGENCY
    if (purpose === "client" || purpose === "event") role = Role.CLIENT
    if (purpose === "provider") role = Role.MARKETPLACE_PROVIDER
    if (purpose === "admin") role = Role.ADMIN

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role,
        intent: intentData.intentType || purpose,
        userType: purpose,
        onboardingCompleted: true,
      },
    })

    if (role === Role.MODEL) {
      const isIndependent = intentData.representation === "independent"
      await prisma.model.upsert({
        where: { userId: user.id },
        update: {
          category: intentData.category || "General",
          independent: isIndependent,
          location: intentData.location || null,
        },
        create: {
          userId: user.id,
          gender: "Not specified",
          category: intentData.category || "General",
          independent: isIndependent,
          location: intentData.location || null,
          height: 0,
          experienceYears: 0,
        },
      })
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Welcome to ModelConnect",
          message: "Welcome to ModelConnect. Complete your portfolio to start receiving opportunities.",
          type: "SYSTEM",
        },
      })
    } else if (role === Role.AGENCY) {
      await prisma.agency.upsert({
        where: { userId: user.id },
        update: {
          name: intentData.agencyName || user.name,
          modelCount: intentData.modelCount || "0",
          location: intentData.location || "Not specified",
        },
        create: {
          userId: user.id,
          name: intentData.agencyName || user.name,
          modelCount: intentData.modelCount || "0",
          location: intentData.location || "Not specified",
        },
      })
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Welcome to ModelConnect",
          message: "Welcome to ModelConnect. Add your agency profile and start listing models.",
          type: "SYSTEM",
        },
      })
    } else if (role === Role.CLIENT) {
      await prisma.client.upsert({
        where: { userId: user.id },
        update: {
          company: intentData.companyName || user.name,
          purpose: intentData.clientPurpose || purpose,
          location: intentData.location || null,
        },
        create: {
          userId: user.id,
          company: intentData.companyName || user.name,
          purpose: intentData.clientPurpose || purpose,
          location: intentData.location || null,
        },
      })
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Welcome to ModelConnect",
          message: "Welcome to ModelConnect. You can now browse models or post casting opportunities.",
          type: "SYSTEM",
        },
      })
    } else if (role === Role.MARKETPLACE_PROVIDER) {
      await prisma.marketplaceProvider.upsert({
        where: { userId: user.id },
        update: {
          businessName: intentData.businessName || user.name,
          serviceCategory: intentData.service || "General",
          location: intentData.location || "Not specified",
        },
        create: {
          userId: user.id,
          businessName: intentData.businessName || user.name,
          serviceCategory: intentData.service || "General",
          location: intentData.location || "Not specified",
        },
      })
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Welcome to ModelConnect Marketplace",
          message: "Welcome to ModelConnect Marketplace. Create your first service listing.",
          type: "SYSTEM",
        },
      })
    }

    const redirectUrl = getDashboardRouteForUser(user)
    return NextResponse.json({ success: true, redirectUrl })
  } catch (error: any) {
    console.error("[api/onboarding]", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
