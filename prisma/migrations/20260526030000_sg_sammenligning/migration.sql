-- Stats Fase 4: SG-sammenligning + estimater

CREATE TABLE "bruker_sg_inputs" (
  "id"           TEXT NOT NULL,
  "userId"       TEXT NOT NULL,
  "dato"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "periodeFra"   TIMESTAMP(3),
  "periodeTil"   TIMESTAMP(3),
  "sgOtt"        DOUBLE PRECISION,
  "sgApp"        DOUBLE PRECISION,
  "sgArg"        DOUBLE PRECISION,
  "sgPutt"       DOUBLE PRECISION,
  "sgTotal"      DOUBLE PRECISION,
  "snittScore"   DOUBLE PRECISION,
  "antallRunder" INTEGER,
  "kilde"        TEXT NOT NULL DEFAULT 'MANUELL',
  "kommentar"    TEXT,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,

  CONSTRAINT "bruker_sg_inputs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "bruker_sammenligninger" (
  "id"              TEXT NOT NULL,
  "userId"          TEXT NOT NULL,
  "sgInputId"       TEXT NOT NULL,
  "refDgPlayerId"   INTEGER NOT NULL,
  "refPlayerName"   TEXT NOT NULL,
  "refTour"         TEXT NOT NULL DEFAULT 'pga',
  "refYear"         INTEGER NOT NULL,
  "estPgaTourScore" DOUBLE PRECISION,
  "estHcp"          DOUBLE PRECISION,
  "sgDiffTotal"     DOUBLE PRECISION,
  "kommentar"       TEXT,
  "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "bruker_sammenligninger_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "bruker_sg_inputs"
  ADD CONSTRAINT "bruker_sg_inputs_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bruker_sammenligninger"
  ADD CONSTRAINT "bruker_sammenligninger_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "bruker_sammenligninger"
  ADD CONSTRAINT "bruker_sammenligninger_sgInputId_fkey"
  FOREIGN KEY ("sgInputId") REFERENCES "bruker_sg_inputs"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "bruker_sg_inputs_userId_dato_idx"
  ON "bruker_sg_inputs"("userId", "dato");

CREATE INDEX "bruker_sammenligninger_userId_createdAt_idx"
  ON "bruker_sammenligninger"("userId", "createdAt");
