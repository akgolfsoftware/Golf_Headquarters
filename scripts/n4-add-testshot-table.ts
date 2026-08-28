/**
 * N4 — kirurgisk DDL. Kjør mot DIRECT_URL etter merge, aldri migrate/push/deploy.
 *
 * Idempotent. Kolonnenavn matcher Prisma (camelCase, som resten av test_results).
 *
 *   npx tsx scripts/n4-add-testshot-table.ts
 */
import { Client } from "pg";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) {
    throw new Error("DIRECT_URL mangler");
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  console.log("N4: test_shots + vitne-felter");

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS "test_shots" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "testResultId" TEXT NOT NULL,
        "shotNumber" INTEGER NOT NULL,
        "pei" DOUBLE PRECISION,
        "sg" DOUBLE PRECISION,
        "pgaPutts" DOUBLE PRECISION,
        "x" DOUBLE PRECISION,
        "y" DOUBLE PRECISION,
        "retning" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "test_shots_testResultId_fkey"
          FOREIGN KEY ("testResultId") REFERENCES "test_results"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "test_shots_testResultId_shotNumber_idx"
        ON "test_shots"("testResultId", "shotNumber");
    `);

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "TestWitnessStatus" AS ENUM ('PENDING', 'ATTESTED', 'REJECTED');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "TestAttestationMode" AS ENUM ('DIGITAL', 'MANUAL', 'NONE');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    const cols = await client.query<{ column_name: string }>(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'test_results'
        AND column_name IN ('witnessUserId', 'witnessStatus', 'attestationMode')
    `);
    const existing = new Set(cols.rows.map((r) => r.column_name));

    if (!existing.has("witnessUserId")) {
      await client.query(`
        ALTER TABLE "test_results" ADD COLUMN "witnessUserId" TEXT;
        ALTER TABLE "test_results"
          ADD CONSTRAINT "test_results_witnessUserId_fkey"
          FOREIGN KEY ("witnessUserId") REFERENCES "users"("id")
          ON DELETE SET NULL ON UPDATE CASCADE;
      `);
    }
    if (!existing.has("witnessStatus")) {
      await client.query(`
        ALTER TABLE "test_results"
          ADD COLUMN "witnessStatus" "TestWitnessStatus" NOT NULL DEFAULT 'PENDING';
      `);
    }
    if (!existing.has("attestationMode")) {
      await client.query(`
        ALTER TABLE "test_results"
          ADD COLUMN "attestationMode" "TestAttestationMode" NOT NULL DEFAULT 'NONE';
      `);
    }

    await client.query(`
      CREATE INDEX IF NOT EXISTS "test_results_witnessUserId_idx"
        ON "test_results"("witnessUserId");
    `);

    console.log("N4 DDL ferdig");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
