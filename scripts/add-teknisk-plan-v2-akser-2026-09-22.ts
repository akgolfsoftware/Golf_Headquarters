/**
 * Kirurgisk DDL — v2-aksene på `position_tasks`: motorikk, belastning, press,
 * dimensjon, sandTrinn og maaleutstyr, pluss enumen `Maaleutstyr`.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer — prod-historikken er baselinet
 * og alle tre kommandoene feiler på den samme gamle migrasjonen).
 *
 * Idempotent. Kolonnenavn matcher Prisma (camelCase).
 *
 *   npx tsx scripts/add-teknisk-plan-v2-akser-2026-09-22.ts
 *   npx tsx scripts/add-teknisk-plan-v2-akser-2026-09-22.ts --rollback
 */
import "./_env";
import { Client } from "pg";

const MAALEUTSTYR = ["TRACKMAN", "FLIGHTSCOPE", "GARMIN_R10", "MEVO_PLUS", "ANNET", "UTEN"] as const;

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const rollback = process.argv.includes("--rollback");

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    if (rollback) {
      await client.query(`
        ALTER TABLE "position_tasks"
          DROP COLUMN IF EXISTS "motorikk",
          DROP COLUMN IF EXISTS "belastning",
          DROP COLUMN IF EXISTS "press",
          DROP COLUMN IF EXISTS "dimensjon",
          DROP COLUMN IF EXISTS "sandTrinn",
          DROP COLUMN IF EXISTS "maaleutstyr";
      `);
      // Enumen droppes ikke: andre tabeller kan ha tatt den i bruk.
      console.log("position_tasks v2-akser droppet (enum Maaleutstyr beholdt)");
      return;
    }

    // CREATE TYPE er ikke idempotent i Postgres — pakkes i en DO-blokk.
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Maaleutstyr') THEN
          CREATE TYPE "Maaleutstyr" AS ENUM (${MAALEUTSTYR.map((v) => `'${v}'`).join(", ")});
        END IF;
      END $$;
    `);

    await client.query(`
      ALTER TABLE "position_tasks"
        ADD COLUMN IF NOT EXISTS "motorikk" "Motorikk",
        ADD COLUMN IF NOT EXISTS "belastning" "Belastning",
        ADD COLUMN IF NOT EXISTS "press" "Press",
        ADD COLUMN IF NOT EXISTS "dimensjon" "OmradeDimensjon",
        ADD COLUMN IF NOT EXISTS "sandTrinn" "SandTrinn",
        ADD COLUMN IF NOT EXISTS "maaleutstyr" "Maaleutstyr";
    `);

    const { rows } = await client.query(`
      select count(*)::int as n,
        count("motorikk")::int as med_motorikk,
        count("dimensjon")::int as med_dimensjon,
        count("maaleutstyr")::int as med_maaleutstyr
      from "position_tasks"
    `);
    console.log(
      `position_tasks klar — ${rows[0].n} oppgaver (${rows[0].med_motorikk} med motorikk, ${rows[0].med_dimensjon} med teknisk fokus, ${rows[0].med_maaleutstyr} med måleutstyr)`,
    );
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
