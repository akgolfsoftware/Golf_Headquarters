/**
 * Kirurgisk DDL for tak-pakken (DatagolfTak + DatagolfTakBand).
 *
 * Kjør mot DIRECT_URL. Aldri migrate dev / db push / migrate deploy
 * (gotchas.md §Schema-endringer).
 *
 *   npx tsx scripts/add-datagolf-tak-2026-09-08.ts
 */
import "./_env";
import { config } from "dotenv";
import { Client } from "pg";

if (!process.env.DIRECT_URL) {
  config({ path: "../akgolf-hq/.env.local" });
}

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "datagolf_tak" (
        "id" TEXT NOT NULL,
        "dgPlayerId" INTEGER NOT NULL,
        "name" TEXT NOT NULL,
        "country" TEXT,
        "sortOrder" INTEGER NOT NULL DEFAULT 100,
        "formLabel" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "asOf" TIMESTAMP(3) NOT NULL,
        "sgTotal" DOUBLE PRECISION,
        "sgOtt" DOUBLE PRECISION,
        "sgApp" DOUBLE PRECISION,
        "sgArg" DOUBLE PRECISION,
        "sgPutt" DOUBLE PRECISION,
        "drivingDistY" DOUBLE PRECISION,
        "drivingAcc" DOUBLE PRECISION,
        "dgRank" INTEGER,
        "owgrRank" INTEGER,
        "primaryTour" TEXT,
        "source" TEXT NOT NULL DEFAULT 'datagolf',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "datagolf_tak_pkey" PRIMARY KEY ("id")
      );
    `);
    await client.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "datagolf_tak_dgPlayerId_key" ON "datagolf_tak"("dgPlayerId");`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS "datagolf_tak_isActive_sortOrder_idx" ON "datagolf_tak"("isActive", "sortOrder");`,
    );

    await client.query(`
      CREATE TABLE IF NOT EXISTS "datagolf_tak_band" (
        "id" TEXT NOT NULL,
        "takId" TEXT NOT NULL,
        "band" TEXT NOT NULL,
        "lie" TEXT NOT NULL,
        "proximityMeters" DOUBLE PRECISION,
        "sgPerShot" DOUBLE PRECISION,
        "girRate" DOUBLE PRECISION,
        "goodShotRate" DOUBLE PRECISION,
        "shotCount" INTEGER,
        CONSTRAINT "datagolf_tak_band_pkey" PRIMARY KEY ("id")
      );
    `);
    await client.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "datagolf_tak_band_takId_band_lie_key" ON "datagolf_tak_band"("takId", "band", "lie");`,
    );
    await client.query(
      `CREATE INDEX IF NOT EXISTS "datagolf_tak_band_takId_idx" ON "datagolf_tak_band"("takId");`,
    );
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "datagolf_tak_band"
          ADD CONSTRAINT "datagolf_tak_band_takId_fkey"
          FOREIGN KEY ("takId") REFERENCES "datagolf_tak"("id")
          ON DELETE CASCADE ON UPDATE CASCADE;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    console.log("datagolf_tak + datagolf_tak_band OK");
  } finally {
    await client.end();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
