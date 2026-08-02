-- PeriodeNavnMapping: coach-lagt oversettelse fra fritekst periodenavn
-- (TrainingPeriod.name) til PeriodeType, i tillegg til den hardkodede
-- ordboken i periode-navn.ts. Lar et ukjent navn kobles til en periodetype
-- uten kodeendring. "navn" lagres trim+lowercase-normalisert.

CREATE TABLE "periode_navn_mappinger" (
  "id"            TEXT NOT NULL,
  "navn"          TEXT NOT NULL,
  "periodeType"   TEXT NOT NULL,
  "oppdatertAvId" TEXT,
  "oppdatertAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "periode_navn_mappinger_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "periode_navn_mappinger_navn_key" ON "periode_navn_mappinger"("navn");

ALTER TABLE "periode_navn_mappinger" ENABLE ROW LEVEL SECURITY;
