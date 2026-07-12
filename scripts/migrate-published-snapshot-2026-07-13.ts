/**
 * WB4 (plan Del 8b): training_plans += publishedSnapshot JSONB — snapshot av
 * øktene ved forrige publisering, grunnlag for diff-modalen. Additivt.
 * Kjøres: npx tsx scripts/migrate-published-snapshot-2026-07-13.ts
 */
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL! }) });
async function main() {
  await prisma.$executeRawUnsafe(`ALTER TABLE "training_plans" ADD COLUMN IF NOT EXISTS "publishedSnapshot" JSONB`);
  const k = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'training_plans' AND column_name = 'publishedSnapshot'`,
  );
  if (k.length !== 1) throw new Error("Verifisering feilet");
  console.log("OK: training_plans.publishedSnapshot");
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
