/**
 * scripts/migrate-coaching-session-live-2026-07-09.ts
 *
 * Additiv, kirurgisk migrasjon for live-coach-agent (jf. gotchas.md):
 * - coaching_sessions.liveSessionId TEXT — kobler CoachingSession til en konkret
 *   live treningsøkt (TrainingPlanSession.id eller TrainingSessionV2.id).
 * - coaching_sessions.liveSessionKind TEXT — "plan-session" | "session-v2".
 * - Index på liveSessionId + unik indeks på (userId, liveSessionId) for idempotent
 *   én-tråd-per-økt-oppslag.
 * Rører KUN egne kolonner — ingen drift. Idempotent (ADD COLUMN/CREATE INDEX IF NOT
 * EXISTS). Nye kolonner er NULL for alle eksisterende rader, og unik-indeksen kan
 * ikke kollidere (Postgres behandler NULL som distinkt i unique-indekser).
 * Kjøres mot DIRECT_URL via PrismaPg. ALDRI migrate dev/db push.
 *
 * Kjøres med: npx tsx scripts/migrate-coaching-session-live-2026-07-09.ts
 */

import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

const ALTERS: string[] = [
  `ALTER TABLE "coaching_sessions" ADD COLUMN IF NOT EXISTS "liveSessionId" TEXT`,
  `ALTER TABLE "coaching_sessions" ADD COLUMN IF NOT EXISTS "liveSessionKind" TEXT`,
  `CREATE INDEX IF NOT EXISTS "coaching_sessions_liveSessionId_idx" ON "coaching_sessions" ("liveSessionId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "coaching_sessions_userId_liveSessionId_key" ON "coaching_sessions" ("userId", "liveSessionId")`,
];

async function main() {
  if (!process.env.DIRECT_URL) throw new Error("DIRECT_URL mangler i .env.local");

  for (const sql of ALTERS) {
    await prisma.$executeRawUnsafe(sql);
    console.log("OK:", sql.replace(/\s+/g, " ").slice(0, 100));
  }

  // Etter-verifisering
  const kolonner = await prisma.$queryRawUnsafe<{ column_name: string }[]>(
    `SELECT column_name FROM information_schema.columns
     WHERE table_name = 'coaching_sessions'
       AND column_name IN ('liveSessionId','liveSessionKind')`,
  );
  const indekser = await prisma.$queryRawUnsafe<{ indexname: string }[]>(
    `SELECT indexname FROM pg_indexes
     WHERE tablename = 'coaching_sessions'
       AND indexname IN ('coaching_sessions_liveSessionId_idx','coaching_sessions_userId_liveSessionId_key')`,
  );
  console.log(`coaching_sessions nye kolonner: ${kolonner.length}/2 · indekser: ${indekser.length}/2`);
  if (kolonner.length !== 2 || indekser.length !== 2) {
    throw new Error("Kolonne/indeks-verifisering feilet");
  }
  console.log("Ferdig — live-coach-felter på coaching_sessions er på plass.");
}

main()
  .catch((e) => {
    console.error("FEIL:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
