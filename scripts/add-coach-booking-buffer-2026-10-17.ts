/**
 * Bookingplanen steg 3 (natt 17.10.2026): buffer per coach.
 *
 * - users."bookingBufferMin": minutter coachen vil ha mellom to timer. 0 = ingen.
 *   Brukes sammen med tjenestens buffer før og etter; den største vinner.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Rent tillegg med standardverdi 0:
 * ingen eksisterende rader endres i betydning. Idempotent. Kjørt 17.10.2026.
 *
 *   npx tsx scripts/add-coach-booking-buffer-2026-10-17.ts
 */
import "./_env";
import { Client } from "pg";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "bookingBufferMin" INTEGER NOT NULL DEFAULT 0;`);
    const { rows } = await client.query(
      `SELECT column_name, data_type, column_default FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bookingBufferMin';`,
    );
    console.log(rows.length === 1 ? `Klar: users.bookingBufferMin (${rows[0].data_type}, standard ${rows[0].column_default}).` : "Feltet finnes ikke.");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
