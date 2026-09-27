/**
 * Kirurgisk DDL — retningsfelt for utfordringer: `higherIsBetter` på
 * `drill_challenges` (hvilken vei rangeringen sorterer for én utfordring) og
 * på `ExerciseDefinition` (øvelsens faste retning, når kjent — null = fritt
 * valg per utfordring).
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer).
 *
 * Idempotent. Kolonnenavn matcher Prisma (camelCase).
 *
 *   npx tsx scripts/add-utfordring-retning-2026-09-22.ts
 *   npx tsx scripts/add-utfordring-retning-2026-09-22.ts --rollback
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
      await client.query(`
        ALTER TABLE "drill_challenges" DROP COLUMN IF EXISTS "higherIsBetter";
      `);
      await client.query(`
        ALTER TABLE "exercise_definitions" DROP COLUMN IF EXISTS "higherIsBetter";
      `);
      console.log("higherIsBetter droppet fra drill_challenges og exercise_definitions");
      return;
    }

    await client.query(`
      ALTER TABLE "drill_challenges"
        ADD COLUMN IF NOT EXISTS "higherIsBetter" BOOLEAN NOT NULL DEFAULT true;
    `);
    await client.query(`
      ALTER TABLE "exercise_definitions"
        ADD COLUMN IF NOT EXISTS "higherIsBetter" BOOLEAN;
    `);

    const { rows } = await client.query(`
      select
        (select count(*)::int from "drill_challenges") as n_utfordringer,
        (select count(*)::int from "exercise_definitions" where "higherIsBetter" is not null) as ovelser_med_retning
    `);
    console.log(
      `higherIsBetter klar — ${rows[0].n_utfordringer} utfordringer (default høyest vinner), ${rows[0].ovelser_med_retning} øvelser med satt retning`,
    );
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
