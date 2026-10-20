/**
 * Slår på RLS (uten policies = ingen tilgang for anon/authenticated) på åtte
 * tabeller som mangler det, funnet i sikkerhetssjekken 20.10.2026
 * (docs/sikkerhet/sjekk-2026-10-20.md, B6).
 *
 * Samme mønster som de 176 øvrige tabellene uten policies: appen går via
 * Prisma som eier (omgår RLS), mens Supabase-API-et (anon/authenticated)
 * stenges ute. Additivt og idempotent. IKKE kjørt — krever Anders' ja.
 *
 *   npx tsx scripts/enable-rls-8-tabeller-2026-10-20.ts
 *
 * Rollback: npx tsx scripts/enable-rls-8-tabeller-2026-10-20.ts --rollback
 */
import { Client } from "pg";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const TABELLER = [
  "ai_memories",
  "jarvis_innstillinger",
  "knowledge_chunks",
  "month_plans",
  "test_day_events",
  "test_session_photos",
  "test_shots",
  "workbench_drill_logs",
] as const;

async function main() {
  const direct = process.env.DIRECT_URL;
  if (!direct) {
    console.error("DIRECT_URL mangler i .env.local");
    process.exit(1);
  }
  const rollback = process.argv.includes("--rollback");
  const verb = rollback ? "DISABLE" : "ENABLE";
  const client = new Client({ connectionString: direct });
  await client.connect();
  try {
    for (const t of TABELLER) {
      await client.query(`ALTER TABLE "public"."${t}" ${verb} ROW LEVEL SECURITY`);
      console.log(`${verb} RLS: ${t}`);
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
