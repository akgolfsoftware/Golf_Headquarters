-- Bookingplanen steg 2 (15.10.2026): tjenesten eier sted, buffer, minste varsel,
-- maks dager fram og kategori. Rent tillegg, ingen rader endres.
-- Lagt inn i basen med scripts/add-service-type-booking-felter-2026-10-15.ts
-- (gotchas §Database); denne fila er bare en record.
ALTER TABLE "service_types" ADD COLUMN IF NOT EXISTS "locationId" TEXT;
ALTER TABLE "service_types" ADD COLUMN IF NOT EXISTS "bufferForMin" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "service_types" ADD COLUMN IF NOT EXISTS "bufferEtterMin" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "service_types" ADD COLUMN IF NOT EXISTS "minVarselTimer" INTEGER NOT NULL DEFAULT 24;
ALTER TABLE "service_types" ADD COLUMN IF NOT EXISTS "maksDagerFram" INTEGER NOT NULL DEFAULT 7;
ALTER TABLE "service_types" ADD COLUMN IF NOT EXISTS "kategori" TEXT;
CREATE INDEX IF NOT EXISTS "service_types_locationId_idx" ON "service_types"("locationId");
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'service_types_locationId_fkey') THEN
    ALTER TABLE "service_types" ADD CONSTRAINT "service_types_locationId_fkey"
      FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
