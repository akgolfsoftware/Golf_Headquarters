/**
 * Seed: TrackMan-økter for screentest-spilleren (Øyvind Rohjan).
 *
 * Formål: gjøre gapping-kartet (D5) mulig å FOTOGRAFERE med ekte data.
 * Basen hadde null TrackManShot-rader, så kartet viste alltid tom tilstand.
 *
 * Rører KUN screentest@akgolf.test og kun økter merket `source = "seed-gapping"`.
 * Kjør på nytt for å regenerere — gamle seed-økter slettes først.
 *
 *   npx tsx scripts/seed-screentest-trackman.ts
 *   npx tsx scripts/seed-screentest-trackman.ts --slett   (fjerner seed-dataene)
 *
 * Tallene er et realistisk sett for en god junior/amatør: ett bevisst gap
 * mellom 5-jern og 4-hybrid, og en 58° med for få slag til å flagges — slik at
 * begge reglene i fasiten faktisk kan ses i praksis.
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const EMAIL = "screentest@akgolf.test";
const KILDE = "seed-gapping";

/** median-carry, antall slag og TOTALT spenn per kølle.
 *  Den lineære fordelingen gjør at midtre halvdel (p25–p75) blir halve
 *  spennet — spredning 30 gir altså et bånd på ~15 m, som i fasiten. */
const SETT: { klubb: string; median: number; slag: number; spredning: number }[] = [
  { klubb: "Driver", median: 232, slag: 48, spredning: 30 },
  { klubb: "3-tre", median: 208, slag: 26, spredning: 28 },
  { klubb: "4-hybrid", median: 196, slag: 31, spredning: 26 },
  // 24 m ned til 5-jern — over terskelen, skal flagges.
  { klubb: "5-jern", median: 172, slag: 38, spredning: 24 },
  { klubb: "6-jern", median: 161, slag: 34, spredning: 22 },
  { klubb: "7-jern", median: 150, slag: 52, spredning: 20 },
  { klubb: "8-jern", median: 138, slag: 41, spredning: 20 },
  { klubb: "9-jern", median: 126, slag: 37, spredning: 20 },
  { klubb: "PW", median: 112, slag: 44, spredning: 20 },
  { klubb: "50°", median: 96, slag: 28, spredning: 20 },
  { klubb: "54°", median: 82, slag: 33, spredning: 20 },
  // 19 slag — under terskelen. Måles, men skal ikke flagges.
  { klubb: "58°", median: 68, slag: 19, spredning: 24 },
];

/** Deterministisk pseudo-tilfeldig, så gjentatte kjøringer gir samme kart. */
function rng(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

async function main() {
  const slettModus = process.argv.includes("--slett");
  const connectionString = process.env.DIRECT_URL;
  if (!connectionString) throw new Error("DIRECT_URL mangler i .env.local");

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  const spiller = await prisma.user.findFirst({
    where: { email: EMAIL },
    select: { id: true, name: true },
  });
  if (!spiller) throw new Error(`Fant ikke ${EMAIL}`);

  // Rydd alltid egne seed-økter først — skriptet er idempotent.
  const gamle = await prisma.trackManSession.findMany({
    where: { userId: spiller.id, source: KILDE },
    select: { id: true },
  });
  if (gamle.length > 0) {
    await prisma.trackManShot.deleteMany({
      where: { sessionId: { in: gamle.map((g) => g.id) } },
    });
    await prisma.trackManSession.deleteMany({
      where: { id: { in: gamle.map((g) => g.id) } },
    });
    console.log(`Slettet ${gamle.length} tidligere seed-økter.`);
  }

  if (slettModus) {
    console.log("Slettemodus — ingen nye data opprettet.");
    await prisma.$disconnect();
    return;
  }

  const tilfeldig = rng(20260815);
  const naa = Date.now();

  // Fire økter spredt over de siste 90 dagene.
  const oktDatoer = [72, 51, 30, 9].map(
    (dagerSiden) => new Date(naa - dagerSiden * 86_400_000),
  );

  // Fordel hver kølles slag over de fire øktene.
  const perOkt: { klubb: string; carry: number }[][] = oktDatoer.map(() => []);
  for (const k of SETT) {
    for (let i = 0; i < k.slag; i++) {
      // Symmetrisk om medianen, med litt støy — gir realistisk p25/p75.
      const midt = (k.slag - 1) / 2;
      const basis = k.slag === 1 ? 0 : ((i - midt) / midt) * (k.spredning / 2);
      const stoy = (tilfeldig() - 0.5) * 3;
      perOkt[i % 4].push({ klubb: k.klubb, carry: Math.round((k.median + basis + stoy) * 10) / 10 });
    }
  }

  let totalt = 0;
  for (let i = 0; i < oktDatoer.length; i++) {
    const slag = perOkt[i];
    const okt = await prisma.trackManSession.create({
      data: {
        userId: spiller.id,
        recordedAt: oktDatoer[i],
        source: KILDE,
        shotCount: slag.length,
        environment: "SIMULATOR_INDOOR",
      },
      select: { id: true },
    });
    await prisma.trackManShot.createMany({
      data: slag.map((s, n) => ({
        sessionId: okt.id,
        shotNumber: n + 1,
        recordedAt: oktDatoer[i],
        club: s.klubb,
        carryDistance: s.carry,
      })),
    });
    totalt += slag.length;
    console.log(`Økt ${i + 1}: ${slag.length} slag (${oktDatoer[i].toISOString().slice(0, 10)})`);
  }

  console.log(`\nFerdig — ${totalt} slag på ${SETT.length} køller for ${spiller.name}.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
