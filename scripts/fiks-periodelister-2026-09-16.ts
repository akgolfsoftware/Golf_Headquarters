/**
 * OW-2 (MASTERPLAN-GJENSTAAENDE.md) — kirurgisk DDL for de to periode-enumene.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer).
 *
 * Gjør LPhase og PeriodeType til samme åtte verdier (ordbok-masteren §4.1):
 *   - LPhase mangler EVALUERING — lagt til (additiv).
 *   - PeriodeType mangler TESTUKE/TRENINGSSAMLING/HELDAGSSAMLING — lagt til
 *     (additiv), og SPESIALISERING omdøpt til SPESIAL (0 rader i basen
 *     bruker verdien pr. 16.09.2026 — verifisert før dette skriptet ble
 *     skrevet, se docs/MASTERPLAN-GJENSTAAENDE.md commit-historikk).
 *
 * Idempotent — kan kjøres på nytt uten feil.
 *
 *   npx tsx scripts/fiks-periodelister-2026-09-16.ts
 */
import "./_env";
import { Client } from "pg";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query(`ALTER TYPE "LPhase" ADD VALUE IF NOT EXISTS 'EVALUERING';`);
    await client.query(`ALTER TYPE "PeriodeType" ADD VALUE IF NOT EXISTS 'TESTUKE';`);
    await client.query(`ALTER TYPE "PeriodeType" ADD VALUE IF NOT EXISTS 'TRENINGSSAMLING';`);
    await client.query(`ALTER TYPE "PeriodeType" ADD VALUE IF NOT EXISTS 'HELDAGSSAMLING';`);

    const { rows: gammel } = await client.query(`
      select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
      where t.typname = 'PeriodeType' and e.enumlabel = 'SPESIALISERING'
    `);
    if (gammel.length > 0) {
      await client.query(`ALTER TYPE "PeriodeType" RENAME VALUE 'SPESIALISERING' TO 'SPESIAL';`);
      console.log("PeriodeType.SPESIALISERING omdøpt til SPESIAL");
    } else {
      console.log("PeriodeType.SPESIAL finnes allerede — omdøping hoppet over");
    }

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
