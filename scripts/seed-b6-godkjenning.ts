/**
 * Seed én PUBLISHED WorkbenchSession i dag for screentest@akgolf.test med
 * needsPlayerApproval=true (origin COACH) — for skjermbilde-gate på B6
 * (godkjenning/avvis). Idempotent: rører kun en rad merket med fast id.
 *
 * Kjør: npx tsx scripts/seed-b6-godkjenning.ts
 */
import "./_env";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const FIXED_ID = "b6gate0000000000000player";

async function main() {
  const player = await prisma.user.findUnique({ where: { email: "screentest@akgolf.test" } });
  const coach = await prisma.user.findUnique({ where: { email: "coachtest@akgolf.test" } });
  if (!player || !coach) {
    console.error("Fant ikke screentest@akgolf.test eller coachtest@akgolf.test");
    process.exit(1);
  }

  const today = new Date();
  const dateCol = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

  // Raw SQL — unngår avhengighet av generert klient med hiddenByPlayer-feltet
  // (denne scripten kjøres fra main, mens feltet foreløpig kun er i schema.prisma på B6-grenen).
  await prisma.$executeRawUnsafe(
    `INSERT INTO workbench_sessions
       (id, "playerId", "coachId", date, "startMinute", "durationMinutes", title, pyramid,
        "blockType", status, origin, "needsPlayerApproval", "approvalStatus", "hiddenByPlayer",
        "publishedAt", "publishedBy", "createdBy", "createdAt", "updatedAt")
     VALUES
       ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, now(), $15, $16, now(), now())
     ON CONFLICT (id) DO UPDATE SET
       status = EXCLUDED.status,
       "needsPlayerApproval" = EXCLUDED."needsPlayerApproval",
       "approvalStatus" = EXCLUDED."approvalStatus",
       "hiddenByPlayer" = EXCLUDED."hiddenByPlayer",
       date = EXCLUDED.date;`,
    FIXED_ID,
    player.id,
    coach.id,
    dateCol,
    9 * 60,
    60,
    "Wedge-økt 40-80m (B6 skjermbilde-gate)",
    "TEK",
    "OEKT",
    "PUBLISHED",
    "COACH",
    true,
    "PENDING",
    false,
    coach.id,
    "COACH",
  );

  console.log(`OK: seedet WorkbenchSession ${FIXED_ID} for ${player.email} (venter godkjenning)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
