/**
 * Seed én WorkbenchSession for screentest@akgolf.test som matcher PH-01
 * «I dag»-fasitens Nå-kort (Innspill 50–80 m, Range, 09:00–09:50, IN_PROGRESS)
 * — brukes av sign-off-riggen (scripts/train-lock-pixel-diff.mjs) sammen med
 * dato-overstyringen i src/lib/testing/dato-override.ts for å fryse "i dag"
 * til fasitens dato (lørdag 22. august 2026) under diff-kjøring.
 *
 * VIKTIG (lært i denne økten): "I dag"-skjermen leser `loadPlayerDay()` →
 * `WorkbenchSession` (wb-actions.ts), IKKE `TrainingSessionV2` — økt-data er
 * fragmentert over flere tabeller (dokumentert i
 * docs/arkitektur-kartlegging-2026-08-30.md). Riktig tabell for denne
 * skjermen er WorkbenchSession.
 *
 * Idempotent: matcher på (playerId, date, startMinute, title) og oppdaterer
 * i stedet for å duplisere.
 *
 * Kjør: npx tsx scripts/seed-ph01-signoff-fixture.ts
 */
import "./_env";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const SPILLER_EPOST = "screentest@akgolf.test";
const DATO = new Date(Date.UTC(2026, 7, 22)); // 22. august 2026, UTC-midnatt (db.Date-kolonne)
const START_MINUTT = 9 * 60; // 09:00 Oslo
const VARIGHET_MIN = 50; // → 09:50
const TITTEL = "Innspill 50–80 m";

async function main() {
  const spiller = await prisma.user.findUnique({ where: { email: SPILLER_EPOST } });
  if (!spiller) throw new Error(`Fant ikke bruker ${SPILLER_EPOST} — kjør seed-screentest-coach.ts / opprett kontoen først.`);

  const coach = await prisma.user.findFirst({ where: { role: "ADMIN" }, orderBy: { createdAt: "asc" } });
  if (!coach) throw new Error("Fant ingen ADMIN-bruker å bruke som coachId.");

  const eksisterende = await prisma.workbenchSession.findFirst({
    where: { playerId: spiller.id, date: DATO, startMinute: START_MINUTT, title: TITTEL },
  });

  const data = {
    playerId: spiller.id,
    coachId: coach.id,
    date: DATO,
    startMinute: START_MINUTT,
    durationMinutes: VARIGHET_MIN,
    title: TITTEL,
    pyramid: "SLAG",
    status: "PUBLISHED",
    location: "Range",
    origin: "COACH",
    createdBy: coach.id,
  };

  if (eksisterende) {
    await prisma.workbenchSession.update({ where: { id: eksisterende.id }, data });
    console.log(`Oppdatert eksisterende WorkbenchSession ${eksisterende.id}`);
  } else {
    const ny = await prisma.workbenchSession.create({ data });
    console.log(`Opprettet ny WorkbenchSession ${ny.id}`);
  }

  // Rydd bort feilseedet TrainingSessionV2-rad fra første (feilslåtte) forsøk
  // i denne økten — feil tabell for denne skjermen, ingen andre leser den her.
  const feilseedet = await prisma.trainingSessionV2.findFirst({
    where: { studentId: spiller.id, title: TITTEL },
  });
  if (feilseedet) {
    await prisma.trainingSessionV2.delete({ where: { id: feilseedet.id } });
    console.log(`Ryddet feilseedet TrainingSessionV2 ${feilseedet.id} (feil tabell, fra første forsøk)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
