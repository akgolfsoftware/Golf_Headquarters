/**
 * Seed én kollisjon i AgencyOS-kalenderen, for å kunne SE detaljkolonnens
 * kollisjonsvarsel og «Flytt til …»-knappen (PP-2.4 steg 3).
 *
 * Kjør: npx tsx scripts/seed-kalender-kollisjon.ts
 * Angre: npx tsx scripts/seed-kalender-kollisjon.ts --fjern
 *
 * HVORFOR EN KALENDERHENDELSE OG IKKE TO BOOKINGER
 * Databasen har en exclusion-constraint (`booking_coach_no_overlap`) som gjør at
 * to overlappende bookinger for samme coach ikke KAN settes inn. Fasitens
 * kollisjon (coaching × coaching) er derfor umulig å seede — og det er nettopp
 * grunnen til at kollisjonsregelen i `src/lib/domain/kalender-belegg.ts` ble
 * utvidet til også å dekke coaching × sperret tid. Denne raden lager den ekte
 * varianten: en coachingtime som krasjer med et møte.
 *
 * Idempotent: fast id, upsert. Rører ingenting annet enn sin egen rad, og kun
 * for testcoachen `coachtest@akgolf.test`.
 */

import "./_env";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const RAD_ID = "demo-kollisjon-mandag";
const COACH_EPOST = "coachtest@akgolf.test";

/** Mandag 00:00 i inneværende uke, lokal tid (samme matte som kalenderloaderen). */
function mandagDenneUka(): Date {
  const m = new Date();
  m.setHours(0, 0, 0, 0);
  m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
  return m;
}

async function main() {
  const fjern = process.argv.includes("--fjern");

  if (fjern) {
    await prisma.calendarEvent.deleteMany({ where: { id: RAD_ID } });
    console.log(`Fjernet ${RAD_ID}.`);
    return;
  }

  const coach = await prisma.user.findUnique({
    where: { email: COACH_EPOST },
    select: { id: true, name: true },
  });
  if (!coach) {
    console.error(`Fant ikke ${COACH_EPOST}. Kjør scripts/seed-screentest-coach.ts først.`);
    process.exit(1);
  }

  const mandag = mandagDenneUka();

  // Finn en booking å kollidere med, i stedet for å anta at 09:00 er opptatt.
  // Uten dette ville scriptet lage en hendelse uten kollisjon så snart
  // demo-bookingene flyttet seg.
  const booking = await prisma.booking.findFirst({
    where: {
      coachId: coach.id,
      startAt: { gte: mandag, lt: new Date(mandag.getTime() + 7 * 86_400_000) },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    orderBy: { startAt: "asc" },
    select: { id: true, startAt: true, endAt: true },
  });
  if (!booking) {
    console.error("Ingen booking for testcoachen denne uka — ingenting å kollidere med.");
    process.exit(1);
  }

  // Overlapp den siste halvtimen av bookingen, og strekk oss en halvtime forbi.
  // Da har «Flytt til …» et sted å flytte TIL (rett etter møtet).
  const start = new Date(booking.endAt.getTime() - 30 * 60_000);
  const slutt = new Date(booking.endAt.getTime() + 30 * 60_000);

  await prisma.calendarEvent.upsert({
    where: { id: RAD_ID },
    create: {
      id: RAD_ID,
      coachId: coach.id,
      title: "Møte med anleggsleder",
      startAt: start,
      endAt: slutt,
      notes: "Demo-rad for PP-2.4 kollisjonsvisning. Trygg å slette.",
    },
    update: { coachId: coach.id, startAt: start, endAt: slutt, title: "Møte med anleggsleder" },
  });

  const t = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  console.log(
    `Kollisjon seedet for ${coach.name}: booking ${t(booking.startAt)}–${t(booking.endAt)} ` +
      `× møte ${t(start)}–${t(slutt)}. Overlapp ${t(start)}–${t(booking.endAt)}.`,
  );
  console.log(`Angre: npx tsx scripts/seed-kalender-kollisjon.ts --fjern`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
