import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL is not set!");
    process.exit(1);
  }

  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ":****@");
  console.log(`✅ DATABASE_URL loaded: yes`);
  console.log(`📡 Preview: ${maskedUrl}`);

  const adapter = new PrismaPg({ connectionString: dbUrl });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("🔄 Querying User table...");
    const usersCount = await prisma.user.count();
    console.log(`✅ Connected! User count: ${usersCount}`);

    const users = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    if (users.length === 0) {
      console.log("ℹ️ No users in database yet.");
    } else {
      users.forEach((user, i) => {
        console.log(`[${i + 1}] ${user.name} | ${user.email} | ${user.role} | status: ${user.status}`);
      });
    }
  } catch (error) {
    console.error("❌ Database connection failed!");
    if (error instanceof Error) console.error(error.message);
    else console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
