import { config } from "dotenv"
config({ path: ".env.local", override: true })
import { PrismaClient, Role, UserStatus } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import bcrypt from "bcryptjs"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = "niyikizaoberto@gmail.com"
  const username = "Yakin-dev"
  const password = "ModelConnect@Admin2024"

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log("Admin user already exists:", existing.email)
    return
  }

  const hash = await bcrypt.hash(password, 12)
  const admin = await prisma.user.create({
    data: {
      email,
      username,
      name: "Yakin",
      firstName: "Yakin",
      lastName: "",
      password: hash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      onboardingCompleted: true,
    },
  })

  console.log("Admin user created:", admin.email, "| role:", admin.role)
  console.log("Login with email:", email)
  console.log("Default password:", password)
  console.log("IMPORTANT: Change the password after first login.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
