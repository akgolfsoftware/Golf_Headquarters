/**
 * Kirurgisk DDL — duo (bookingplanen steg 6): navn og e-post på deltaker 2
 * på `bookings`. Begge er valgfrie og null på alle eksisterende bookinger.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer).
 *
 * Idempotent. Kolonnenavn matcher Prisma (camelCase).
 *
 *   npx tsx scripts/add-booking-duo-deltaker-2026-10-18.ts
 *   npx tsx scripts/add-booking-duo-deltaker-2026-10-18.ts --rollback
 */
import "./_env";
import { Client } from "pg";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const rollback = process.argv.includes("--rollback");

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    if (rollback) {
      await client.query(`
        ALTER TABLE "bookings"
          DROP COLUMN IF EXISTS "partnerName",
          DROP COLUMN IF EXISTS "partnerEmail";
      `);
      console.log("partnerName og partnerEmail droppet fra bookings");
      return;
    }

    await client.query(`
      ALTER TABLE "bookings"
        ADD COLUMN IF NOT EXISTS "partnerName" TEXT,
        ADD COLUMN IF NOT EXISTS "partnerEmail" TEXT;
    `);

    const { rows } = await client.query(`
      select count(*)::int as n from information_schema.columns
      where table_name = 'bookings' and column_name in ('partnerName', 'partnerEmail')
    `);
    console.log(`Duo-feltene klare: ${rows[0].n} av 2 kolonner finnes på bookings`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
