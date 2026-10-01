/**
 * Ny periodetype RESTITUSJON (Anders 28.09.2026, beslutninger.md §PERIODENE HETER).
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer).
 *
 * Rent tillegg: legger RESTITUSJON til LPhase og PeriodeType. Ingen rader endres.
 * Idempotent — kan kjøres på nytt uten feil.
 *
 *   npx tsx scripts/add-restitusjon-periode-2026-09-28.ts
 */
import "./_env";
import { Client } from "pg";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query(`ALTER TYPE "LPhase" ADD VALUE IF NOT EXISTS 'RESTITUSJON';`);
    await client.query(`ALTER TYPE "PeriodeType" ADD VALUE IF NOT EXISTS 'RESTITUSJON';`);

    const { rows } = await client.query(`
      select typname, enumlabel from pg_enum e join pg_type t on t.oid = e.enumtypid
      where typname in ('LPhase', 'PeriodeType') order by typname, enumsortorder
    `);
    console.log("Enum-verdier etter kjøring:", rows);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
