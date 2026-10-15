/**
 * Bookingplanen steg 2 (Anders 15.10.2026): tjenesten eier sted, buffer før og
 * etter, minste varsel, maks dager fram og kategori.
 *
 * Rent tillegg, ingen rader endres:
 * - `service_types.locationId` (TEXT, FK til locations, null = ikke satt)
 * - `service_types.bufferForMin` / `bufferEtterMin` (INT, default 0)
 * - `service_types.minVarselTimer` (INT, default 24)
 * - `service_types.maksDagerFram` (INT, default 7)
 * - `service_types.kategori` (TEXT, null = ikke satt)
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Målet må oppgis eksplisitt
 * som host:port/database, ellers stopper skriptet. Idempotent.
 *
 *   SERVICE_TYPE_EXPECT_TARGET=<host>:<port>/<database> npx tsx scripts/add-service-type-booking-felter-2026-10-15.ts
 */
import "./_env";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const MIGRATION_SQL = join(
  __dirname,
  "..",
  "prisma/migrations/20261015230000_service_type_booking_felter/migration.sql",
);

const KOLONNER = ["locationId", "bufferForMin", "bufferEtterMin", "minVarselTimer", "maksDagerFram", "kategori"];

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const parsed = new URL(url);
  const target = `${parsed.hostname}:${parsed.port}${parsed.pathname}`;
  const expected = process.env.SERVICE_TYPE_EXPECT_TARGET;
  if (!expected || expected !== target) {
    throw new Error(`DIRECT_URL (${target}) samsvarer ikke med SERVICE_TYPE_EXPECT_TARGET.`);
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query(readFileSync(MIGRATION_SQL, "utf-8"));
    await client.query("COMMIT");
    const { rows } = await client.query(
      `select column_name from information_schema.columns
       where table_name = 'service_types' and column_name = any($1)
       order by column_name`,
      [KOLONNER],
    );
    console.log(
      `Kolonner etter kjøring (${rows.length}/${KOLONNER.length}): ${rows.map((r: { column_name: string }) => r.column_name).join(", ")}`,
    );
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : "Ukjent feil");
  process.exit(1);
});
