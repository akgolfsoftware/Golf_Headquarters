-- S-12: legg til faktisk @@unique constraint mot dobbel-booking på DB-nivå.
-- Erstatter kommentaren som refererte til en constraint som ikke fantes.
-- coachId er nullable (gjest-bookinger) — constraint tillater NULL-duplikater (SQL-standard).
CREATE UNIQUE INDEX "bookings_coachId_startAt_serviceTypeId_key" ON "bookings"("coachId", "startAt", "serviceTypeId");
