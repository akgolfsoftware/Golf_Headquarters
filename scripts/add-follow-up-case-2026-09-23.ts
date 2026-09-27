/**
 * Kirurgisk DDL — `follow_up_cases` (AG-03b Oppfølgingskø, beslutning
 * 23.09.2026): «Løst» blir en eksplisitt status satt av coach, ikke avledet
 * av annen aktivitet. Erstatter det tidligere Signal-baserte
 * overstyringssporet (kind OPPFOLGING_STATUS).
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer — prod-historikken er baselinet
 * og alle tre kommandoene feiler på den samme gamle migrasjonen).
 *
 * Idempotent. Kolonnenavn matcher Prisma (camelCase).
 *
 *   npx tsx scripts/add-follow-up-case-2026-09-23.ts
 *   npx tsx scripts/add-follow-up-case-2026-09-23.ts --rollback
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
      await client.query(`DROP TABLE IF EXISTS "follow_up_cases";`);
      console.log("follow_up_cases droppet");
      return;
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS "follow_up_cases" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "setById" TEXT NOT NULL,
        "setAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "resolvedAt" TIMESTAMP(3),
        "resolvedById" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "follow_up_cases_userId_key"
        ON "follow_up_cases"("userId");
    `);

    const { rows } = await client.query(`select count(*)::int as n from "follow_up_cases"`);
    console.log(`follow_up_cases klar — ${rows[0].n} rader`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
