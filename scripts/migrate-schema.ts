import { config } from "dotenv"
config({ path: ".env.local", override: true })
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const migrations = [
  `ALTER TABLE "User" DROP COLUMN IF EXISTS "clerkUserId"`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "firstName" TEXT`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastName" TEXT`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT`,
  `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3)`,
  `DO $$ BEGIN
     IF NOT EXISTS (
       SELECT 1 FROM pg_indexes WHERE tablename='User' AND indexname='User_username_key'
     ) THEN
       ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE ("username");
     END IF;
   END $$`,
]

async function main() {
  console.log("Connecting...")
  for (const sql of migrations) {
    await prisma.$executeRawUnsafe(sql)
    console.log("OK:", sql.slice(0, 70).replace(/\n\s+/g, " "))
  }
  console.log("\nMigration complete.")
}

main().catch(console.error).finally(() => prisma.$disconnect())
