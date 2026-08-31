/**
 * MASTERPLAN 16.6 — kirurgisk DDL for `public_player_entries.clubName`/`klasseNavn`.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer — prod-historikken er baselinet
 * og alle tre kommandoene feiler på den samme gamle migrasjonen).
 *
 * Idempotent. Kolonnenavn matcher Prisma (camelCase).
 *
 *   npx tsx scripts/add-club-klasse-2026-08-31.ts
 *   npx tsx scripts/add-club-klasse-2026-08-31.ts --rollback
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
      await client.query(
        `ALTER TABLE "public_player_entries" DROP COLUMN IF EXISTS "clubName";`,
      );
      await client.query(
        `ALTER TABLE "public_player_entries" DROP COLUMN IF EXISTS "klasseNavn";`,
      );
      console.log("public_player_entries.clubName/klasseNavn droppet");
      return;
    }

    await client.query(`
      ALTER TABLE "public_player_entries"
        ADD COLUMN IF NOT EXISTS "clubName" TEXT,
        ADD COLUMN IF NOT EXISTS "klasseNavn" TEXT;
    `);

    const { rows } = await client.query(`
      select count(*)::int as n,
        count(*) filter (where "clubName" is not null)::int as med_klubb,
        count(*) filter (where "klasseNavn" is not null)::int as med_klasse
      from "public_player_entries"
    `);
    console.log(
      `public_player_entries klar — ${rows[0].n} rader (${rows[0].med_klubb} med klubb, ${rows[0].med_klasse} med klasse — begge 0 før neste GolfBox-synk fyller dem)`,
    );
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
