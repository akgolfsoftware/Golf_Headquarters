/**
 * Team Norway-uttak: kriterium 3 «Prosess og adferd» lagres som tall 1–5
 * (Anders 20.10.2026, beslutninger.md §DESIGNLØFTET … «PROSESS OG ADFERD» 1–5, punkt 2).
 *
 * Rent tillegg: én ny kolonne "prosessAdferd" (INTEGER, kan være tom) i "tn_uttak", med en sjekk
 * som bare slipper inn 1–5. Ingen rader endres. Idempotent.
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer).
 *
 *   npx tsx scripts/add-tn-uttak-prosess-2026-10-20.ts
 */
import "./_env";
import { Client } from "pg";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(`ALTER TABLE "tn_uttak" ADD COLUMN IF NOT EXISTS "prosessAdferd" INTEGER`);
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tn_uttak_prosess_adferd_1_5') THEN
          ALTER TABLE "tn_uttak" ADD CONSTRAINT "tn_uttak_prosess_adferd_1_5" CHECK ("prosessAdferd" IS NULL OR "prosessAdferd" BETWEEN 1 AND 5);
        END IF;
      END $$;`);
    const { rows } = await client.query(
      `SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'tn_uttak' AND column_name = 'prosessAdferd'`,
    );
    console.log("tn_uttak.prosessAdferd:", rows[0] ?? "MANGLER");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
