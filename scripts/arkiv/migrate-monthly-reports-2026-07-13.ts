/**
 * B5 — kirurgisk additiv migrasjon: monthly_reports.
 * Kjørt 2026-07-13. Mønster: gotchas.md (migrate dev/db push er blokkert).
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "monthly_reports" (
      "id" TEXT NOT NULL,
      "year" INTEGER NOT NULL,
      "month" INTEGER NOT NULL,
      "payload" JSONB NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "monthly_reports_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "monthly_reports_year_month_key" ON "monthly_reports"("year", "month")`,
  );
  console.log("monthly_reports OK");
}
main().finally(() => prisma.$disconnect());
