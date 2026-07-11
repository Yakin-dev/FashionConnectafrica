/**
 * Slug generation utility for SEO-friendly URLs.
 *
 * Generates URL-safe, human-readable slugs from names.
 * Supports deduplication by appending a random suffix.
 */

/**
 * Convert a string to a URL-safe slug.
 * - Lowercases
 * - Replaces spaces/special chars with hyphens
 * - Removes leading/trailing hyphens
 * - Collapses multiple hyphens
 */
export function toSlug(text: string, maxLength = 80): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")       // Remove non-word chars (except spaces and hyphens)
    .replace(/[\s_]+/g, "-")        // Replace spaces and underscores with hyphens
    .replace(/-+/g, "-")            // Collapse multiple hyphens
    .replace(/^-+|-+$/g, "")        // Remove leading/trailing hyphens
    .slice(0, maxLength)
    .replace(/-+$/, "")             // Remove trailing hyphens after truncation
}

/**
 * Generate a unique slug by appending a random short suffix.
 * Used when initial slug collisions occur.
 */
export function makeUniqueSlug(baseSlug: string, suffix?: string): string {
  const s = suffix || Math.random().toString(36).substring(2, 6)
  return `${baseSlug}-${s}`
}

/**
 * Generate a slug from a model's professional name.
 */
export function modelSlug(professionalName: string, userId?: string): string {
  const base = toSlug(professionalName) || `model-${userId?.slice(0, 8) || "unknown"}`
  return base
}

/**
 * Generate a slug from an agency's name.
 */
export function agencySlug(name: string): string {
  const base = toSlug(name) || "agency"
  return base
}
