import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const count = await prisma.tournament.count();
  console.log("tournament count via current DATABASE_URL:", count);
  const raw = process.env.DATABASE_URL ?? "";
  const hostMatch = raw.match(/@([^/:]+)/);
  console.log("host (for verification only):", hostMatch ? hostMatch[1] : "(kunne ikke lese host)");
  await prisma.$disconnect();
}
main().catch(async (e) => {
  console.error("CONNECTION ERROR:", e instanceof Error ? e.message : e);
  await prisma.$disconnect();
});
