import { z } from "zod"

// ─── Config ───────────────────────────────────────────────────────────
export const MIN_AGENCY_OPERATION_MONTHS = 12

// ─── Shared helpers ────────────────────────────────────────────────────
const emailField = z.string().email("Enter a valid business email address.")
const phoneField = z.string().min(6, "Phone number is required. Include country code.")
const countryField = z.string().min(1, "Country is required.")
const cityField = z.string().min(1, "City is required.")
const websiteField = z.string().url("Add a valid public website, Instagram, LinkedIn, or portfolio link.").or(z.literal(""))
const nameField = (label: string) => z.string().min(1, `${label} is required.`).max(200)
const contactNameField = z.string().min(1, "Contact person full name is required.").max(200)
const contactRoleField = z.string().min(1, "Contact person role is required.")
const confirmationField = (message: string) => z.literal(true, { message })
const descriptionField = (min: number, label: string) =>
  z.string().min(min, `Please describe your ${label} in at least ${min} characters.`).max(800)

// ─── Role 1: Model Agency ──────────────────────────────────────────────
const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: currentYear - 1990 + 1 }, (_, i) => String(1990 + i))

export const agencySchema = z.object({
  // 0. Logo URL (required — uploaded via Cloudinary)
  logoUrl: z.string().min(1, "Agency branding logo is required. Please upload your agency logo."),
  // 1. Legal name
  legalName: nameField("Agency name"),
  // 2. Public name (optional)
  publicName: z.string().max(200).optional(),
  // 3. Year established
  establishedYear: z.string().min(1, "Please select your agency's year of establishment.")
    .refine((v) => YEAR_OPTIONS.includes(v), { message: "Select a valid year." }),
  // 5. Registration status
  registrationStatus: z.string().min(1, "Select your business registration status."),
  // 6. Registration number (conditional)
  registrationNumber: z.string().optional(),
  // 7-9. Location
  country: countryField,
  city: cityField,
  address: z.string().min(1, "Registered business address is required.").max(300),
  // 10-11. Contact
  email: emailField,
  phone: phoneField,
  // 12. Website
  websiteUrl: websiteField.optional(),
  // 13. Instagram handle (required)
  instagramUrl: z.string().min(1, "Agency Instagram handle or portfolio URL is required."),
  // 14. Model count
  representedModelCount: z.string().min(1, "Select approximate number of represented models."),
  // 15. Talent categories
  talentCategories: z.array(z.string()).min(1, "Select at least one talent category."),
  // 16. Services
  agencyServices: z.array(z.string()).min(1, "Select at least one primary service."),
  // 17. Description
  description: descriptionField(80, "agency"),
  // 18-19. Contact person
  contactPersonName: contactNameField,
  contactPersonRole: contactRoleField,
  // 20. Confirmation
  confirmation: confirmationField("You must confirm that you are authorized to represent this agency."),
})

export type AgencyFormData = z.infer<typeof agencySchema>

// Minimum months calculation
export function calculateOperationMonths(establishedYearStr: string): number {
  const year = parseInt(establishedYearStr, 10)
  if (isNaN(year)) return 0
  const now = new Date()
  return (now.getFullYear() - year) * 12 + now.getMonth()
}

export function getAgencyAgeError(operationMonths: number): string | null {
  if (operationMonths < MIN_AGENCY_OPERATION_MONTHS) {
    return "FashionConnectAfrica currently accepts agencies with at least 12 months of operating history. Please return once your agency reaches one full year of operation."
  }
  return null
}

// ─── Role 2: Brand / Client ────────────────────────────────────────────
export const clientSchema = z.object({
  companyName: nameField("Company or brand name"),
  businessType: z.string().min(1, "Select your business type."),
  country: countryField,
  city: cityField,
  email: emailField,
  phone: phoneField,
  websiteUrl: z.string().min(1, "A valid professional link is required."),
  mainPurpose: z.array(z.string()).min(1, "Select at least one purpose."),
  projectTypes: z.array(z.string()).min(1, "Select at least one project type."),
  hiringFrequency: z.string().min(1, "Select estimated hiring frequency."),
  contactPersonName: contactNameField,
  contactPersonRole: z.string().min(1, "Contact person job title is required."),
  description: descriptionField(50, "company or project"),
  confirmation: confirmationField("You must confirm you are authorized to act for this company."),
})

export type ClientFormData = z.infer<typeof clientSchema>

// ─── Role 3: Event Organizer ───────────────────────────────────────────
export const eventOrganizerSchema = z.object({
  organizationName: nameField("Organization or event company name"),
  organizerType: z.string().min(1, "Select organizer type."),
  country: countryField,
  city: cityField,
  email: emailField,
  phone: phoneField,
  websiteUrl: websiteField.optional(),
  eventScale: z.string().min(1, "Select event scale."),
  eventFrequency: z.string().min(1, "Select typical event frequency."),
  requiredServices: z.array(z.string()).min(1, "Select at least one service usually required."),
  nextEventDate: z.string().optional(),
  description: descriptionField(60, "organization"),
  contactPersonName: contactNameField,
  contactPersonRole: contactRoleField,
  confirmation: confirmationField("You must confirm you are authorized to create opportunities for this organization."),
})

export type EventOrganizerFormData = z.infer<typeof eventOrganizerSchema>

// ─── Role 4: Photographer ──────────────────────────────────────────────
export const photographerSchema = z.object({
  businessName: nameField("Photographer name or studio name"),
  businessType: z.string().min(1, "Select business type."),
  country: countryField,
  city: cityField,
  email: emailField,
  phone: phoneField,
  portfolioUrl: z.string().min(1, "Portfolio URL is required."),
  specialties: z.array(z.string()).min(1, "Select at least one photography specialty."),
  experienceLevel: z.string().min(1, "Select years of professional experience."),
  serviceArea: z.string().min(1, "Select typical service area."),
  startingPriceRange: z.string().optional(),
  description: descriptionField(60, "professional background"),
  confirmation: confirmationField("You must confirm the portfolio and business information belong to you."),
})

export type PhotographerFormData = z.infer<typeof photographerSchema>

// ─── Role 5: Fashion Designer ──────────────────────────────────────────
export const designerSchema = z.object({
  brandName: nameField("Designer name or label / brand name"),
  businessType: z.string().min(1, "Select business type."),
  country: countryField,
  city: cityField,
  email: emailField,
  phone: phoneField,
  websiteUrl: z.string().min(1, "Website, Instagram, or portfolio URL is required."),
  designFocus: z.array(z.string()).min(1, "Select at least one design focus."),
  servicesOffered: z.array(z.string()).min(1, "Select at least one service offered."),
  experienceLevel: z.string().min(1, "Select years of professional experience."),
  productionCapacity: z.string().min(1, "Select typical production capacity."),
  description: descriptionField(80, "brand"),
  confirmation: confirmationField("You must confirm you own or are authorized to represent this fashion label."),
})

export type DesignerFormData = z.infer<typeof designerSchema>

// ─── Role 6: Content Studio Owner ──────────────────────────────────────
export const studioSchema = z.object({
  studioName: nameField("Studio name"),
  country: countryField,
  city: cityField,
  address: z.string().min(1, "Physical studio address is required.").max(300),
  email: emailField,
  phone: phoneField,
  websiteUrl: z.string().min(1, "Website, Instagram, or portfolio URL is required."),
  studioServices: z.array(z.string()).min(1, "Select at least one studio service."),
  studioFacilities: z.array(z.string()).min(1, "Select at least one studio facility."),
  studioAvailability: z.string().min(1, "Select studio availability."),
  capacity: z.string().min(1, "Select studio capacity."),
  description: descriptionField(80, "studio"),
  confirmation: confirmationField("You must confirm you own or are authorized to represent this studio."),
})

export type StudioFormData = z.infer<typeof studioSchema>

// ─── Role 7: Makeup Artist ──────────────────────────────────────────────
export const makeupArtistSchema = z.object({
  professionalName: nameField("Professional name or beauty business name"),
  businessType: z.string().min(1, "Select business type."),
  country: countryField,
  city: cityField,
  email: emailField,
  phone: phoneField,
  portfolioUrl: z.string().min(1, "Instagram or portfolio URL is required."),
  specialties: z.array(z.string()).min(1, "Select at least one makeup specialty."),
  experienceLevel: z.string().min(1, "Select years of professional experience."),
  serviceArea: z.string().min(1, "Select typical service area."),
  startingPriceRange: z.string().optional(),
  description: descriptionField(60, "professional background"),
  confirmation: confirmationField("You must confirm the portfolio and business information belong to you."),
})
export type MakeupArtistFormData = z.infer<typeof makeupArtistSchema>

// ─── Role 8: Fashion Stylist ────────────────────────────────────────────
export const fashionStylistSchema = z.object({
  professionalName: nameField("Professional name or styling business name"),
  country: countryField,
  city: cityField,
  email: emailField,
  phone: phoneField,
  portfolioUrl: z.string().min(1, "Portfolio, Instagram, or website URL is required."),
  stylingServices: z.array(z.string()).min(1, "Select at least one styling service."),
  styleSpecialties: z.array(z.string()).min(1, "Select at least one style specialty."),
  experienceLevel: z.string().min(1, "Select years of professional experience."),
  serviceArea: z.string().min(1, "Select typical service area."),
  description: descriptionField(60, "professional background"),
  confirmation: confirmationField("You must confirm the portfolio and business information belong to you."),
})
export type FashionStylistFormData = z.infer<typeof fashionStylistSchema>

// ─── Role 9: Hair Stylist ───────────────────────────────────────────────
export const hairStylistSchema = z.object({
  professionalName: nameField("Professional name or salon/studio name"),
  country: countryField,
  city: cityField,
  email: emailField,
  phone: phoneField,
  portfolioUrl: z.string().min(1, "Website or portfolio URL is required."),
  specialties: z.array(z.string()).min(1, "Select at least one hair specialty."),
  experienceLevel: z.string().min(1, "Select years of professional experience."),
  serviceArea: z.string().min(1, "Select typical service area."),
  description: descriptionField(60, "professional background"),
  confirmation: confirmationField("You must confirm the portfolio and business information belong to you."),
})
export type HairStylistFormData = z.infer<typeof hairStylistSchema>

// ─── Role 10: Videographer / Production Studio ─────────────────────────
export const videographerSchema = z.object({
  professionalName: nameField("Professional or studio name"),
  country: countryField,
  city: cityField,
  email: emailField,
  phone: phoneField,
  portfolioUrl: z.string().min(1, "Portfolio or video reel URL is required."),
  specialties: z.array(z.string()).min(1, "Select at least one video specialty."),
  experienceLevel: z.string().min(1, "Select years of professional experience."),
  serviceArea: z.string().min(1, "Select typical service area."),
  description: descriptionField(60, "professional background"),
  confirmation: confirmationField("You must confirm the portfolio and business information belong to you."),
})
export type VideographerFormData = z.infer<typeof videographerSchema>

// ─── Role-specific field options (shared with UI) ───────────────────────
export const FIELD_OPTIONS = {
  registrationStatus: [
    { value: "Registered business", label: "Registered business" },
    { value: "Registered sole proprietor", label: "Registered sole proprietor" },
    { value: "Partnership", label: "Partnership" },
    { value: "Not yet formally registered", label: "Not yet formally registered" },
  ],
  representedModelCount: [
    { value: "1-5", label: "1–5" },
    { value: "6-15", label: "6–15" },
    { value: "16-30", label: "16–30" },
    { value: "31-50", label: "31–50" },
    { value: "51+", label: "51+" },
  ],
  talentCategories: [
    "Runway", "Editorial", "Commercial", "Beauty", "Fitness",
    "Child/teen talent", "Influencers", "Actors", "Other",
  ],
  agencyServices: [
    "Talent representation", "Casting support", "Talent development",
    "Runway coaching", "Brand campaign management", "Event talent supply", "Other",
  ],
  contactRoles: [
    { value: "Founder", label: "Founder" },
    { value: "Director", label: "Director" },
    { value: "Talent manager", label: "Talent manager" },
    { value: "Booking manager", label: "Booking manager" },
    { value: "Operations manager", label: "Operations manager" },
    { value: "Authorized representative", label: "Authorized representative" },
    { value: "Other", label: "Other" },
  ],
  clientBusinessTypes: [
    { value: "Fashion brand", label: "Fashion brand" },
    { value: "Retailer", label: "Retailer" },
    { value: "Beauty brand", label: "Beauty brand" },
    { value: "Media company", label: "Media company" },
    { value: "Advertising agency", label: "Advertising agency" },
    { value: "Film / music production", label: "Film / music production" },
    { value: "Hospitality brand", label: "Hospitality brand" },
    { value: "Corporate organization", label: "Corporate organization" },
    { value: "Personal client", label: "Personal client" },
    { value: "Other", label: "Other" },
  ],
  clientPurposes: [
    "Hire agency-represented models",
    "Post casting opportunities",
    "Find photographers",
    "Find fashion designers",
    "Find makeup artists",
    "Find stylists",
    "Find studios",
    "Build long-term creative partnerships",
  ],
  projectTypes: [
    "Fashion campaign", "Product shoot", "Runway event", "Editorial shoot",
    "Commercial advertisement", "Music video", "Film production",
    "Brand launch", "Other",
  ],
  hiringFrequencies: [
    { value: "One-time project", label: "One-time project" },
    { value: "A few times per year", label: "A few times per year" },
    { value: "Monthly", label: "Monthly" },
    { value: "Ongoing projects", label: "Ongoing projects" },
  ],
  organizerTypes: [
    { value: "Fashion week organizer", label: "Fashion week organizer" },
    { value: "Runway show organizer", label: "Runway show organizer" },
    { value: "Beauty pageant organizer", label: "Beauty pageant organizer" },
    { value: "Brand event organizer", label: "Brand event organizer" },
    { value: "Wedding / private event organizer", label: "Wedding / private event organizer" },
    { value: "Festival organizer", label: "Festival organizer" },
    { value: "Corporate event organizer", label: "Corporate event organizer" },
    { value: "Production company", label: "Production company" },
    { value: "Other", label: "Other" },
  ],
  eventScales: [
    { value: "Small private event", label: "Small private event" },
    { value: "Local public event", label: "Local public event" },
    { value: "National event", label: "National event" },
    { value: "Regional event", label: "Regional event" },
    { value: "International event", label: "International event" },
  ],
  eventFrequencies: [
    { value: "One-time event", label: "One-time event" },
    { value: "Annual event", label: "Annual event" },
    { value: "Several events per year", label: "Several events per year" },
    { value: "Monthly events", label: "Monthly events" },
  ],
  requiredServices: [
    "Model agencies", "Runway models", "Fashion designers", "Photographers",
    "Videographers", "Makeup artists", "Stylists", "Event studios", "Other",
  ],
  photographerBusinessTypes: [
    { value: "Independent photographer", label: "Independent photographer" },
    { value: "Photography studio", label: "Photography studio" },
    { value: "Production company", label: "Production company" },
  ],
  photographySpecialties: [
    "Fashion editorial", "Runway", "Studio portrait", "Product photography",
    "Beauty", "Commercial campaigns", "Event photography", "Lookbooks", "Other",
  ],
  experienceLevels: [
    { value: "Less than 1 year", label: "Less than 1 year" },
    { value: "1-2 years", label: "1–2 years" },
    { value: "3-5 years", label: "3–5 years" },
    { value: "6-10 years", label: "6–10 years" },
    { value: "More than 10 years", label: "More than 10 years" },
  ],
  serviceAreas: [
    { value: "My city only", label: "My city only" },
    { value: "Nationwide", label: "Nationwide" },
    { value: "East Africa", label: "East Africa" },
    { value: "International", label: "International" },
  ],
  priceRanges: [
    { value: "", label: "Prefer not to say" },
    { value: "Under $200", label: "Under $200" },
    { value: "$200-$500", label: "$200–$500" },
    { value: "$500-$1,000", label: "$500–$1,000" },
    { value: "$1,000-$3,000", label: "$1,000–$3,000" },
    { value: "$3,000-$10,000", label: "$3,000–$10,000" },
    { value: "$10,000+", label: "$10,000+" },
  ],
  designerBusinessTypes: [
    { value: "Independent designer", label: "Independent designer" },
    { value: "Fashion label", label: "Fashion label" },
    { value: "Couture house", label: "Couture house" },
    { value: "Tailor / custom designer", label: "Tailor / custom designer" },
    { value: "Ready-to-wear brand", label: "Ready-to-wear brand" },
    { value: "Costume designer", label: "Costume designer" },
    { value: "Other", label: "Other" },
  ],
  designFocus: [
    "Couture", "Ready-to-wear", "Bridal", "Menswear", "Womenswear",
    "Streetwear", "Cultural / traditional wear", "Accessories",
    "Costume design", "Sustainable fashion", "Other",
  ],
  designServices: [
    "Custom garments", "Collection design", "Styling", "Costume design",
    "Fashion show collaboration", "Brand campaign styling", "Alterations", "Other",
  ],
  productionCapacities: [
    { value: "Individual custom orders", label: "Individual custom orders" },
    { value: "Small-batch production", label: "Small-batch production" },
    { value: "Medium-scale production", label: "Medium-scale production" },
    { value: "Large production orders", label: "Large production orders" },
    { value: "Collaboration only", label: "Collaboration only" },
  ],
  studioServices: [
    "Fashion photography", "Videography", "Reels / short-form content",
    "Product photography", "Podcast / interview space",
    "Runway rehearsal space", "Makeup space", "Equipment rental",
    "Editing services", "Other",
  ],
  studioFacilities: [
    "Professional lighting", "Backdrops", "Changing room", "Makeup station",
    "Sound equipment", "Camera equipment", "Editing suite", "Parking",
    "Accessible entrance", "Other",
  ],
  studioAvailabilities: [
    { value: "Weekdays", label: "Weekdays" },
    { value: "Weekends", label: "Weekends" },
    { value: "Both", label: "Both" },
    { value: "By appointment only", label: "By appointment only" },
  ],
  studioCapacities: [
    { value: "1-5 people", label: "1–5 people" },
    { value: "6-15 people", label: "6–15 people" },
    { value: "16-30 people", label: "16–30 people" },
    { value: "31+ people", label: "31+ people" },
  ],
  // ─── Makeup Artist options ─────────────────────────────────────
  makeupBusinessTypes: [
    { value: "Independent artist", label: "Independent artist" },
    { value: "Beauty studio", label: "Beauty studio" },
    { value: "Salon", label: "Salon" },
    { value: "Production team", label: "Production team" },
  ],
  makeupSpecialties: [
    "Editorial", "Runway", "Beauty", "Bridal", "Special event",
    "Commercial", "Film/video", "Creative makeup", "Other",
  ],
  // ─── Fashion Stylist options ───────────────────────────────────
  stylingServices: [
    "Editorial styling", "Personal styling", "Runway styling",
    "Campaign styling", "Costume styling", "Wardrobe consulting", "Other",
  ],
  styleSpecialties: [
    "Luxury", "Streetwear", "Cultural wear", "Bridal",
    "Commercial", "Celebrity styling", "Editorial", "Other",
  ],
  // ─── Hair Stylist options ──────────────────────────────────────
  hairSpecialties: [
    "Runway", "Editorial", "Bridal", "Natural hair",
    "Wigs / extensions", "Beauty campaigns", "Commercial shoots", "Other",
  ],
  // ─── Videographer options ──────────────────────────────────────
  videoSpecialties: [
    "Fashion films", "Runway videos", "Campaign films",
    "Social media reels", "Music video styling", "Event coverage",
    "Product video", "Documentary", "Other",
  ],
  contactRolesGeneric: [
    { value: "Founder", label: "Founder" },
    { value: "Director", label: "Director" },
    { value: "Manager", label: "Manager" },
    { value: "Coordinator", label: "Coordinator" },
    { value: "Authorized representative", label: "Authorized representative" },
    { value: "Other", label: "Other" },
  ],
  yearOptions: YEAR_OPTIONS,
} as const

export function getYearsSince(yearStr: string): number {
  const year = parseInt(yearStr, 10)
  if (isNaN(year)) return 0
  return new Date().getFullYear() - year
}
