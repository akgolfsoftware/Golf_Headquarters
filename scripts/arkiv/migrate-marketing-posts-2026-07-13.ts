/**
 * M1 — kirurgisk additiv migrasjon: marketing_posts.
 * Mønster: gotchas.md (migrate dev/db push er blokkert) +
 * scripts/arkiv/migrate-monthly-reports-2026-07-13.ts.
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "marketing_posts" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "channel" TEXT NOT NULL,
      "scheduledAt" TIMESTAMP(3) NOT NULL,
      "brief" TEXT,
      "status" TEXT NOT NULL DEFAULT 'UTKAST',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "marketing_posts_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "marketing_posts_scheduledAt_idx" ON "marketing_posts"("scheduledAt")`,
  );
  console.log("marketing_posts OK");
}
main().finally(() => prisma.$disconnect());
