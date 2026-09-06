/**
 * Seed for PH-21 «Min kurve» (sign-off-riggen, MASTERPLAN Ø19).
 *
 * Kobler screentest@akgolf.test til en EGEN, skjult turneringsidentitet og
 * legger inn sju demo-turneringer (én i 2025, seks i 2026) med runder som
 * matcher fasitens seks turneringsnavn og fallende kurve. Ingen ekte spiller
 * eller ekte turnering røres.
 *
 * Hvorfor dataene aldri lekker til åpne flater (verifisert 05.09.2026):
 *   - PublicPlayer: `isActive: false` (alle /stats-lister krever true) og
 *     `birthYear: null` uten dataGolfId → `offentligSpillerFilter()` fail-closed.
 *   - Tournament: `tour: "demo"` — `hentTurneringerForListe` filtrerer på
 *     TOUR_MAP-verdier, så demo-turneringene finnes ikke i noen liste; `slug`
 *     er null, så /stats/turneringer/[slug] finnes ikke; datoene er passert,
 *     så /stats/uka ser dem ikke. `sourceOrigin: "MANUAL"` + `sourceId
 *     "demo-ph21-N"` gjør seeden idempotent og gjenkjennelig.
 *
 * Flagg:
 *   --tom   koble spilleren, men fjern demo-turneringene → PH-21c (tom tilstand)
 *
 * Kjør: npx tsx scripts/seed-ph21-signoff-fixture.ts [--tom]
 */
import "./_env";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SPILLER_EPOST = "screentest@akgolf.test";
const SLUG = "oyvind-rohjan-demo";
const KILDE_PREFIKS = "demo-ph21-";
const PAR = 72;

type Demo = { nr: number; navn: string; sted: string; dato: string; runder: number[]; plassering: number };

// Til-par total = sum(runder) − PAR × antall. Fallende kurve, båndet 4 → 3.
const TURNERINGER: Demo[] = [
  { nr: 0, navn: "Sesongavslutning Onsøy 2025", sted: "Onsøy GK", dato: "2025-09-20", runder: [85, 89], plassering: 18 },
  { nr: 1, navn: "Sesongåpning Onsøy", sted: "Onsøy GK", dato: "2026-04-26", runder: [86, 90], plassering: 22 },
  { nr: 2, navn: "Narvesen Junior Open", sted: "Larvik GK", dato: "2026-05-31", runder: [84, 88], plassering: 16 },
  { nr: 3, navn: "Titleist Tour #3 Bogstad", sted: "Oslo GK Bogstad", dato: "2026-06-21", runder: [83, 85], plassering: 9 },
  { nr: 4, navn: "Srixon Tour Oslo GK", sted: "Oslo GK", dato: "2026-07-12", runder: [81, 84], plassering: 11 },
  { nr: 5, navn: "Titleist Tour #6 Miklagard", sted: "Miklagard GK", dato: "2026-08-09", runder: [80, 82], plassering: 7 },
  { nr: 6, navn: "NM junior Losby", sted: "Losby GK", dato: "2026-08-24", runder: [79, 82, 80], plassering: 4 },
];

function utcDato(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

async function main() {
  const tom = process.argv.includes("--tom");

  const spiller = await prisma.user.findUnique({ where: { email: SPILLER_EPOST }, select: { id: true, publicPlayerId: true } });
  if (!spiller) throw new Error(`Fant ikke bruker ${SPILLER_EPOST}.`);

  const publicPlayer = await prisma.publicPlayer.upsert({
    where: { slug: SLUG },
    update: { name: "Øyvind Rohjan", country: "NO", tier: "junior", birthYear: null, isActive: false },
    create: { slug: SLUG, name: "Øyvind Rohjan", country: "NO", tier: "junior", birthYear: null, isActive: false },
    select: { id: true },
  });

  if (spiller.publicPlayerId && spiller.publicPlayerId !== publicPlayer.id) {
    throw new Error(`${SPILLER_EPOST} er allerede koblet til en annen turneringsidentitet (${spiller.publicPlayerId}). Løsne først.`);
  }
  if (spiller.publicPlayerId !== publicPlayer.id) {
    await prisma.user.update({ where: { id: spiller.id }, data: { publicPlayerId: publicPlayer.id } });
    console.log(`Koblet ${SPILLER_EPOST} → PublicPlayer ${publicPlayer.id} (${SLUG}, isActive=false)`);
  }

  if (tom) {
    const slettet = await prisma.tournament.deleteMany({ where: { sourceOrigin: "MANUAL", sourceId: { startsWith: KILDE_PREFIKS } } });
    console.log(`--tom: fjernet ${slettet.count} demo-turneringer (entries/runder kaskaderer). Skjermen skal nå vise PH-21c.`);
    return;
  }

  for (const t of TURNERINGER) {
    const sourceId = `${KILDE_PREFIKS}${t.nr}`;
    const sum = t.runder.reduce((a, b) => a + b, 0);
    const toPar = sum - PAR * t.runder.length;
    const start = utcDato(t.dato);
    const slutt = new Date(start.getTime() + (t.runder.length - 1) * 86_400_000);

    const data = {
      name: t.navn,
      startDate: start,
      endDate: slutt,
      format: "STROKE",
      sourceOrigin: "MANUAL",
      sourceId,
      tour: "demo",
      country: "NO",
      location: t.sted,
      status: "COMPLETED",
      tier: 4,
      createdByUserId: spiller.id,
    };
    const eksisterende = await prisma.tournament.findFirst({ where: { sourceOrigin: "MANUAL", sourceId }, select: { id: true } });
    const turnering = eksisterende
      ? await prisma.tournament.update({ where: { id: eksisterende.id }, data, select: { id: true } })
      : await prisma.tournament.create({ data, select: { id: true } });

    const entry = await prisma.publicPlayerEntry.upsert({
      where: { playerId_tournamentId: { playerId: publicPlayer.id, tournamentId: turnering.id } },
      update: { status: "FINISHED", position: t.plassering, scoreToPar: toPar, totalScore: sum },
      create: { playerId: publicPlayer.id, tournamentId: turnering.id, status: "FINISHED", position: t.plassering, scoreToPar: toPar, totalScore: sum },
      select: { id: true },
    });

    for (let i = 0; i < t.runder.length; i++) {
      await prisma.publicPlayerRound.upsert({
        where: { entryId_roundNumber: { entryId: entry.id, roundNumber: i + 1 } },
        update: { score: t.runder[i], toPar: t.runder[i] - PAR, source: "MANUAL" },
        create: { entryId: entry.id, roundNumber: i + 1, score: t.runder[i], toPar: t.runder[i] - PAR, source: "MANUAL" },
      });
    }
    console.log(`${eksisterende ? "Oppdatert" : "Opprettet"} ${t.navn} (${t.dato}) · ${t.runder.length} runder · ${toPar > 0 ? "+" : ""}${toPar} · ${t.plassering}. innen klasse`);
  }
  console.log("Ferdig. Åpne /portal/analysere/turneringer som screentest — PH-21a/PH-21b.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
