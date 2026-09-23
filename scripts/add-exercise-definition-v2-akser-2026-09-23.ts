/**
 * Kirurgisk DDL — AK-formel v2-aksene på `exercise_definitions` (AG-11b,
 * beslutning 23.09.2026): treningsområde, motorikk, belastning og press lå
 * tidligere kun på økten/innslaget (SessionDrill, PositionTask), ikke på
 * selve øvelsen. Gjenbruker eksisterende enums (`Omraade`, `Motorikk`,
 * `Belastning`, `Press`) — ingen nye typer.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer — prod-historikken er baselinet
 * og alle tre kommandoene feiler på den samme gamle migrasjonen).
 *
 * Idempotent. Kolonnenavn matcher Prisma (camelCase).
 *
 *   npx tsx scripts/add-exercise-definition-v2-akser-2026-09-23.ts
 *   npx tsx scripts/add-exercise-definition-v2-akser-2026-09-23.ts --rollback
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
        ALTER TABLE "exercise_definitions"
          DROP COLUMN IF EXISTS "omraadeKode",
          DROP COLUMN IF EXISTS "motorikk",
          DROP COLUMN IF EXISTS "belastning",
          DROP COLUMN IF EXISTS "press";
      `);
      console.log("exercise_definitions v2-akser droppet");
      return;
    }

    await client.query(`
      ALTER TABLE "exercise_definitions"
        ADD COLUMN IF NOT EXISTS "omraadeKode" "Omraade",
        ADD COLUMN IF NOT EXISTS "motorikk" "Motorikk",
        ADD COLUMN IF NOT EXISTS "belastning" "Belastning",
        ADD COLUMN IF NOT EXISTS "press" "Press";
    `);

    const { rows } = await client.query(`
      select count(*)::int as n,
        count("omraadeKode")::int as med_omraade,
        count("motorikk")::int as med_motorikk
      from "exercise_definitions"
    `);
    console.log(
      `exercise_definitions klar — ${rows[0].n} øvelser (${rows[0].med_omraade} med område, ${rows[0].med_motorikk} med motorikk)`,
    );
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
