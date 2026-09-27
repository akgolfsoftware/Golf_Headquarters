/**
 * Kirurgisk DDL for runde/SG metadata.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer).
 *
 * Idempotent. Kolonnenavn matcher Prisma (camelCase).
 *
 *   npx tsx scripts/add-round-registration-metadata-2026-09-27.ts
 *   npx tsx scripts/add-round-registration-metadata-2026-09-27.ts --rollback
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
      await client.query(`DROP INDEX IF EXISTS "rounds_source_idx";`);
      await client.query(`DROP INDEX IF EXISTS "rounds_userId_status_idx";`);
      await client.query(`
        ALTER TABLE "rounds"
          DROP COLUMN IF EXISTS "importMetadata",
          DROP COLUMN IF EXISTS "partialSave",
          DROP COLUMN IF EXISTS "status",
          DROP COLUMN IF EXISTS "dataQuality",
          DROP COLUMN IF EXISTS "sourceDate",
          DROP COLUMN IF EXISTS "source";
      `);
      console.log("Runde/SG metadata rullet tilbake");
      return;
    }

    await client.query(`
      ALTER TABLE "rounds"
        ADD COLUMN IF NOT EXISTS "source" TEXT,
        ADD COLUMN IF NOT EXISTS "sourceDate" TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "dataQuality" TEXT,
        ADD COLUMN IF NOT EXISTS "status" TEXT,
        ADD COLUMN IF NOT EXISTS "partialSave" BOOLEAN NOT NULL DEFAULT false,
        ADD COLUMN IF NOT EXISTS "importMetadata" JSONB;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS "rounds_userId_status_idx"
        ON "rounds"("userId", "status");
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "rounds_source_idx"
        ON "rounds"("source");
    `);

    const res = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'rounds'
        AND column_name IN ('source', 'sourceDate', 'dataQuality', 'status', 'partialSave', 'importMetadata')
      ORDER BY column_name;
    `);
    console.log("Runde/SG metadata klar:", res.rows);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
