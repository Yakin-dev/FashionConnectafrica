import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

/**
 * Find a model by slug or ID with full includes.
 */
export async function findModelWithIncludes(slugOrId: string) {
  // Try slug first
  const bySlug = await prisma.model.findFirst({
    where: { slug: slugOrId },
    include: {
      user: { include: { profile: true } },
      agency: { select: { name: true, logoUrl: true, isVerified: true } },
      reviews: true,
      applications: {
        include: { casting: { select: { title: true, location: true } } },
        take: 10,
        orderBy: { appliedAt: "desc" },
      },
      portfolioMedia: { orderBy: { sortOrder: "asc" } },
    },
  })
  if (bySlug) return bySlug

  // Fall back to ID
  return prisma.model.findUnique({
    where: { id: slugOrId },
    include: {
      user: { include: { profile: true } },
      agency: { select: { name: true, logoUrl: true, isVerified: true } },
      reviews: true,
      applications: {
        include: { casting: { select: { title: true, location: true } } },
        take: 10,
        orderBy: { appliedAt: "desc" },
      },
      portfolioMedia: { orderBy: { sortOrder: "asc" } },
    },
  })
}

/**
 * Find a model by slug or ID with minimal select (for metadata).
 */
export async function findModelForMetadata(slugOrId: string) {
  const bySlug = await prisma.model.findFirst({
    where: { slug: slugOrId },
    select: {
      id: true, slug: true, professionalName: true, categories: true,
      bio: true, profileImageUrl: true, height: true, experienceLevel: true,
      nationality: true,
      user: { select: { name: true } },
      agency: { select: { name: true } },
    },
  })
  if (bySlug) return bySlug

  return prisma.model.findUnique({
    where: { id: slugOrId },
    select: {
      id: true, slug: true, professionalName: true, categories: true,
      bio: true, profileImageUrl: true, height: true, experienceLevel: true,
      nationality: true,
      user: { select: { name: true } },
      agency: { select: { name: true } },
    },
  })
}

/**
 * Find an agency by slug or ID.
 */
export async function findAgencyByIdOrSlug(slugOrId: string, include?: Prisma.AgencyInclude) {
  const bySlug = await prisma.agency.findFirst({
    where: { slug: slugOrId },
    include,
  })
  if (bySlug) return bySlug

  return prisma.agency.findUnique({
    where: { id: slugOrId },
    include,
  })
}

/**
 * Find an agency by slug or ID with minimal select (for metadata).
 */
export async function findAgencyForMetadata(slugOrId: string) {
  const bySlug = await prisma.agency.findFirst({
    where: { slug: slugOrId },
    select: { id: true, slug: true, name: true, location: true, description: true, logoUrl: true, _count: { select: { models: true } } },
  })
  if (bySlug) return bySlug

  return prisma.agency.findUnique({
    where: { id: slugOrId },
    select: { id: true, slug: true, name: true, location: true, description: true, logoUrl: true, _count: { select: { models: true } } },
  })
}
