/**
 * Engangs-backfill: speil SessionDrill → TrainingDrillV2 for alle PLANNED
 * live-økter koblet til plan (generertFra=WORKBENCH_PLAN). Historisk har
 * speilingen aldri kopiert driller, så alle live-økter står med 0 drills.
 * Trygg å kjøre flere ganger (replace-semantikk, rører aldri påbegynte økter).
 *
 * Kjør: npx tsx scripts/backfill-v2-drills.ts
 */
import "./_env";
import { prisma } from "@/lib/prisma";
import { GENERERT_FRA, syncDrillsToV2 } from "@/lib/workbench/v2-drill-mirror";

async function tellTomme(): Promise<number> {
  return prisma.trainingSessionV2.count({
    where: { generertFra: GENERERT_FRA, status: "PLANNED", drills: { none: {} } },
  });
}

async function main() {
  console.log(`tomme PLANNED live-økter før: ${await tellTomme()}`);

  const okter = await prisma.trainingSessionV2.findMany({
    where: { generertFra: GENERERT_FRA, status: "PLANNED", generertFraId: { not: null } },
    select: { id: true, generertFraId: true },
  });

  let synket = 0;
  let foreldreloseSlettet = 0;
  for (const o of okter) {
    if (!o.generertFraId) continue;
    const planOkt = await prisma.trainingPlanSession.findUnique({
      where: { id: o.generertFraId },
      select: { pyramidArea: true },
    });
    if (!planOkt) {
      // Plan-økta er slettet uten at speilet ble ryddet (feilen fikset i
      // synk-runden 2026-07-13) — et PLANNED-speil uten plan er et spøkelse
      // i Gjør-lista og fjernes.
      await prisma.trainingSessionV2.delete({ where: { id: o.id } });
      foreldreloseSlettet += 1;
      continue;
    }
    await syncDrillsToV2(o.id, o.generertFraId, planOkt.pyramidArea);
    synket += 1;
  }

  console.log(`synket ${synket} økter, slettet ${foreldreloseSlettet} foreldreløse speil`);
  console.log(
    `tomme PLANNED live-økter etter: ${await tellTomme()} (rest = plan-økter som reelt mangler driller)`,
  );
}

main().then(() => prisma.$disconnect());
