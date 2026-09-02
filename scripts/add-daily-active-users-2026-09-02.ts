/**
 * MASTERPLAN STEG 16.3 — kirurgisk DDL for daglig aktiv-måling (DailyActiveUser).
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer — prod-historikken er baselinet
 * og alle tre kommandoene feiler på den samme gamle migrasjonen).
 *
 *   npx tsx scripts/add-daily-active-users-2026-09-02.ts
 *   npx tsx scripts/add-daily-active-users-2026-09-02.ts --rollback
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
      await client.query(`DROP TABLE IF EXISTS "daily_active_users";`);
      console.log("daily_active_users droppet");
      return;
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS "daily_active_users" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "dato" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "daily_active_users_userId_dato_key"
        ON "daily_active_users"("userId", "dato");
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS "daily_active_users_dato_idx"
        ON "daily_active_users"("dato");
    `);

    const { rows } = await client.query(
      `select count(*)::int as rader from "daily_active_users"`,
    );
    console.log(`daily_active_users klar — ${rows[0].rader} rader`);
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
