import { prisma } from "@/lib/prisma"
import { buildAgencyMetadata, localBusinessSchema, breadcrumbSchema } from "@/lib/seo"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import AgencyDetailClient from "./agency-client"

export const dynamic = "force-dynamic"

async function findAgencyForMetadata(slugOrId: string) {
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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id: slugOrId } = await params
    const agency = await findAgencyForMetadata(slugOrId)
    if (!agency) return {}
    return buildAgencyMetadata({
      id: agency.id,
      slug: agency.slug || undefined,
      name: agency.name,
      location: agency.location,
      description: agency.description,
      logoUrl: agency.logoUrl,
      modelCount: agency._count.models,
    })
  } catch {
    return {}
  }
}

export default async function AgencyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slugOrId } = await params

  // Single query with OR for both slug and ID
  const resolvedAgency = await prisma.agency.findFirst({
    where: {
      OR: [
        { id: slugOrId },
        { slug: slugOrId },
      ],
    },
    select: { id: true, slug: true, name: true, location: true, description: true, logoUrl: true, _count: { select: { models: true } } },
  })

  if (!resolvedAgency) notFound()

  // 301 redirect to canonical slug URL if accessed by ID
  if (resolvedAgency.slug && slugOrId === resolvedAgency.id && resolvedAgency.slug !== slugOrId) {
    redirect(`/agencies/${resolvedAgency.slug}`)
  }

  const displayId = resolvedAgency.slug || resolvedAgency.id

  const jsonLdBusiness = localBusinessSchema({
    id: resolvedAgency.id,
    slug: resolvedAgency.slug || undefined,
    name: resolvedAgency.name,
    location: resolvedAgency.location,
    description: resolvedAgency.description,
    logoUrl: resolvedAgency.logoUrl,
    modelCount: resolvedAgency._count.models,
  })

  const jsonLdBreadcrumb = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Agencies", url: "/agencies" },
    { name: resolvedAgency.name, url: `/agencies/${displayId}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBusiness) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <AgencyDetailClient id={resolvedAgency.id} />
    </>
  )
}
