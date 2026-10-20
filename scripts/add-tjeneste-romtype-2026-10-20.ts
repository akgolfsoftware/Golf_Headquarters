/**
 * Booking steg 2: tjenesten kan kreve en romtype (service_types."facilityType").
 *
 * Null = tjenesten trenger ikke noe bestemt rom (som før). Rent tillegg, ingen rader endres.
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Idempotent.
 *
 *   npx tsx scripts/add-tjeneste-romtype-2026-10-20.ts
 */
import "./_env";
import { Client } from "pg";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query(`ALTER TABLE "service_types" ADD COLUMN IF NOT EXISTS "facilityType" "FacilityType";`);
    const { rows } = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'service_types' AND column_name = 'facilityType';
    `);
    console.log(`Klar: ${rows.length} av 1 felt finnes.`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
