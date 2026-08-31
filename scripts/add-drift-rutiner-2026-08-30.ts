/**
 * MASTERPLAN 15.2 — kirurgisk DDL for `drift_rutiner`.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer — prod-historikken er baselinet
 * og alle tre kommandoene feiler på den samme gamle migrasjonen).
 *
 * Idempotent. Kolonnenavn matcher Prisma (camelCase).
 *
 *   npx tsx scripts/add-drift-rutiner-2026-08-30.ts
 *   npx tsx scripts/add-drift-rutiner-2026-08-30.ts --rollback
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
      await client.query(`DROP TABLE IF EXISTS "drift_rutiner";`);
      console.log("drift_rutiner droppet");
      return;
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS "drift_rutiner" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "tittel" TEXT NOT NULL,
        "detalj" TEXT,
        "frekvens" TEXT NOT NULL,
        "naar" TEXT,
        "automatiserbar" BOOLEAN NOT NULL DEFAULT false,
        "aktiv" BOOLEAN NOT NULL DEFAULT true,
        "sistUtfort" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "drift_rutiner_userId_aktiv_frekvens_idx"
        ON "drift_rutiner"("userId", "aktiv", "frekvens");
    `);

    const { rows } = await client.query(
      `select count(*)::int as n from "drift_rutiner"`,
    );
    console.log(`drift_rutiner klar — ${rows[0].n} rader`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
