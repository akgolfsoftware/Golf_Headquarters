-- Banedatabase (Stats Fase)
-- Ny tabell for norske golfbaner med slope, CR, par og region

CREATE TABLE "baner" (
  "id"                      TEXT NOT NULL,
  "slug"                    TEXT NOT NULL,
  "navn"                    TEXT NOT NULL,
  "kortNavn"                TEXT,
  "klubb"                   TEXT NOT NULL,
  "region"                  TEXT NOT NULL,
  "kommune"                 TEXT,
  "fylke"                   TEXT,
  "latitude"                DOUBLE PRECISION,
  "longitude"               DOUBLE PRECISION,
  "antallHull"              INTEGER NOT NULL DEFAULT 18,
  "oppstartsaar"            INTEGER,
  "hjemmeside"              TEXT,
  "lengdeMeter"             INTEGER,
  "slope"                   INTEGER,
  "courseRating"            DOUBLE PRECISION,
  "par"                     INTEGER NOT NULL DEFAULT 72,
  "bio"                     TEXT,
  "hovedBilde"              TEXT,
  "totaltAntallTurneringer" INTEGER NOT NULL DEFAULT 0,
  "spillereSomHarSpilt"     INTEGER NOT NULL DEFAULT 0,
  "lavesteRundeRegistrert"  INTEGER,
  "createdAt"               TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"               TIMESTAMP(3) NOT NULL,

  CONSTRAINT "baner_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "baner_slug_key" ON "baner"("slug");
CREATE INDEX "baner_region_idx" ON "baner"("region");
CREATE INDEX "baner_slug_idx" ON "baner"("slug");
