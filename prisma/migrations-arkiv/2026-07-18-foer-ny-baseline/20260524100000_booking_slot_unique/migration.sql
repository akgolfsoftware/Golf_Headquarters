-- S-12: Booking slot unique constraint (H-13 — race condition fix)
--
-- Hindrer dobbel-booking på DB-nivå via partial unique index.
-- Gjelder kun rader der coachId IS NOT NULL (bookinger med spesifikk coach).
-- Rader der coachId er NULL (drop-in / ukjent coach) er unntatt siden
-- PostgreSQL behandler NULL != NULL og ville tillatt ubegrenset duplisering —
-- drop-in uten coach er kapasitetsbegrenset av facilityId, ikke coach-slot.
--
-- Fanges i server-action som Prisma error-kode P2002.

CREATE UNIQUE INDEX IF NOT EXISTS bookings_slot_unique
  ON bookings ("serviceTypeId", "startAt", "coachId")
  WHERE "coachId" IS NOT NULL;
