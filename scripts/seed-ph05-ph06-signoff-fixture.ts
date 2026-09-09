/**
 * Seed to TrainingSessionV2-økter for screentest@akgolf.test som matcher
 * live-sløyfas to fasiter i sign-off-riggen:
 *
 *   PH-05 «Live»        → /portal/live/<PH05_ID>/active   (status IN_PROGRESS)
 *   PH-06 «Live ferdig» → /portal/live/<PH06_ID>/summary  (status COMPLETED)
 *
 * VIKTIG (samme felle som PH-01, se scripts/seed-ph01-signoff-fixture.ts):
 * live-rutene leser `TrainingSessionV2` via `loadLiveSession()` — IKKE
 * `WorkbenchSession`, som «I dag» bruker. Riktig tabell for disse to
 * skjermene er derfor TrainingSessionV2 med TrainingDrillV2 under.
 *
 * Id-ene er FASTE (ikke cuid) fordi riggraden i tests/visual/skjerm-mapping.ts
 * må peke på en konkret rute-streng. Endres id-ene her, må mapping-fila endres
 * i samme commit.
 *
 * Idempotent: upsert på fast id, drills slettes og skrives på nytt.
 *
 * Kjør: npx tsx scripts/seed-ph05-ph06-signoff-fixture.ts
 */
import "./_env";

import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SPILLER_EPOST = "screentest@akgolf.test";

/** Faste id-er — speiles i tests/visual/skjerm-mapping.ts. */
export const PH05_SESJON_ID = "signoff-ph05-live";
export const PH06_SESJON_ID = "signoff-ph06-ferdig";

const TITTEL = "Innspill 50–80 m";
// Fasitens dag er lørdag 22. august 2026 (riggens TEST_NAA). 09:00–09:50 Oslo
// = 07:00–07:50 UTC (sommertid). Se gotchas.md §Tidssone.
const START = new Date(Date.UTC(2026, 7, 22, 7, 0));
const SLUTT = new Date(Date.UTC(2026, 7, 22, 7, 50));

/** Fasitens tre steg. PH-05 står på steg 2 av 3 → første drill er ferdig. */
const DRILLS = [
  {
    sortOrder: 0,
    name: "Oppvarming 30–50 m",
    description: "8 baller · rolig tempo · kjenn kontakt",
    durationMinutes: 10,
    repAntall: 8,
  },
  {
    sortOrder: 1,
    name: "Hoved",
    description: "12 baller · 50–80 m · mål 8 i vindu",
    durationMinutes: 25,
    repAntall: 12,
  },
  {
    sortOrder: 2,
    name: "Avslutning · 70 m",
    description: "6 baller · én ball om gangen",
    durationMinutes: 15,
    repAntall: 6,
  },
] as const;

type Sesjon = { id: string; status: "IN_PROGRESS" | "COMPLETED"; ferdigeSteg: number };

const SESJONER: Sesjon[] = [
  { id: PH05_SESJON_ID, status: "IN_PROGRESS", ferdigeSteg: 1 },
  { id: PH06_SESJON_ID, status: "COMPLETED", ferdigeSteg: 3 },
];

async function main() {
  const spiller = await prisma.user.findUnique({
    where: { email: SPILLER_EPOST },
    select: { id: true },
  });
  if (!spiller) {
    throw new Error(`Fant ikke bruker ${SPILLER_EPOST} — opprett kontoen først.`);
  }

  const coach = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!coach) throw new Error("Fant ingen ADMIN-bruker å bruke som coachId.");

  for (const sesjon of SESJONER) {
    const felles = {
      title: TITTEL,
      studentId: spiller.id,
      coachId: coach.id,
      startTime: START,
      endTime: SLUTT,
      miljo: "M1" as const, // Driving range
      practiceType: "BLOKK" as const,
      status: sesjon.status,
      location: "Range",
      maalsetning: "8 av 12 baller i vindu",
      isCoachCreated: true,
      notes:
        "3 av 3 steg fullført. Vinduet satt fra 60 m — samme 12-ball i morgen er ikke nødvendig, søndag er hvile.",
      // PH-06 leser varigheten fra completedSummary.liveSummary.durationSec
      // (samme sted live-økta selv skriver den) og faller først tilbake på
      // logg-tidsstemplene. Uten den står «Økt ferdig» uten «· 50 min».
      completedSummary:
        sesjon.status === "COMPLETED"
          ? { liveSummary: { durationSec: 50 * 60 } }
          : Prisma.DbNull,
    };

    await prisma.trainingSessionV2.upsert({
      where: { id: sesjon.id },
      create: { id: sesjon.id, ...felles },
      update: felles,
    });

    // Drills skrives på nytt hver kjøring (cascade sletter DrillLogV2 med).
    await prisma.trainingDrillV2.deleteMany({ where: { sessionId: sesjon.id } });

    for (const d of DRILLS) {
      const drill = await prisma.trainingDrillV2.create({
        data: {
          sessionId: sesjon.id,
          sortOrder: d.sortOrder,
          name: d.name,
          description: d.description,
          durationMinutes: d.durationMinutes,
          repetitions: d.repAntall,
          pyramide: "SLAG",
          innslagType: "DRILL",
          repType: "BALLER_SLATT",
          repAntall: d.repAntall,
        },
      });

      // Ferdige steg får en logg — det er den som gjør drillen «done» i UI.
      // Tidsstemplene spres utover økta (kumulativ varighet), slik en ekte
      // live-økt skriver dem.
      if (d.sortOrder < sesjon.ferdigeSteg) {
        const minutterInn = DRILLS.slice(0, d.sortOrder).reduce(
          (sum, x) => sum + x.durationMinutes,
          0,
        );
        await prisma.drillLogV2.create({
          data: {
            drillId: drill.id,
            loggedBy: spiller.id,
            successRate: 67,
            repsTotal: d.repAntall,
            repsHit: Math.round(d.repAntall * 0.67),
            loggedAt: new Date(START.getTime() + minutterInn * 60_000),
          },
        });
      }
    }

    console.log(`✓ ${sesjon.id} (${sesjon.status}, ${sesjon.ferdigeSteg}/3 steg logget)`);
  }

  console.log(`\nPH-05: /portal/live/${PH05_SESJON_ID}/active`);
  console.log(`PH-06: /portal/live/${PH06_SESJON_ID}/summary`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
