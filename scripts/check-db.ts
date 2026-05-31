import "dotenv/config";
import { PrismaClient } from "@prisma/client";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL is not set in environment variables!");
    process.exit(1);
  }

  // Safe preview of URL
  const maskedUrl = dbUrl.replace(/:[^:@]+@/, ":****@");
  console.log(`📡 Attempting connection using preview URL: ${maskedUrl}`);

  const prisma = new PrismaClient();

  try {
    // Basic connectivity test
    console.log("🔄 Querying the 'User' database table...");
    const usersCount = await prisma.user.count();
    console.log(`✅ Connection established! User count: ${usersCount}`);

    console.log("👥 Fetching latest 5 users...");
    const users = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    });

    if (users.length === 0) {
      console.log("ℹ️ No users registered in the database yet.");
    } else {
      users.forEach((user, i) => {
        console.log(`[${i + 1}] ID: ${user.id} | Name: ${user.name} | Email: ${user.email} | Role: ${user.role}`);
      });
    }
  } catch (error) {
    console.error("❌ Database connection check failed!");
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
