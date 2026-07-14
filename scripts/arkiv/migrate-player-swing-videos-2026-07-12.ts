/**
 * scripts/migrate-player-swing-videos-2026-07-12.ts
 *
 * Kirurgisk additiv migrasjon (gotchas.md): schema.prisma har hatt
 * PlayerSwingVideo (player_swing_videos) og SwingAnalysis (swing_analyses),
 * men tabellene ble aldri opprettet i databasen — schema-drift-klasse #3
 * (samme som plan_actions.coachId og groups.maxParticipants). Funnet under
 * spiller-dashboard-byggingen 12. juli; godkjent av Anders («JA»).
 *
 * KUN CREATE TABLE IF NOT EXISTS + indekser — rører ingen andre tabeller.
 * Kjøres med: npx tsx scripts/migrate-player-swing-videos-2026-07-12.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "player_swing_videos" (
      "id"              TEXT NOT NULL,
      "userId"          TEXT NOT NULL,
      "liveSessionId"   TEXT,
      "liveSessionKind" TEXT,
      "videoUrl"        TEXT NOT NULL,
      "storagePath"     TEXT,
      "drillId"         TEXT,
      "status"          TEXT NOT NULL DEFAULT 'PROCESSING',
      "consentVerified" BOOLEAN NOT NULL DEFAULT false,
      "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"       TIMESTAMP(3) NOT NULL,
      CONSTRAINT "player_swing_videos_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "player_swing_videos_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS "player_swing_videos_userId_createdAt_idx" ON "player_swing_videos"("userId", "createdAt")`,
  );

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "swing_analyses" (
      "id"             TEXT NOT NULL,
      "videoId"        TEXT NOT NULL,
      "status"         TEXT NOT NULL DEFAULT 'PENDING',
      "positions"      JSONB,
      "trackManShotId" TEXT,
      "summary"        TEXT,
      "confidence"     DOUBLE PRECISION,
      "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt"      TIMESTAMP(3) NOT NULL,
      CONSTRAINT "swing_analyses_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "swing_analyses_videoId_fkey" FOREIGN KEY ("videoId")
        REFERENCES "player_swing_videos"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX IF NOT EXISTS "swing_analyses_videoId_key" ON "swing_analyses"("videoId")`,
  );

  for (const t of ["player_swing_videos", "swing_analyses"]) {
    const rows = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${t}'`,
    );
    if (rows.length !== 1) throw new Error(`Verifisering feilet for ${t}`);
    console.log(`OK: ${t}`);
  }
  console.log("Ferdig — begge tabellene er på plass.");
}

main()
  .catch((e) => { console.error("FEIL:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
