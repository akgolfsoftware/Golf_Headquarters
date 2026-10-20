// Rydder kopiene som den gamle speilingen skrev (materialize-entry.ts, stoppet 20.10.2026).
// Resultatene lever nå bare i spillerens bekreftede profil (dashboard.profile_links).
//
// TØRRKJØRING som standard: skriver bare tall og eksempler. Slett først med --apply, og først
// etter at Anders har sett tallene.
//
//   npx tsx scripts/rydd-speilrader-turnering.ts            # tørrkjøring
//   npx tsx scripts/rydd-speilrader-turnering.ts --apply    # sletter
//
// Hva som regnes som en kopi:
//  - TournamentEntry med notes = "Automatisk fra turneringsresultat" (det speilingen skrev).
//    Hoppes over hvis en runde (Round) eller turneringsplan (WorkbenchTournamentPlan) peker på den.
//  - TournamentResult for en bruker med PublicPlayer-kobling, når PublicPlayerEntry for samme
//    turnering har samme plassering og samme brutto totalscore. Resultater en coach har ført
//    selv (andre tall, eller ingen PublicPlayerEntry) røres ikke.
import { prisma } from "@/lib/prisma";

const AUTOMATISK_NOTAT = "Automatisk fra turneringsresultat";
const APPLY = process.argv.includes("--apply");

async function main() {
  console.log(APPLY ? "MODUS: SLETTER" : "MODUS: tørrkjøring (ingenting slettes)");

  const entries = await prisma.tournamentEntry.findMany({
    where: { notes: AUTOMATISK_NOTAT },
    select: { id: true, userId: true },
  });
  const entryTrygge: string[] = [];
  let entryHoppet = 0;
  for (const e of entries) {
    const [runder, planer] = await Promise.all([
      prisma.round.count({ where: { tournamentEntryId: e.id } }),
      prisma.workbenchTournamentPlan.count({ where: { tournamentEntryId: e.id } }),
    ]);
    if (runder + planer > 0) entryHoppet++;
    else entryTrygge.push(e.id);
  }
  console.log(`TournamentEntry: ${entries.length} automatiske, ${entryTrygge.length} kan slettes, ${entryHoppet} hoppes over (knyttet til runder eller planer).`);

  const brukere = await prisma.user.findMany({
    where: { publicPlayerId: { not: null }, deletedAt: null, anonymisertAt: null },
    select: { id: true, publicPlayerId: true },
  });
  const resultatTrygge: string[] = [];
  let resultatAndre = 0;
  for (const b of brukere) {
    const [resultater, offentlige] = await Promise.all([
      prisma.tournamentResult.findMany({ where: { userId: b.id }, select: { id: true, tournamentId: true, position: true, score: true } }),
      prisma.publicPlayerEntry.findMany({ where: { playerId: b.publicPlayerId! }, select: { tournamentId: true, position: true, totalScore: true } }),
    ]);
    const perTurnering = new Map(offentlige.map((o) => [o.tournamentId, o]));
    for (const r of resultater) {
      const o = perTurnering.get(r.tournamentId);
      if (o && o.position === r.position && o.totalScore === r.score) resultatTrygge.push(r.id);
      else resultatAndre++;
    }
  }
  console.log(`TournamentResult: ${resultatTrygge.length} er identiske kopier og kan slettes, ${resultatAndre} røres ikke (ført av coach eller avvikende).`);

  if (!APPLY) {
    console.log("Ingenting slettet. Kjør med --apply for å slette.");
    return;
  }
  const e = await prisma.tournamentEntry.deleteMany({ where: { id: { in: entryTrygge }, notes: AUTOMATISK_NOTAT } });
  const r = await prisma.tournamentResult.deleteMany({ where: { id: { in: resultatTrygge } } });
  await prisma.auditLog.create({
    data: { actorId: null, action: "SPEILRADER_RYDDET", target: "tournament_entries,tournament_results", metadata: { entries: e.count, resultater: r.count } },
  });
  console.log(`Slettet ${e.count} entries og ${r.count} resultater.`);
}

main().finally(() => prisma.$disconnect());
