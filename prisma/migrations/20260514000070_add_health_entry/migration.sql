-- HealthEntry (H1) — manuell helse-logg, én rad per (userId, date)
CREATE TABLE "health_entries" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "date" DATE NOT NULL,
  "restingHr" INTEGER,
  "sleepHours" DOUBLE PRECISION,
  "weightKg" DOUBLE PRECISION,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "health_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "health_entries_userId_date_key"
  ON "health_entries"("userId", "date");
CREATE INDEX "health_entries_userId_date_idx"
  ON "health_entries"("userId", "date");

ALTER TABLE "health_entries"
  ADD CONSTRAINT "health_entries_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
