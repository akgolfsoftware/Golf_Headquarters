-- TalentTracking
CREATE TABLE "talent_tracking" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "niva" TEXT NOT NULL,
  "klubb" TEXT,
  "region" TEXT,
  "inkludertFra" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "fysisk" INTEGER,
  "teknikk" INTEGER,
  "taktikk" INTEGER,
  "mental" INTEGER,
  "motivasjon" INTEGER,
  "milepaeler" JSONB,
  "notater" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "talent_tracking_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "talent_tracking_userId_key" ON "talent_tracking"("userId");
CREATE INDEX "talent_tracking_niva_region_idx" ON "talent_tracking"("niva", "region");
CREATE INDEX "talent_tracking_klubb_idx" ON "talent_tracking"("klubb");
ALTER TABLE "talent_tracking"
  ADD CONSTRAINT "talent_tracking_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- TalentRessurs
CREATE TABLE "talent_ressurser" (
  "id" TEXT NOT NULL,
  "tittel" TEXT NOT NULL,
  "kategori" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "niva" TEXT,
  "fokus" TEXT,
  "beskrivelse" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "talent_ressurser_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "talent_ressurser_kategori_niva_idx" ON "talent_ressurser"("kategori", "niva");
CREATE INDEX "talent_ressurser_fokus_idx" ON "talent_ressurser"("fokus");
