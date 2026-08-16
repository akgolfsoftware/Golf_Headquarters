/**
 * Bro Round→Bane (AP0.4 i docs/plan-baneguide-sg-app-2026-08-16.md).
 *
 * `CourseDefinition.baneId` er koblingen som gir runder banegeometri
 * (gameplan-spredning per hull, hull-lengder, kart). Ingen kode setter den i
 * dag — CourseDefinition-rader kommer fra seeds og kobles manuelt i DB.
 * Dette scriptet matcher ukoblede CourseDefinition-rader mot `Bane` på
 * normalisert navn/klubb og setter broen.
 *
 * Kjøring (krever DB-tilgang — .env.local med DIRECT_URL):
 *   npx tsx scripts/koble-runder-til-baner-2026-08-16.ts           # tørrkjøring
 *   npx tsx scripts/koble-runder-til-baner-2026-08-16.ts --apply   # skriv broene
 *
 * Kun eksakte normaliserte treff kobles automatisk; alt annet listes for
 * manuell vurdering. Idempotent — rader som alt har baneId røres aldri.
 */
import "./_env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

const APPLY = process.argv.includes("--apply");

/** «Onsøy Golfklubb» / «Onsøy GK» / «Onsøy golfbane» → «onsøy». */
function normaliser(navn: string): string {
  return navn
    .toLowerCase()
    .replace(/golfklubb|golfbane|golfpark|golfsenter|\bgk\b/g, "")
    .replace(/[^a-zæøå0-9]+/g, " ")
    .trim();
}

async function main() {
  const [definisjoner, baner] = await Promise.all([
    prisma.courseDefinition.findMany({
      where: { baneId: null },
      select: { id: true, name: true, _count: { select: { rounds: true } } },
    }),
    prisma.bane.findMany({
      select: { id: true, navn: true, kortNavn: true, klubb: true, geometrySource: true },
    }),
  ]);

  console.log(`Ukoblede CourseDefinition: ${definisjoner.length} · Baner: ${baner.length}\n`);

  // Nøkkel → bane. Både navn og klubb kan bære det gjenkjennelige navnet.
  const baneIndex = new Map<string, (typeof baner)[number]>();
  for (const bane of baner) {
    for (const kandidat of [bane.navn, bane.kortNavn, bane.klubb].filter(
      (v): v is string => !!v,
    )) {
      const nokkel = normaliser(kandidat);
      if (nokkel && !baneIndex.has(nokkel)) baneIndex.set(nokkel, bane);
    }
  }

  let koblet = 0;
  const uavklarte: string[] = [];

  for (const def of definisjoner) {
    const treff = baneIndex.get(normaliser(def.name));
    if (!treff) {
      uavklarte.push(`  — «${def.name}» (${def._count.rounds} runder): ingen bane matcher`);
      continue;
    }
    console.log(
      `  ✓ «${def.name}» (${def._count.rounds} runder) → ${treff.navn}` +
        ` [geometri: ${treff.geometrySource ?? "ingen"}]${APPLY ? "" : "  (tørrkjøring)"}`,
    );
    if (APPLY) {
      await prisma.courseDefinition.update({
        where: { id: def.id },
        data: { baneId: treff.id },
      });
    }
    koblet++;
  }

  if (uavklarte.length > 0) {
    console.log(`\nUavklarte (kobles manuelt, eller banen mangler i Bane-tabellen):`);
    for (const linje of uavklarte) console.log(linje);
  }

  console.log(
    `\n${APPLY ? "Koblet" : "Ville koblet"} ${koblet} av ${definisjoner.length}.` +
      (APPLY ? "" : " Kjør med --apply for å skrive."),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
