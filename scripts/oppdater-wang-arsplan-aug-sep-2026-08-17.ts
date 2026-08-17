/**
 * Retter WANG Toppidrett-årsplanen (gruppe wang-toppidrett) for august–september
 * 2026 etter Anders' avklaring i chat 17.08.2026:
 *
 *  1. Flytt fysisk-test-heldagen fra 26.8 til 2.9, sted → "WANG Toppidrett Styrkerom".
 *  2. Skyv re-testen 8.10 til 14.10 (6 uker etter ny baseline 2.9, samme varighet).
 *  3. Fjern teambuilding-heldagen 24.8 (Grensen) — ny dato ikke bestemt ennå.
 *  4. Legg til ny heldagssamling 21.8 på Nøtterøy, avreise 07.30 fra Fredrikstad
 *     Stadion (returtid ikke bekreftet — satt til kl. 16.00 som plassholder).
 *
 * Idempotent: kjører kun UPDATE/DELETE/CREATE mot kjente id-er / unikt title+dato,
 * trygt å kjøre flere ganger (CREATE-steget sjekker om raden alt finnes).
 *
 *   npx tsx scripts/oppdater-wang-arsplan-aug-sep-2026-08-17.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

const FYSISK_TEST_ID = "cmrrgcuui000t10e51decaj8y";
const RETEST_ID = "cmrrgcuwt000u10e5pm2b3yq4";
const TEAMBUILDING_ID = "d8d96ce7-8828-41c9-8b02-9d2b14423f8a";
const GROUP_ID = "cmp28uk1b000l99e5m764g2wx";

async function main() {
  const fysiskTest = await prisma.groupSchedule.update({
    where: { id: FYSISK_TEST_ID },
    data: {
      startAt: new Date("2026-09-02T06:00:00Z"),
      endAt: new Date("2026-09-02T13:00:00Z"),
      location: "WANG Toppidrett Styrkerom",
    },
  });
  console.log(`Flyttet fysisktest: ${fysiskTest.title} → 2.9, ${fysiskTest.location}`);

  const retest = await prisma.groupSchedule.update({
    where: { id: RETEST_ID },
    data: {
      startAt: new Date("2026-10-14T06:00:00Z"),
      endAt: new Date("2026-10-14T10:00:00Z"),
      description: "Re-test av fysisk baseline fra 2.9.",
    },
  });
  console.log(`Skjøv re-test: ${retest.title} → 14.10`);

  const teambuilding = await prisma.groupSchedule.delete({ where: { id: TEAMBUILDING_ID } }).catch((e) => {
    if (e?.code === "P2025") return null; // allerede fjernet — idempotent
    throw e;
  });
  console.log(teambuilding ? `Fjernet: ${teambuilding.title} (24.8, Grensen)` : "Teambuilding-raden var alt fjernet.");

  const finnesFraFor = await prisma.groupSchedule.findFirst({
    where: { groupId: GROUP_ID, title: "Heldagssamling — Nøtterøy" },
    select: { id: true },
  });
  if (finnesFraFor) {
    console.log("Heldagssamling Nøtterøy fantes fra før — ingen ny rad opprettet.");
  } else {
    const ny = await prisma.groupSchedule.create({
      data: {
        groupId: GROUP_ID,
        title: "Heldagssamling — Nøtterøy",
        description:
          "Avreise 07.30 fra Fredrikstad Stadion. Returtid ikke bekreftet — sett til kl. 16.00 som plassholder.",
        startAt: new Date("2026-08-21T05:30:00Z"),
        endAt: new Date("2026-08-21T14:00:00Z"),
        location: "Nøtterøy",
        recurring: null,
        kind: "HELDAGSSAMLING",
      },
    });
    console.log(`Opprettet: ${ny.title} (21.8)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
