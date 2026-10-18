/**
 * Plannivåene henger sammen, punkt 4 (Anders 14.10.2026): gruppas periode fordeler
 * minutter per akse FYS · TEK · SLAG · SPILL · TURN for en vanlig og en lett uke,
 * som spillerens periode (add-period-axis-minutes-2026-10-14.ts).
 *
 * Rent tillegg, ingen rader endres:
 * - `group_period_blocks.axisMinutes` (JSONB, null = ikke satt)
 * - `group_period_blocks.axisMinutesLight` (JSONB, null = ikke satt)
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Målet må oppgis eksplisitt
 * som host:port/database, ellers stopper skriptet. Idempotent.
 *
 *   GROUP_PERIOD_AXIS_EXPECT_TARGET=<host>:<port>/<database> npx tsx scripts/add-group-period-axis-minutes-2026-10-14.ts
 *
 * Produksjon: kjøres først når Anders har sagt ja.
 */
import "./_env";
import { Client } from "pg";

export const GROUP_PERIOD_AXIS_MINUTES_SQL = [
  `ALTER TABLE "group_period_blocks" ADD COLUMN IF NOT EXISTS "axisMinutes" JSONB`,
  `ALTER TABLE "group_period_blocks" ADD COLUMN IF NOT EXISTS "axisMinutesLight" JSONB`,
];

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const parsed = new URL(url);
  const target = `${parsed.hostname}:${parsed.port}${parsed.pathname}`;
  const expected = process.env.GROUP_PERIOD_AXIS_EXPECT_TARGET;
  if (!expected || expected !== target) {
    throw new Error("DIRECT_URL samsvarer ikke med GROUP_PERIOD_AXIS_EXPECT_TARGET.");
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("BEGIN");
    for (const sql of GROUP_PERIOD_AXIS_MINUTES_SQL) await client.query(sql);
    await client.query("COMMIT");
    const { rows } = await client.query(
      `select column_name from information_schema.columns
       where table_name = 'group_period_blocks' and column_name in ('axisMinutes','axisMinutesLight')
       order by column_name`,
    );
    console.log(`Kolonner etter kjøring: ${rows.map((r: { column_name: string }) => r.column_name).join(", ")}`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    await client.end();
  }
}

if (process.argv[1]?.endsWith("add-group-period-axis-minutes-2026-10-14.ts")) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : "Ukjent feil");
    process.exit(1);
  });
}
