/**
 * WANG Toppidrett Fredrikstad — fast treningstid som mønsterplanlegging.
 *
 * Ett RecurringPattern per aktivt spiller-medlem i wang-toppidrett-gruppen:
 * man/ons/fre 08:00–10:00. Lag 2 i session-generator.ts (genererOkter) leser
 * disse og genererer TrainingSessionV2 automatisk — og hopper siden
 * 2026-08-17 over skoleferier (SchoolScheduleEntry.category "FERIE") for
 * spillere med registrert trinn, på Anders' eksplisitte beskjed.
 *
 * pyramide er påkrevd i skjemaet (ingen nullable variant finnes) — TEK er
 * brukt som nøytral standard, samme fallback apply-template-actions.ts
 * allerede bruker når en øktkategori mangler. Låser ikke innhold: coach
 * forfiner faktisk fokus per uke i Workbench (invariant 1 — anbefalinger
 * sperrer aldri).
 *
 * Idempotent — matcher på (studentId, navn) før create. Trygg å kjøre flere ganger.
 *
 *   npx tsx scripts/seed-wang-monster-treningstid-2026-08-17.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";
import { aktivtSpillerMedlemskapWhere } from "../src/lib/domain/grupper";

loadEnv({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL });
const prisma = new PrismaClient({ adapter });

const GRUPPE_SLUG = "wang-toppidrett";
const NAVN = "WANG Toppidrett — fast treningstid";
const RRULE = "FREQ=WEEKLY;BYDAY=MO,WE,FR";
const START_TID = "08:00";
const VARIGHET_MIN = 120;
const PYRAMIDE = "TEK" as const;

/** Mandag i inneværende uke, UTC-midnatt (gotchas.md: dato-strenger MÅ bruke UTC). */
function ukeMandag(d: Date): Date {
  const dag = (d.getUTCDay() + 6) % 7; // man=0 ... søn=6
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  x.setUTCDate(x.getUTCDate() - dag);
  return x;
}

async function main() {
  const gruppe = await prisma.group.findFirst({
    where: { slug: GRUPPE_SLUG },
    select: { id: true, name: true },
  });
  if (!gruppe) {
    console.error(`Fant ingen Group med slug "${GRUPPE_SLUG}" — avbryter uten å skrive noe.`);
    process.exit(1);
  }

  const medlemmer = await prisma.groupMember.findMany({
    where: { groupId: gruppe.id, ...aktivtSpillerMedlemskapWhere() },
    select: { userId: true, user: { select: { name: true } } },
  });
  if (medlemmer.length === 0) {
    console.error(`"${gruppe.name}" har ingen aktive spillere — avbryter uten å skrive noe.`);
    process.exit(1);
  }

  const startDato = ukeMandag(new Date());
  let opprettet = 0;
  let hoppetOver = 0;

  for (const m of medlemmer) {
    const finnes = await prisma.recurringPattern.findFirst({
      where: { studentId: m.userId, navn: NAVN },
      select: { id: true },
    });
    if (finnes) {
      hoppetOver++;
      continue;
    }
    await prisma.recurringPattern.create({
      data: {
        studentId: m.userId,
        navn: NAVN,
        pyramide: PYRAMIDE,
        rrule: RRULE,
        startDato,
        sluttDato: null,
        startTid: START_TID,
        varighetMin: VARIGHET_MIN,
        beskrivelse: "Fast lagtrening — WANG Toppidrett Fredrikstad.",
      },
    });
    opprettet++;
    console.log(`Opprettet mønster for ${m.user.name ?? m.userId}`);
  }

  console.log(
    `\n${gruppe.name}: ${opprettet} opprettet, ${hoppetOver} fantes fra før (${medlemmer.length} spillere totalt).`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
