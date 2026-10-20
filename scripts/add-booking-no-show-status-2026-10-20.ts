/**
 * Booking: ny status NO_SHOW (bookingplanen steg 4, Anders 15.10.2026: no-show belastes
 * etter 24-timersregelen, coach kan overstyre).
 *
 * Rent tillegg: én ny verdi i enumen "BookingStatus". Ingen rader endres. Idempotent.
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer).
 *
 *   npx tsx scripts/add-booking-no-show-status-2026-10-20.ts
 */
import "./_env";
import { Client } from "pg";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query(`ALTER TYPE "BookingStatus" ADD VALUE IF NOT EXISTS 'NO_SHOW'`);
    const { rows } = await client.query(
      `SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'BookingStatus' ORDER BY e.enumsortorder`,
    );
    console.log("BookingStatus:", rows.map((r) => r.enumlabel).join(", "));
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
