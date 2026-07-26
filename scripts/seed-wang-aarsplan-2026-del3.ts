/**
 * Seed del 3: WANG-årsplan 2026/2027 — korrigerte datoer + ny heldagssamling.
 *
 * Kilde: Anders, direkte i samtale 26. juli 2026 (ikke fra hukommelse/gjetning
 * som del 1/2 sine eksterne kilder — dette ER kilden).
 *
 * Korrigerer to rader fra del 1 som hadde feil dato:
 *  - Fysisk testdag (Teemu Paasanen): 27.8 → 26.8. Utvidet til også å dekke
 *    gjennomgang av fysisk treningsprogram for alle spillere, ikke kun testing.
 *  - NGF-testdag uke 44: torsdag 29.10 → mandag 26.10.
 *
 * Legger til ny heldagssamling 24.8 (teambuilding/klatring), og flytter
 * 8-ball-testen som lå i onsdagsøkta 26.8 til 2.9 siden 26.8 nå er en heldag.
 *
 * Idempotent — korrigerer eksisterende rad via updateMany (matcher på gammel
 * tittel/dato) i stedet for å opprette duplikat. Kjør:
 *   npx tsx scripts/seed-wang-aarsplan-2026-del3.ts
 */
import "./_env";
import { prisma } from "@/lib/prisma";

const GROUP_ID = "cmp28uk1b000l99e5m764g2wx"; // WANG Toppidrett Fredrikstad
const SCHOOL_YEAR = "2026/2027";

function d(s: string): Date {
  return new Date(s);
}

async function main() {
  // ---------- 1) Paasanen-dagen: 27.8 → 26.8, utvidet innhold ----------
  const paasanen = await prisma.groupSchedule.updateMany({
    where: { groupId: GROUP_ID, title: "Heldag: Fysiske tester + individuell screening (Teemu Paasanen)" },
    data: {
      startAt: d("2026-08-26T08:00:00"),
      endAt: d("2026-08-26T15:00:00"),
      description:
        "Alle 9 elever. Fysiske tester + individuell screening, og gjennomgang av fysisk treningsprogram " +
        "for alle spillere. Grunnlag for individuelt tilpasset styrkeprogram (vedlikehold + øke styrke). " +
        "Re-test ca. 6 uker senere.",
    },
  });
  console.log(`Paasanen-dag flyttet 27.8 → 26.8: ${paasanen.count} rad(er) oppdatert`);

  // ---------- 2) NGF-testdag uke 44: torsdag 29.10 → mandag 26.10 ----------
  const ngf = await prisma.groupSchedule.updateMany({
    where: { groupId: GROUP_ID, title: "NGF-testdag: Golfslag Basic, putting, force plate" },
    data: { startAt: d("2026-10-26T08:00:00"), endAt: d("2026-10-26T16:00:00") },
  });
  console.log(`NGF-testdag flyttet torsdag 29.10 → mandag 26.10: ${ngf.count} rad(er) oppdatert`);

  const testukeNotat = await prisma.trainingPeriod.updateMany({
    where: { groupId: GROUP_ID, schoolYear: SCHOOL_YEAR, name: "Testuke", startDate: d("2026-10-19") },
    data: { note: "NGF testuke (uke 43). Heldagssamling NGF Oslo mandag 26.10 (uke 44)." },
  });
  console.log(`Testuke-notat oppdatert: ${testukeNotat.count} rad(er)`);

  // ---------- 3) Ny heldagssamling: 24.8 teambuilding/klatring ----------
  const teambuildingTitle = "Heldag: Teambuilding — klatring på Grensen";
  const finnesTeambuilding = await prisma.groupSchedule.findFirst({
    where: { groupId: GROUP_ID, title: teambuildingTitle },
    select: { id: true },
  });
  if (!finnesTeambuilding) {
    await prisma.groupSchedule.create({
      data: {
        groupId: GROUP_ID,
        title: teambuildingTitle,
        startAt: d("2026-08-24T08:00:00"),
        endAt: d("2026-08-24T15:00:00"),
        kind: "HELDAGSSAMLING",
        location: "Grensen",
        description: "Teambuilding for hele gruppen. Erstatter ordinær mandagsøkt denne dagen.",
      },
    });
    console.log("Ny heldagssamling opprettet: 24.8 teambuilding/klatring på Grensen");
  } else {
    console.log("Heldagssamling 24.8 finnes allerede");
  }

  // ---------- 4) Flytt 8-ball-test (1/3) — 26.8 er nå heldag, ikke onsdagsøkt ----------
  const flyttetTest = await prisma.groupSchedule.updateMany({
    where: { groupId: GROUP_ID, title: "Test: 8-ball Blocked + Variation (1/3)" },
    data: {
      startAt: d("2026-09-02T08:00:00"),
      endAt: d("2026-09-02T10:00:00"),
      description:
        "Testbatteri: 8-ball-blocked + 8-ball-variation. Kjøres i den faste onsdagsøkta. " +
        "(Flyttet fra 26.8 — hele dagen da er avsatt til fysisk testdag med Teemu Paasanen.)",
    },
  });
  console.log(`8-ball-test (1/3) flyttet 26.8 → 2.9: ${flyttetTest.count} rad(er) oppdatert`);

  console.log("\nFERDIG del 3.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
