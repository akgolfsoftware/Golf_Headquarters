/**
 * A2 (booking-trygging) — databasenivå-vern mot dobbeltbooking:
 * EXCLUSION-constraint (btree_gist + tsrange) som avviser to ikke-avlyste
 * bookinger på samme coach i overlappende tidsrom — atomisk i Postgres,
 * immunt mot race conditions. Erstatter de gamle eksakt-likhet-indeksene
 * (som ikke dekket overlapp og lot avlyste rader blokkere re-booking).
 * Forhåndssjekk kjørt 2026-07-13: 0 eksisterende overlapp i prod.
 * Kjøres mot DIRECT_URL (gotcha-mønsteret — migrate dev/db push er blokkert).
 */
import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS btree_gist`);

  await prisma.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'booking_coach_no_overlap'
      ) THEN
        ALTER TABLE "bookings" ADD CONSTRAINT "booking_coach_no_overlap"
        EXCLUDE USING gist (
          "coachId" WITH =,
          tsrange("startAt", "endAt") WITH &&
        ) WHERE ("coachId" IS NOT NULL AND "status" <> 'CANCELLED');
      END IF;
    END $$;
  `);

  // De gamle eksakt-likhet-indeksene er strengt svakere enn EXCLUSION
  // (og manglet status-filter → avlyste rader blokkerte re-booking).
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "bookings_coachId_startAt_serviceTypeId_key"`);
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "booking_slot_unique"`);
  // Prod hadde disse to under andre navn (funnet ved verifisering 2026-07-13):
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "bookings_coachId_startAt_unique"`);
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "bookings_slot_unique"`);

  const sjekk = await prisma.$queryRawUnsafe<{ conname: string }[]>(
    `SELECT conname FROM pg_constraint WHERE conname = 'booking_coach_no_overlap'`,
  );
  console.log("Constraint på plass:", sjekk.length === 1 ? "JA" : "NEI");
}
main().finally(() => prisma.$disconnect());
