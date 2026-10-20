/**
 * Gavekort (bookingplanen steg 7, Anders 15.10.2026): tabellene gift_cards og
 * gift_card_transactions, kolonnen bookings."giftCardOre" og verdien GAVEKORT i
 * "BookingPaymentMethod". Alt er rent additivt, ingen eksisterende rader endres.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Idempotent.
 *
 *   npx tsx scripts/add-gavekort-2026-10-20.ts
 *   npx tsx scripts/add-gavekort-2026-10-20.ts --rollback   (fjerner bare tabellene og kolonnen)
 */
import "./_env";
import { Client } from "pg";

const TABELLER = ["gift_cards", "gift_card_transactions"];

const OPP = [
  `ALTER TYPE "BookingPaymentMethod" ADD VALUE IF NOT EXISTS 'GAVEKORT';`,
  `ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "giftCardOre" INTEGER NOT NULL DEFAULT 0;`,
  `CREATE TABLE IF NOT EXISTS "gift_cards" (
    "id" TEXT PRIMARY KEY,
    "codeHash" TEXT NOT NULL,
    "codeEnd" TEXT NOT NULL,
    "initialOre" INTEGER NOT NULL CHECK ("initialOre" > 0),
    "balanceOre" INTEGER NOT NULL CHECK ("balanceOre" >= 0),
    "purchaserUserId" TEXT,
    "purchaserEmail" TEXT NOT NULL,
    "purchaserName" TEXT,
    "recipientEmail" TEXT,
    "message" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "stripeCheckoutSessionId" TEXT NOT NULL,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "gift_cards_codeHash_key" ON "gift_cards" ("codeHash");`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "gift_cards_stripeCheckoutSessionId_key" ON "gift_cards" ("stripeCheckoutSessionId");`,
  `CREATE TABLE IF NOT EXISTS "gift_card_transactions" (
    "id" TEXT PRIMARY KEY,
    "giftCardId" TEXT NOT NULL REFERENCES "gift_cards"("id") ON DELETE CASCADE,
    "bookingId" TEXT,
    "kind" TEXT NOT NULL,
    "amountOre" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "gift_card_transactions_giftCardId_bookingId_kind_key" ON "gift_card_transactions" ("giftCardId", "bookingId", "kind");`,
  `CREATE INDEX IF NOT EXISTS "gift_card_transactions_bookingId_idx" ON "gift_card_transactions" ("bookingId");`,
  // Samme lås som resten av public: ingen tilgang via Supabase-klientens anon/authenticated.
  ...TABELLER.map((t) => `ALTER TABLE "${t}" ENABLE ROW LEVEL SECURITY;`),
];

const NED = [
  `DROP TABLE IF EXISTS "gift_card_transactions";`,
  `DROP TABLE IF EXISTS "gift_cards";`,
  `ALTER TABLE "bookings" DROP COLUMN IF EXISTS "giftCardOre";`,
];

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    for (const sql of process.argv.includes("--rollback") ? NED : OPP) await client.query(sql);
    const { rows } = await client.query(
      `SELECT c.relname AS tabell, c.relrowsecurity AS rls, count(a.attname)::int AS kolonner
         FROM pg_class c JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum > 0 AND NOT a.attisdropped
        WHERE c.relname = ANY($1) GROUP BY c.relname, c.relrowsecurity ORDER BY c.relname;`,
      [TABELLER],
    );
    console.log(rows);
    const e = await client.query(
      `SELECT e.enumlabel FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid WHERE t.typname = 'BookingPaymentMethod' ORDER BY e.enumsortorder`,
    );
    console.log("BookingPaymentMethod:", e.rows.map((r) => r.enumlabel).join(", "));
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
