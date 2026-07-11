import { prisma } from "@/lib/prisma"
import { buildModelMetadata, personSchema, breadcrumbSchema } from "@/lib/seo"
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import ModelProfileClient from "./model-client"

export const dynamic = "force-dynamic"

async function findModelForMetadata(slugOrId: string) {
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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id: slugOrId } = await params
    const model = await findModelForMetadata(slugOrId)
    if (!model) return {}
    return buildModelMetadata({
      id: model.id,
      slug: model.slug || undefined,
      name: model.user.name,
      professionalName: model.professionalName,
      categories: model.categories,
      location: model.nationality || undefined,
      bio: model.bio || undefined,
      profileImageUrl: model.profileImageUrl,
      agencyName: model.agency?.name,
      height: model.height,
      experienceLevel: model.experienceLevel,
    })
  } catch {
    return {}
  }
}

export default async function ModelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: slugOrId } = await params

  // Single query with OR for both slug and ID
  const resolvedModel = await prisma.model.findFirst({
    where: {
      OR: [
        { id: slugOrId },
        { slug: slugOrId },
      ],
    },
    select: {
      id: true, slug: true, professionalName: true, categories: true,
      bio: true, profileImageUrl: true, height: true, experienceLevel: true,
      nationality: true,
      user: { select: { name: true } },
      agency: { select: { name: true } },
    },
  })

  if (!resolvedModel) notFound()

  // 301 redirect to canonical slug URL if accessed by ID
  if (resolvedModel.slug && slugOrId === resolvedModel.id && resolvedModel.slug !== slugOrId) {
    redirect(`/models/${resolvedModel.slug}`)
  }

  const user = resolvedModel.user
  const agency = resolvedModel.agency
  const displayId = resolvedModel.slug || resolvedModel.id

  const jsonLdPerson = personSchema({
    id: resolvedModel.id,
    slug: resolvedModel.slug || undefined,
    name: user.name,
    professionalName: resolvedModel.professionalName,
    categories: resolvedModel.categories,
    location: resolvedModel.nationality || undefined,
    bio: resolvedModel.bio || undefined,
    profileImageUrl: resolvedModel.profileImageUrl,
    agencyName: agency?.name,
    height: resolvedModel.height,
    experienceLevel: resolvedModel.experienceLevel,
  })

  const jsonLdBreadcrumb = breadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Models", url: "/models" },
    { name: resolvedModel.professionalName || user.name, url: `/models/${displayId}` },
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumb) }}
      />
      <ModelProfileClient id={resolvedModel.id} />
    </>
  )
}
