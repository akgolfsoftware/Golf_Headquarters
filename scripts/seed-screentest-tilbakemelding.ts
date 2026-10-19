/**
 * En skrevet tilbakemelding fra coach for screentest@akgolf.test, så PH-21 Tilbakemelding
 * (/portal/coach/tilbakemelding/[oktId]) kan sammenlignes med tegningen
 * (docs/design-system/utkast-playerhq/booking-meldinger.html, «tilbakemelding»).
 *
 * Legger inn én gjennomført økt (TrainingSessionV2, COMPLETED) med coachtest som coach: coachens tekst i
 * notes, coachRatedAt og «Tre ting å ta med» i completedSummary. Datoen er sist fredag kl. 16.
 *
 * SCOPE: bare raden med generertFra = SEED_KILDE. Rører ingen andre brukere eller økter. Idempotent (upsert).
 * Kjør: npx tsx scripts/seed-screentest-tilbakemelding.ts
 */
import "./_env";

import { prisma } from "@/lib/prisma";

const SEED_KILDE = "seed:designkontroll-tilbakemelding";

async function main() {
  const spiller = await prisma.user.findUnique({ where: { email: "screentest@akgolf.test" }, select: { id: true } });
  const coach = await prisma.user.findUnique({ where: { email: "coachtest@akgolf.test" }, select: { id: true } });
  if (!spiller || !coach) throw new Error("Fant ikke screentest eller coachtest");

  const naa = new Date();
  const fredag = new Date(Date.UTC(naa.getUTCFullYear(), naa.getUTCMonth(), naa.getUTCDate() - ((naa.getUTCDay() + 2) % 7 || 7), 14, 0));
  const slutt = new Date(fredag.getTime() + 75 * 60_000);
  const skrevet = new Date(slutt.getTime() + 3 * 3600_000);

  const data = {
    title: "Svingtrening P6–P7",
    studentId: spiller.id,
    coachId: coach.id,
    startTime: fredag,
    endTime: slutt,
    miljo: "M1" as const,
    practiceType: "BLOKK" as const,
    status: "COMPLETED" as const,
    location: "Simulator 2 · Fredrikstad",
    notes: "Bra økt. Ballstarten ble jevnere utover, og du holdt farten nede som avtalt.\n\nNeste to uker jobber vi videre med P6.0 på 75 %. Øktene ligger i planen din.",
    completedSummary: {
      coachRatedAt: skrevet.toISOString(),
      coachRatedById: coach.id,
      coachTakeaways: [
        "Hold køllen parallell lenger i P6.0. Du slipper vinkelen for tidlig på 80 %.",
        "Ballstarten er bedre. Club Path gikk fra −4,1 til −1,8 grader i løpet av økta.",
        "Ikke opp i fart før vi har sjekket igjen. Bli på 75 % av Club Speed til bevegelsen sitter.",
      ],
    },
  };
  const okt = await prisma.trainingSessionV2.upsert({
    where: { generertFra_generertFraId: { generertFra: SEED_KILDE, generertFraId: spiller.id } },
    update: data,
    create: { ...data, generertFra: SEED_KILDE, generertFraId: spiller.id },
    select: { id: true },
  });
  console.log(`Tilbakemelding klar: /portal/coach/tilbakemelding/${okt.id}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
