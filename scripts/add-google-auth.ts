/**
 * One-time migration: adds the Account table and image column needed for Google OAuth.
 * Run with: npx tsx scripts/add-google-auth.ts
 */
import { config } from "dotenv"
config({ path: ".env.local", override: true })

import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Running Google OAuth migration…")

  // 1. Add `image` column to User (stores OAuth provider's profile picture URL)
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "image" TEXT
  `)
  console.log('✓ Added "image" column to User')

  // 2. Create Account table (links users to OAuth providers)
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Account" (
      "id"                TEXT NOT NULL,
      "userId"            TEXT NOT NULL,
      "type"              TEXT NOT NULL,
      "provider"          TEXT NOT NULL,
      "providerAccountId" TEXT NOT NULL,
      "refresh_token"     TEXT,
      "access_token"      TEXT,
      "expires_at"        INTEGER,
      "token_type"        TEXT,
      "scope"             TEXT,
      "id_token"          TEXT,
      "session_state"     TEXT,
      CONSTRAINT "Account_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "Account_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  console.log('✓ Created "Account" table')

  // 3. Unique index — prevents duplicate provider accounts per user
  await prisma.$executeRawUnsafe(`
    CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key"
    ON "Account"("provider", "providerAccountId")
  `)
  console.log('✓ Created unique index on Account(provider, providerAccountId)')

  console.log("\nMigration complete. Run `npx prisma generate` next to refresh TypeScript types.")
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
