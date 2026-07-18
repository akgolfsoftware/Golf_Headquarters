-- FYS-plan modul: fysisk treningsplan (styrke/kondisjon)
-- Hierarki: FysiskPlan -> FysUke -> FysOkt -> FysOvelseRad
-- Per plan Del 31

-- Ukedag enum
CREATE TYPE "Ukedag" AS ENUM ('MAN', 'TIR', 'ONS', 'TOR', 'FRE', 'LOR', 'SON');

-- FysiskPlan
CREATE TABLE "fysiske_planer" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "opprettetAvId" TEXT NOT NULL,
  "navn" TEXT NOT NULL,
  "status" "TechPlanStatus" NOT NULL DEFAULT 'DRAFT',
  "startDato" TIMESTAMP(3) NOT NULL,
  "sluttDato" TIMESTAMP(3),
  "notater" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "fysiske_planer_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "fysiske_planer_userId_status_idx" ON "fysiske_planer"("userId", "status");

ALTER TABLE "fysiske_planer" ADD CONSTRAINT "fysiske_planer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fysiske_planer" ADD CONSTRAINT "fysiske_planer_opprettetAvId_fkey" FOREIGN KEY ("opprettetAvId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- FysUke
CREATE TABLE "fys_uker" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "ukeNr" INTEGER NOT NULL,
  "label" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  CONSTRAINT "fys_uker_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "fys_uker_planId_ukeNr_key" ON "fys_uker"("planId", "ukeNr");
CREATE INDEX "fys_uker_planId_sortOrder_idx" ON "fys_uker"("planId", "sortOrder");

ALTER TABLE "fys_uker" ADD CONSTRAINT "fys_uker_planId_fkey" FOREIGN KEY ("planId") REFERENCES "fysiske_planer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- FysOkt
CREATE TABLE "fys_okter" (
  "id" TEXT NOT NULL,
  "ukeId" TEXT NOT NULL,
  "navn" TEXT NOT NULL,
  "dag" "Ukedag",
  "sortOrder" INTEGER NOT NULL,
  "estimertMinutter" INTEGER,
  CONSTRAINT "fys_okter_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "fys_okter_ukeId_sortOrder_idx" ON "fys_okter"("ukeId", "sortOrder");

ALTER TABLE "fys_okter" ADD CONSTRAINT "fys_okter_ukeId_fkey" FOREIGN KEY ("ukeId") REFERENCES "fys_uker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- FysOvelseRad
CREATE TABLE "fys_ovelse_rader" (
  "id" TEXT NOT NULL,
  "oktId" TEXT NOT NULL,
  "exerciseId" TEXT,
  "navn" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "sett" INTEGER NOT NULL DEFAULT 3,
  "repsMin" INTEGER,
  "repsMax" INTEGER,
  "hvile" INTEGER,
  "belastningPst" INTEGER,
  "rir" INTEGER,
  "muskelgruppe" TEXT,
  "loggSett" INTEGER,
  "loggRepsPerSett" TEXT,
  "loggBelastningKg" DOUBLE PRECISION,
  "loggRir" INTEGER,
  "notat" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "fys_ovelse_rader_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "fys_ovelse_rader_oktId_sortOrder_idx" ON "fys_ovelse_rader"("oktId", "sortOrder");

ALTER TABLE "fys_ovelse_rader" ADD CONSTRAINT "fys_ovelse_rader_oktId_fkey" FOREIGN KEY ("oktId") REFERENCES "fys_okter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "fys_ovelse_rader" ADD CONSTRAINT "fys_ovelse_rader_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercise_definitions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
