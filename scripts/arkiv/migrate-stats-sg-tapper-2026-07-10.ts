/**
 * scripts/migrate-stats-sg-tapper-2026-07-10.ts
 *
 * Additiv, kirurgisk migrasjon for stats-pakken (plan gj-r-n-en-komplett):
 * - rounds.sgSource TEXT ('manual' | 'beregnet') + backfill 'manual' der
 *   sgTotal allerede finnes (alt historisk er håndtastet — beskyttes mot
 *   overskriving av SG-autoberegning).
 * - shots.targetX / shots.targetY DOUBLE PRECISION — valgfri siktelinje
 *   (UpGame-mønsteret: dispersjon mot intensjon). Samme GPS-konvensjon som
 *   startX/endX (X=lng, Y=lat, jf. lib/baneguide/shot-coords.ts).
 * - Ny tabell session_ball_logs — persistert live-tapper (baller per kølle
 *   per plan-økt). Absolutt count + UNIQUE(planSessionId, club) → idempotent
 *   upsert fra klienten.
 * Rører KUN egne kolonner/tabeller. Idempotent (IF NOT EXISTS).
 * Kjøres mot DIRECT_URL via PrismaPg. ALDRI migrate dev/db push.
 *
 * Kjøres med: npx tsx scripts/migrate-stats-sg-tapper-2026-07-10.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const STEPS: string[] = [
  `ALTER TABLE "rounds" ADD COLUMN IF NOT EXISTS "sgSource" TEXT`,
  `UPDATE "rounds" SET "sgSource" = 'manual' WHERE "sgTotal" IS NOT NULL AND "sgSource" IS NULL`,
  `ALTER TABLE "shots" ADD COLUMN IF NOT EXISTS "targetX" DOUBLE PRECISION`,
  `ALTER TABLE "shots" ADD COLUMN IF NOT EXISTS "targetY" DOUBLE PRECISION`,
  `CREATE TABLE IF NOT EXISTS "session_ball_logs" (
    "id" TEXT PRIMARY KEY,
    "planSessionId" TEXT NOT NULL,
    "club" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "session_ball_logs_session_club_key" UNIQUE ("planSessionId", "club")
  )`,
  `CREATE INDEX IF NOT EXISTS "session_ball_logs_planSessionId_idx" ON "session_ball_logs"("planSessionId")`,
];

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");

  for (const sql of STEPS) {
    const res = await prisma.$executeRawUnsafe(sql);
    console.log("OK:", sql.replace(/\s+/g, " ").slice(0, 90), typeof res === "number" ? `(${res} rader)` : "");
  }

  // Etter-verifisering
  const rounds = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'rounds' AND column_name = 'sgSource'`,
  );
  const shots = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'shots' AND column_name IN ('targetX','targetY')`,
  );
  const ballTabell = await prisma.$queryRawUnsafe<{ table_name: string }[]>(
    `SELECT table_name FROM information_schema.tables WHERE table_name = 'session_ball_logs'`,
  );
  console.log(
    `rounds.sgSource: ${rounds.length}/1 · shots.targetX/Y: ${shots.length}/2 · session_ball_logs: ${ballTabell.length}/1`,
  );
  if (rounds.length !== 1 || shots.length !== 2 || ballTabell.length !== 1) {
    throw new Error("Verifisering feilet");
  }
  console.log("Ferdig — sgSource, target-koordinater og ball-logg er på plass.");
}

main()
  .catch((e) => {
    console.error("FEIL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
