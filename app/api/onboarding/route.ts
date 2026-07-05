import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Role, VerificationStatus } from "@prisma/client"
import { getDashboardRouteForUser } from "@/lib/user-routing"
import {
  agencySchema, clientSchema, eventOrganizerSchema,
  photographerSchema, designerSchema, studioSchema,
  makeupArtistSchema, fashionStylistSchema, hairStylistSchema, videographerSchema,
  calculateOperationMonths, MIN_AGENCY_OPERATION_MONTHS,
} from "@/lib/onboarding-schemas"
import { z } from "zod"

export async function POST(req: Request) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const data = await req.json()
    const { purpose, intentData } = data

    // ── Validate purpose ────────────────────────────────────────────
    const ALLOWED_PURPOSES = ["agency", "client", "event_organizer", "photographer", "designer", "studio", "makeup_artist", "fashion_stylist", "hair_stylist", "videographer"]
    if (!ALLOWED_PURPOSES.includes(purpose)) {
      return NextResponse.json({ error: "Invalid role selected." }, { status: 400 })
    }
    if (purpose === "admin" || purpose === "staff") {
      return NextResponse.json({ error: "Administrator access is invitation-only." }, { status: 403 })
    }

    // ── Server-side Zod validation ──────────────────────────────────
    let validatedData: any
    try {
      switch (purpose) {
        case "agency":
          validatedData = agencySchema.parse(intentData)
          // Agency age rule - server side check
          const opMonths = calculateOperationMonths(validatedData.establishedYear)
          if (opMonths < MIN_AGENCY_OPERATION_MONTHS) {
            return NextResponse.json({
              error: "FashionConnectAfrica currently accepts agencies with at least 12 months of operating history. Please return once your agency reaches one full year of operation.",
            }, { status: 400 })
          }
          break
        case "client":
          validatedData = clientSchema.parse(intentData)
          break
        case "event_organizer":
          validatedData = eventOrganizerSchema.parse(intentData)
          break
        case "photographer":
          validatedData = photographerSchema.parse(intentData)
          break
        case "designer":
          validatedData = designerSchema.parse(intentData)
          break
        case "studio":
          validatedData = studioSchema.parse(intentData)
          break
        case "makeup_artist":
          validatedData = makeupArtistSchema.parse(intentData)
          break
        case "fashion_stylist":
          validatedData = fashionStylistSchema.parse(intentData)
          break
        case "hair_stylist":
          validatedData = hairStylistSchema.parse(intentData)
          break
        case "videographer":
          validatedData = videographerSchema.parse(intentData)
          break
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const firstError = err.issues[0]?.message || "Validation failed."
        return NextResponse.json({ error: firstError }, { status: 400 })
      }
      throw err
    }

    // ── Role mapping ────────────────────────────────────────────────
    let role: Role = Role.CLIENT
    if (purpose === "photographer" || purpose === "studio" || purpose === "makeup_artist" || purpose === "fashion_stylist" || purpose === "hair_stylist" || purpose === "videographer") role = Role.MARKETPLACE_PROVIDER
    if (purpose === "designer") role = Role.MARKETPLACE_PROVIDER
    if (purpose === "client" || purpose === "event_organizer") role = Role.CLIENT
    if (purpose === "agency") role = Role.AGENCY

    const operationMonths = purpose === "agency"
      ? calculateOperationMonths(validatedData.establishedYear)
      : 0

    // ── Update user ─────────────────────────────────────────────────
    const user = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        role,
        intent: purpose,
        userType: purpose,
        onboardingCompleted: true,
        status: purpose === "agency" ? "PENDING" : "ACTIVE",
      },
    })

    // ── Create/update BusinessProfile ───────────────────────────────
    const profileData: any = {
      role: purpose,
      businessName: validatedData.legalName || validatedData.companyName || validatedData.organizationName ||
                     validatedData.businessName || validatedData.brandName || validatedData.studioName ||
                     validatedData.professionalName || null,
      businessType: validatedData.businessType || validatedData.organizerType || null,
      country: validatedData.country || null,
      city: validatedData.city || null,
      address: validatedData.address || null,
      email: validatedData.email || null,
      phone: validatedData.phone || null,
      websiteUrl: validatedData.websiteUrl || validatedData.portfolioUrl || null,
      instagramUrl: validatedData.instagramUrl || null,
      description: validatedData.description || null,
      contactPersonName: validatedData.contactPersonName || null,
      contactPersonRole: validatedData.contactPersonRole || null,
    }

    if (purpose === "agency") {
      Object.assign(profileData, {
        establishedYear: parseInt(validatedData.establishedYear, 10),
        operationMonths,
        registrationStatus: validatedData.registrationStatus,
        registrationNumber: validatedData.registrationNumber || null,
        representedModelCount: validatedData.representedModelCount,
        talentCategories: validatedData.talentCategories || [],
        agencyServices: validatedData.agencyServices || [],
        verificationStatus: "PENDING_REVIEW",
        submittedAt: new Date(),
      })
    }

    if (purpose === "client") {
      Object.assign(profileData, {
        mainPurpose: validatedData.mainPurpose || [],
        projectTypes: validatedData.projectTypes || [],
        hiringFrequency: validatedData.hiringFrequency || null,
      })
    }

    if (purpose === "event_organizer") {
      Object.assign(profileData, {
        organizerType: validatedData.organizerType,
        eventScale: validatedData.eventScale,
        eventFrequency: validatedData.eventFrequency,
        nextEventDate: validatedData.nextEventDate ? new Date(validatedData.nextEventDate) : null,
        requiredServices: validatedData.requiredServices || [],
      })
    }

    if (purpose === "photographer") {
      Object.assign(profileData, {
        specialties: validatedData.specialties || [],
        experienceLevel: validatedData.experienceLevel,
        serviceArea: validatedData.serviceArea,
        startingPriceRange: validatedData.startingPriceRange || null,
      })
    }

    if (purpose === "designer") {
      Object.assign(profileData, {
        designFocus: validatedData.designFocus || [],
        designServices: validatedData.servicesOffered || [],
        experienceLevel: validatedData.experienceLevel,
        productionCapacity: validatedData.productionCapacity,
      })
    }

    if (purpose === "studio") {
      Object.assign(profileData, {
        studioServices: validatedData.studioServices || [],
        studioFacilities: validatedData.studioFacilities || [],
        studioAvailability: validatedData.studioAvailability,
        capacity: validatedData.capacity,
      })
    }

    if (purpose === "makeup_artist") {
      Object.assign(profileData, {
        specialties: validatedData.specialties || [],
        experienceLevel: validatedData.experienceLevel,
        serviceArea: validatedData.serviceArea,
        startingPriceRange: validatedData.startingPriceRange || null,
      })
    }

    if (purpose === "fashion_stylist") {
      Object.assign(profileData, {
        specialties: validatedData.styleSpecialties || [],
        designServices: validatedData.stylingServices || [],
        experienceLevel: validatedData.experienceLevel,
        serviceArea: validatedData.serviceArea,
      })
    }

    if (purpose === "hair_stylist") {
      Object.assign(profileData, {
        specialties: validatedData.specialties || [],
        experienceLevel: validatedData.experienceLevel,
        serviceArea: validatedData.serviceArea,
      })
    }

    if (purpose === "videographer") {
      Object.assign(profileData, {
        specialties: validatedData.specialties || [],
        experienceLevel: validatedData.experienceLevel,
        serviceArea: validatedData.serviceArea,
      })
    }

    await prisma.businessProfile.upsert({
      where: { userId: user.id },
      update: profileData,
      create: {
        userId: user.id,
        ...profileData,
      },
    })

    // ── Role-specific records ───────────────────────────────────────
    if (role === Role.AGENCY) {
      const agencyData: any = {
        name: validatedData.publicName || validatedData.legalName || user.name,
        location: validatedData.city ? `${validatedData.city}, ${validatedData.country}` : "Not specified",
        verificationStatus: "PENDING_REVIEW",
        pilotStatus: "PENDING",
      }
      if (validatedData.instagramUrl) {
        agencyData.description = validatedData.description || null
      }
      await prisma.agency.upsert({
        where: { userId: user.id },
        update: agencyData,
        create: {
          userId: user.id,
          ...agencyData,
          modelCount: validatedData.representedModelCount || "0",
        },
      })
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Agency Profile Submitted",
          message: "Your agency profile has been submitted for review. You will be notified once approved.",
          type: "SYSTEM",
        },
      })
    } else if (role === Role.CLIENT) {
      const companyName = validatedData.companyName || validatedData.organizationName || user.name
      await prisma.client.upsert({
        where: { userId: user.id },
        update: {
          company: companyName,
          purpose: purpose === "event_organizer" ? `Event Organizer — ${validatedData.organizerType || "General"}` : (validatedData.mainPurpose?.[0] || purpose),
          location: validatedData.city ? `${validatedData.city}, ${validatedData.country}` : null,
          website: validatedData.websiteUrl || null,
        },
        create: {
          userId: user.id,
          company: companyName,
          purpose: purpose === "event_organizer" ? `Event Organizer — ${validatedData.organizerType || "General"}` : (validatedData.mainPurpose?.[0] || purpose),
          location: validatedData.city ? `${validatedData.city}, ${validatedData.country}` : null,
          website: validatedData.websiteUrl || null,
        },
      })
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Welcome to FashionConnect",
          message: `Welcome to FashionConnect. Your ${purpose === "event_organizer" ? "event organizer" : "client"} profile is ready.`,
          type: "SYSTEM",
        },
      })
    } else if (role === Role.MARKETPLACE_PROVIDER) {
      const serviceCategory = purpose === "photographer"
        ? (validatedData.specialties?.[0] || "Photographer")
        : purpose === "designer"
        ? (validatedData.designFocus?.[0] || "Fashion Designer")
        : purpose === "studio"
        ? (validatedData.studioServices?.[0] || "Content Studio")
        : "General"
      const businessName = validatedData.businessName || validatedData.brandName || validatedData.studioName || user.name
      await prisma.marketplaceProvider.upsert({
        where: { userId: user.id },
        update: {
          businessName,
          serviceCategory,
          location: validatedData.city ? `${validatedData.city}, ${validatedData.country}` : "Kigali, Rwanda",
        },
        create: {
          userId: user.id,
          businessName,
          serviceCategory,
          location: validatedData.city ? `${validatedData.city}, ${validatedData.country}` : "Kigali, Rwanda",
        },
      })
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: "Welcome to FashionConnect Marketplace",
          message: `Welcome to FashionConnect Marketplace. Your ${purpose} profile is ready.`,
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
