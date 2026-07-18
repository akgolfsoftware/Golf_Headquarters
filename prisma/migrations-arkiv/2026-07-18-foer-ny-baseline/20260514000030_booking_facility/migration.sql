ALTER TABLE "bookings"
  ADD COLUMN "facilityId" TEXT;

CREATE INDEX "bookings_facilityId_idx" ON "bookings"("facilityId");

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_facilityId_fkey"
  FOREIGN KEY ("facilityId") REFERENCES "facilities"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
