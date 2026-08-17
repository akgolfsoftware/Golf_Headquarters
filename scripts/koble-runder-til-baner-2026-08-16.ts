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
// Samme matcher som runtime-broen (src/lib/portal/bane-bro.ts) — ellers ville
// scriptet kunne koble baner runtime bevisst nekter å koble.
import { velgEntydigBane } from "../src/lib/domain/bane-bro";

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

const APPLY = process.argv.includes("--apply");

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

  const baneMap = new Map(baner.map((b) => [b.id, b]));

  let koblet = 0;
  const uavklarte: string[] = [];

  for (const def of definisjoner) {
    const treff = velgEntydigBane(def.name, baner);

    if (treff.status === "flertydig") {
      uavklarte.push(
        `  — «${def.name}» (${def._count.rounds} runder): ${treff.antall} baner matcher` +
          ` — kobles manuelt (aldri gjett)`,
      );
      continue;
    }
    if (treff.status === "ingen") {
      uavklarte.push(`  — «${def.name}» (${def._count.rounds} runder): ingen bane matcher`);
      continue;
    }

    const bane = baneMap.get(treff.baneId);
    console.log(
      `  ✓ «${def.name}» (${def._count.rounds} runder) → ${bane?.navn ?? treff.baneId}` +
        ` [geometri: ${bane?.geometrySource ?? "ingen"}]${APPLY ? "" : "  (tørrkjøring)"}`,
    );
    if (APPLY) {
      // Samme idempotente skriving som runtime-broen — rører aldri en
      // kobling som alt er satt.
      await prisma.courseDefinition.updateMany({
        where: { id: def.id, baneId: null },
        data: { baneId: treff.baneId },
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
