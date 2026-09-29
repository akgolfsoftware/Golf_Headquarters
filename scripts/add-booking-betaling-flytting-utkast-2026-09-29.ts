/**
 * Booking: betalingsmåte, flytteforslag og utkast ved avvisning (Anders 29.09.2026).
 *
 * - bookings."paymentMethod": STRIPE | KLIPP | FAKTURA | GRATIS. Null = eldre booking
 *   (betalingen leses som før fra Stripe-feltene og subscriptionId).
 * - bookings."proposedStartAt"/"proposedEndAt"/"proposedAt"/"proposedById": coach
 *   foreslår ny tid på en betalt time; spilleren må godta før tiden endres.
 * - innboks_epost."bookingId": utkastet med begrunnelse når coach avviser en booking.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Rent tillegg: ingen eksisterende
 * rader endres. Idempotent.
 *
 *   npx tsx scripts/add-booking-betaling-flytting-utkast-2026-09-29.ts
 */
import "./_env";
import { Client } from "pg";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE "BookingPaymentMethod" AS ENUM ('STRIPE', 'KLIPP', 'FAKTURA', 'GRATIS');
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await client.query(`
      ALTER TABLE "bookings"
        ADD COLUMN IF NOT EXISTS "paymentMethod" "BookingPaymentMethod",
        ADD COLUMN IF NOT EXISTS "proposedStartAt" TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "proposedEndAt" TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "proposedAt" TIMESTAMP(3),
        ADD COLUMN IF NOT EXISTS "proposedById" TEXT;
    `);
    await client.query(`ALTER TABLE "innboks_epost" ADD COLUMN IF NOT EXISTS "bookingId" TEXT;`);
    await client.query(`
      DO $$ BEGIN
        ALTER TABLE "innboks_epost" ADD CONSTRAINT "innboks_epost_bookingId_fkey"
          FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
      EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    `);
    await client.query(`CREATE INDEX IF NOT EXISTS "innboks_epost_bookingId_idx" ON "innboks_epost"("bookingId");`);

    const { rows } = await client.query(`
      SELECT table_name, column_name FROM information_schema.columns
      WHERE (table_name = 'bookings' AND column_name IN ('paymentMethod', 'proposedStartAt', 'proposedEndAt', 'proposedAt', 'proposedById'))
         OR (table_name = 'innboks_epost' AND column_name = 'bookingId')
      ORDER BY table_name, column_name;
    `);
    console.log(`Klar: ${rows.length} av 6 felt finnes.`, rows.map((r) => `${r.table_name}.${r.column_name}`).join(", "));
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
