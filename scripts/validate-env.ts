/**
 * Environment Variable Validation.
 *
 * Run this at application startup to ensure all required environment
 * variables are set. Prints clear error messages for missing values.
 *
 * Usage: npx tsx scripts/validate-env.ts
 */

const REQUIRED_ENV_VARS = [
  { name: "DATABASE_URL", description: "PostgreSQL connection string (Neon pooler URL)" },
  { name: "DIRECT_DATABASE_URL", description: "Direct PostgreSQL connection string (for migrations)" },
  { name: "NEXT_PUBLIC_APP_URL", description: "Public app URL (e.g., https://fashionconnect.africa)" },
  { name: "CLOUDINARY_CLOUD_NAME", description: "Cloudinary cloud name for image uploads" },
  { name: "CLOUDINARY_API_KEY", description: "Cloudinary API key" },
  { name: "CLOUDINARY_API_SECRET", description: "Cloudinary API secret" },
] as const

const MISSING: string[] = []

for (const { name, description } of REQUIRED_ENV_VARS) {
  if (!process.env[name]) {
    MISSING.push(`  ❌ ${name} — ${description}`)
  }
}

if (MISSING.length > 0) {
  console.error("\n❌ Missing required environment variables:\n")
  for (const msg of MISSING) {
    console.error(msg)
  }
  console.error(
    `\n  Tip: Copy .env.example to .env and fill in the values, ` +
    `or set them in your hosting dashboard.\n`
  )
  process.exit(1)
} else {
  console.log("✅ All required environment variables are set.")
}
