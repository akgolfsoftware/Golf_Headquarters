/**
 * Dagsform på I dag (PH-01, Anders 28.09.2026): tabellen player_daily_forms.
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer).
 *
 * Rent tillegg: ny tabell, ingen eksisterende rader endres. Idempotent.
 *
 *   npx tsx scripts/add-player-daily-form-2026-09-28.ts
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
      CREATE TABLE IF NOT EXISTS "player_daily_forms" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "date" DATE NOT NULL,
        "value" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "player_daily_forms_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "player_daily_forms_value_check" CHECK ("value" BETWEEN 1 AND 5),
        CONSTRAINT "player_daily_forms_userId_fkey" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "player_daily_forms_userId_date_key"
        ON "player_daily_forms"("userId", "date");
    `);
    // Samme lås som resten av public: ingen tilgang via Supabase-klientens anon/authenticated.
    await client.query(`ALTER TABLE "player_daily_forms" ENABLE ROW LEVEL SECURITY;`);
    const { rows } = await client.query(`select count(*)::int as n from "player_daily_forms"`);
    console.log("player_daily_forms finnes. Rader:", rows[0].n);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
