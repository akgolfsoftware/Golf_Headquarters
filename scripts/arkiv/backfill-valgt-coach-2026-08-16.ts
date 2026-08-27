import "./_env";
import { prisma } from "@/lib/prisma";
import { coachedPlayerWhere } from "@/lib/auth/coached";
import { hentFallbackKandidater } from "@/lib/domain/valgt-coach";
import { vurderBackfillKandidat } from "@/lib/domain/valgt-coach-kjerne";

/**
 * Backfill av User.primaryCoachId («valgt coach», plan G2).
 *
 * For hver coachet spiller (coachedPlayerWhere — I0-porten) uten
 * primaryCoachId kjøres fallback-kjeden (2)–(4) fra valgt-coach-kjerne.ts:
 * ENTYDIG kandidat → skrives; flere ulike coacher på samme nivå → skrives
 * IKKE, rapporteres for manuell avgjørelse i admin-UI.
 *
 * Dry-run er DEFAULT — ingenting skrives uten --skriv:
 *
 *   npx tsx scripts/backfill-valgt-coach-2026-08-16.ts           # dry-run
 *   npx tsx scripts/backfill-valgt-coach-2026-08-16.ts --skriv   # skriver
 */

const SKRIV = process.argv.includes("--skriv");

async function main() {
  const spillere = await prisma.user.findMany({
    where: { AND: [coachedPlayerWhere(), { primaryCoachId: null }] },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  console.log(
    `backfill-valgt-coach (${SKRIV ? "SKRIVER" : "dry-run — bruk --skriv for å skrive"}): ` +
      `${spillere.length} coachede spillere uten valgt coach.`,
  );

  let entydige = 0;
  let tvetydige = 0;
  let uten = 0;

  for (const spiller of spillere) {
    const kandidater = await hentFallbackKandidater(spiller.id);
    const vurdering = vurderBackfillKandidat(kandidater);

    if (vurdering.status === "ENTYDIG") {
      entydige++;
      if (SKRIV) {
        await prisma.user.update({
          where: { id: spiller.id },
          data: { primaryCoachId: vurdering.coachId },
        });
      }
      console.log(
        `  ${SKRIV ? "SKREVET" : "entydig"}  ${spiller.name} (${spiller.id}) → ${vurdering.coachId} [${vurdering.kilde}]`,
      );
    } else if (vurdering.status === "TVETYDIG") {
      tvetydige++;
      console.log(
        `  TVETYDIG ${spiller.name} (${spiller.id}) — ${vurdering.kandidater.length} coacher på nivå ${vurdering.kilde}: ` +
          `${vurdering.kandidater.join(", ")} — avgjør manuelt i admin-UI (Rediger spiller → Valgt coach).`,
      );
    } else {
      uten++;
    }
  }

  console.log(
    `Ferdig. Entydige: ${entydige}${SKRIV ? " (skrevet)" : " (ville blitt skrevet)"} · ` +
      `tvetydige (manuelle): ${tvetydige} · uten kandidat: ${uten}.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
