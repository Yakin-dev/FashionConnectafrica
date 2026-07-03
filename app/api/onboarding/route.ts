import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { getDashboardRouteForUser } from "@/lib/user-routing"

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const data = await req.json()
    const { purpose, intentData } = data

    let role: Role = Role.CLIENT
    if (purpose === "photographer" || purpose === "studio") role = Role.MARKETPLACE_PROVIDER
    if (purpose === "designer" || purpose === "client" || purpose === "event") role = Role.CLIENT
    if (purpose === "agency") role = Role.AGENCY
    if (purpose === "provider") role = Role.MARKETPLACE_PROVIDER
    if (purpose === "admin") role = Role.ADMIN

    const user = await prisma.user.update({
      where: { id: currentUser.id },
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
          title: "Welcome to FashionConnect",
          message: "Welcome to FashionConnect. Your profile is complete — start receiving opportunities.",
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
          title: "Welcome to FashionConnect",
          message: "Welcome to FashionConnect. Add your agency profile and start listing models.",
          type: "SYSTEM",
        },
      })
    } else if (role === Role.CLIENT) {
      const company = intentData.companyName || intentData.agencyName || user.name;
      const clientPurpose =
        purpose === "designer"
          ? `Fashion Designer — ${intentData.designFocus || "General"}`
          : intentData.clientPurpose || purpose;
      await prisma.client.upsert({
        where: { userId: user.id },
        update: {
          company,
          purpose: clientPurpose,
          location: intentData.location || null,
        },
        create: {
          userId: user.id,
          company,
          purpose: clientPurpose,
          location: intentData.location || null,
        },
      })
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Welcome to FashionConnect",
          message: "Welcome to FashionConnect. Browse models or post casting opportunities.",
          type: "SYSTEM",
        },
      })
    } else if (role === Role.MARKETPLACE_PROVIDER) {
      const serviceCategory =
        purpose === "photographer"
          ? intentData.specialty || "Photographer"
          : purpose === "studio"
          ? intentData.service || "Content Studio"
          : intentData.service || "General";
      await prisma.marketplaceProvider.upsert({
        where: { userId: user.id },
        update: {
          businessName: intentData.businessName || user.name,
          serviceCategory,
          location: intentData.location || "Kigali, Rwanda",
        },
        create: {
          userId: user.id,
          businessName: intentData.businessName || user.name,
          serviceCategory,
          location: intentData.location || "Kigali, Rwanda",
        },
      })
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Welcome to FashionConnect Marketplace",
          message: "Welcome to FashionConnect Marketplace. Create your first service listing.",
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
