import { config } from "dotenv"
config({ path: ".env.local", override: true })
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const result = await prisma.$executeRaw`DELETE FROM "User" WHERE "clerkUserId" IS NOT NULL`
  console.log("Deleted", result, "Clerk users")
}
main().catch(console.error).finally(() => prisma.$disconnect())
