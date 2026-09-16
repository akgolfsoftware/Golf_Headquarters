/**
 * Kirurgisk DDL for end-shot-kategorier + putting-detaljer i runde-logg.
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer).
 *
 * Idempotent. Kolonnenavn matcher Prisma (camelCase).
 *
 *   npx tsx scripts/add-slag-detaljer-2026-09-16.ts
 *   npx tsx scripts/add-slag-detaljer-2026-09-16.ts --rollback
 */
import "./_env";
import { Client } from "pg";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const rollback = process.argv.includes("--rollback");

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    if (rollback) {
      await client.query(`DROP TABLE IF EXISTS "putt_details";`);
      await client.query(`ALTER TABLE "shots" DROP COLUMN IF EXISTS "endShotKategori";`);
      await client.query(`DROP TYPE IF EXISTS "EndShotKategori";`);
      await client.query(`DROP TYPE IF EXISTS "PuttBreakRetning";`);
      await client.query(`DROP TYPE IF EXISTS "PuttSlopeAlvorlighet";`);
      await client.query(`DROP TYPE IF EXISTS "PuttLinjeMiss";`);
      await client.query(`DROP TYPE IF EXISTS "PuttFartUtfall";`);
      console.log("Rullet tilbake: putt_details droppet, shots.endShotKategori droppet, enumer droppet");
      return;
    }

    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "EndShotKategori" AS ENUM (
          'IN_PLAY', 'MINOR_MISS', 'MAJOR_MISS', 'GREEN_HIT',
          'LETT', 'MIDDELS', 'VANSKELIG', 'PENALTY_1', 'PENALTY_2'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "PuttBreakRetning" AS ENUM (
          'VENSTRE_HOYRE', 'HOYRE_VENSTRE', 'OPPOVER', 'NEDOVER'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "PuttSlopeAlvorlighet" AS ENUM ('SVAK', 'MODERAT', 'KRAFTIG');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "PuttLinjeMiss" AS ENUM ('VENSTRE', 'HOYRE', 'PAA_LINJE');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "PuttFartUtfall" AS ENUM (
          'HOLED', 'FORBI', 'KORT', 'SONE_FORBI', 'SONE_KORT'
        );
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);

    const cols = await client.query<{ column_name: string }>(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'shots' AND column_name = 'endShotKategori'
    `);
    if (cols.rows.length === 0) {
      await client.query(`
        ALTER TABLE "shots" ADD COLUMN "endShotKategori" "EndShotKategori";
      `);
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS "putt_details" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "shotId" TEXT NOT NULL UNIQUE,
        "lengdeFot" DOUBLE PRECISION NOT NULL,
        "breakRetning" "PuttBreakRetning" NOT NULL,
        "slopeAlvorlighet" "PuttSlopeAlvorlighet" NOT NULL,
        "linjeMiss" "PuttLinjeMiss",
        "fartUtfall" "PuttFartUtfall" NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "putt_details_shotId_fkey"
          FOREIGN KEY ("shotId") REFERENCES "shots"("id")
          ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    const { rows } = await client.query(`SELECT count(*)::int AS n FROM "putt_details"`);
    console.log(`putt_details klar (${rows[0].n} rader) — shots.endShotKategori klar`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
