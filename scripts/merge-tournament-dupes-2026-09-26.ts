// Engangsopprydding — 7 dublett-grupper i public.tournaments funnet i punkt 1 av
// beslutningen "PIPELINES ER ENESTE KILDE" (.claude/rules/beslutninger.md).
// Alle er samme sourceOrigin+sourceId skrevet to ganger av HQ sin egen skraper
// (ikke pipelines-vs-HQ-mismatchet beslutningen fryktet). Verifisert manuelt at
// duplikat-deltakelsene er byte-for-byte identiske før sletting.
import { prisma } from "@/lib/prisma";

const ANDERS_USER_ID = "cmacgoers0000andersadmin01";

async function audit(entry: { actorId: string; action: string; target: string; metadata: unknown }) {
  await prisma.auditLog.create({
    data: { actorId: entry.actorId, action: entry.action, target: entry.target, metadata: entry.metadata as object },
  });
}

type Gruppe = {
  navn: string;
  targetId: string;
  // sources uten reell data flyttes normalt; sources markert identisk=true
  // har samme deltakere som target og skal renskes (slettes) før merge.
  sources: { id: string; identisk: boolean }[];
};

const GRUPPER: Gruppe[] = [
  {
    navn: "Haugesund GK - CBE Senior Tour (avlyst)",
    targetId: "cmsygwb36005fy56h4rj0cyt9",
    sources: [{ id: "cmtaotip2005fx72bagy0c4sj", identisk: false }],
  },
  {
    navn: "Haugesund GK - Caddie Pairs (avlyst)",
    targetId: "cms3tjyzj005ewa4s5zwbjuew",
    sources: [{ id: "cmtaotik4005ex72bg0yzrmw7", identisk: false }],
  },
  {
    navn: "Soon GK - CBE Senior Tour",
    targetId: "cms3tjzo8005mwa4sboyk1oko",
    sources: [
      { id: "cmtbsnf5b005ovv2b689m3tco", identisk: false },
      { id: "cmtn9skts005osj4xtm7ycgz9", identisk: true },
    ],
  },
  {
    navn: "Romerike GK - CBE Senior Tour",
    targetId: "cms3tk00i005qwa4sv0qftwxp",
    sources: [{ id: "cmtbsnffc005svv2bigtlto70", identisk: false }],
  },
  {
    navn: "Kongsvinger GK - CBE Senior Tour",
    targetId: "cms3tk03l005rwa4s1ogqjbrb",
    sources: [{ id: "cmtbsnfhu005tvv2b7wx6r89p", identisk: false }],
  },
  {
    navn: "Hakadal GK - Landsdelsfinale Østlandet CBE",
    targetId: "cms3tjzbu005iwa4suyn13a67",
    sources: [{ id: "cmtbsnev9005kvv2bckvbr8su", identisk: true }],
  },
  {
    navn: "Skjeberg GK - CBE Senior Tour",
    targetId: "cms3tjzi2005kwa4s8tho0ckx",
    sources: [{ id: "cmtbsnf0b005mvv2bbh9ucmb2", identisk: true }],
  },
];

async function mergeOne(targetId: string, sourceId: string, identisk: boolean, navn: string) {
  const [source, target] = await Promise.all([
    prisma.tournament.findUnique({ where: { id: sourceId }, select: { id: true, name: true, mergedIntoId: true } }),
    prisma.tournament.findUnique({ where: { id: targetId }, select: { id: true, name: true, mergedIntoId: true } }),
  ]);
  if (!source) throw new Error(`Kilde ${sourceId} finnes ikke`);
  if (!target) throw new Error(`Mål ${targetId} finnes ikke`);
  if (source.mergedIntoId) {
    console.log(`  [hopper over] ${sourceId} er allerede merget`);
    return null;
  }
  if (target.mergedIntoId) throw new Error(`Mål ${targetId} er selv en dublett`);

  const result = await prisma.$transaction(async (tx) => {
    let slettetIdentiske = 0;
    if (identisk) {
      // Duplikat-deltakelsene er verifisert byte-for-byte identiske med target.
      // Slett dem i stedet for å flytte (ville brutt unik-indeksen playerId+tournamentId).
      const slettet = await tx.publicPlayerEntry.deleteMany({ where: { tournamentId: sourceId } });
      slettetIdentiske = slettet.count;
    }

    const entries = await tx.tournamentEntry.updateMany({
      where: { tournamentId: sourceId },
      data: { tournamentId: targetId },
    });
    const results = await tx.tournamentResult.updateMany({
      where: { tournamentId: sourceId },
      data: { tournamentId: targetId },
    });
    const moved = await tx.publicPlayerEntry.updateMany({
      where: { tournamentId: sourceId },
      data: { tournamentId: targetId },
    });

    await tx.tournament.update({
      where: { id: sourceId },
      data: { mergedIntoId: targetId },
    });

    return { entries: entries.count, results: results.count, moved: moved.count, slettetIdentiske };
  });

  await audit({
    actorId: ANDERS_USER_ID,
    action: "tournament.merged",
    target: `Tournament:${sourceId}`,
    metadata: {
      sourceId,
      sourceName: source.name,
      targetId,
      targetName: target.name,
      gruppe: navn,
      script: "merge-tournament-dupes-2026-09-26",
      flyttet: result,
    },
  });

  console.log(`  OK: ${sourceId} -> ${targetId} | flyttet=${JSON.stringify(result)}`);
  return result;
}

async function main() {
  for (const g of GRUPPER) {
    console.log(`\n=== ${g.navn} (target ${g.targetId}) ===`);
    for (const s of g.sources) {
      await mergeOne(g.targetId, s.id, s.identisk, g.navn);
    }
  }
  await prisma.$disconnect();
  console.log("\nFerdig.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
