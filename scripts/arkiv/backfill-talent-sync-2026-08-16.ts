/**
 * Engangs-backfill (plan T4): kjør talent-synken for alle spillere som har
 * CANON-testresultater, slik at talentprofilene reflekterer historikken —
 * ikke bare resultater logget etter at synken kom.
 *
 * Idempotent (full recompute per spiller). Auto-innmelding gjelder kun
 * AK-gruppemedlemmer (regelen bor i syncTalentEtterTest).
 *
 *   npx tsx scripts/backfill-talent-sync-2026-08-16.ts
 */
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const { syncTalentEtterTest } = await import("../src/lib/talent/test-sync");

  const spillere = await prisma.testResult.findMany({
    where: { test: { erCanon: true } },
    select: { userId: true },
    distinct: ["userId"],
  });
  console.log(`${spillere.length} spillere med CANON-resultater.`);

  let ok = 0;
  let feilet = 0;
  for (const s of spillere) {
    try {
      await syncTalentEtterTest(s.userId);
      ok++;
    } catch (e) {
      feilet++;
      console.error(`  FEIL for ${s.userId}:`, e instanceof Error ? e.message : e);
    }
  }
  const medNivaaer = await prisma.talentTracking.count({
    where: { sisteTestSyncAt: { not: null } },
  });
  console.log(`Ferdig: ${ok} synket, ${feilet} feilet. TalentTracking med testNivaaer: ${medNivaaer}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
