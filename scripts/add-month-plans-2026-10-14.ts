/**
 * Plannivåene henger sammen, punkt 2 (Anders 14.10.2026): månedsplan.
 *
 * Rent tillegg, ingen eksisterende rader endres: ny tabell `month_plans`
 * (en rad per spiller, år og måned). `weekAxisMinutes` er JSONB med nøkkel
 * «ÅÅÅÅ-Uxx» → minutter per akse; en uke som står her er «Endret i måneden».
 *
 * Kjør mot DIRECT_URL, aldri migrate dev/db push/migrate deploy
 * (`.claude/rules/gotchas.md` §Schema-endringer). Målet må oppgis eksplisitt
 * som host:port/database, ellers stopper skriptet. Idempotent.
 *
 *   MONTH_PLAN_EXPECT_TARGET=<host>:<port>/<database> npx tsx scripts/add-month-plans-2026-10-14.ts
 *
 * Produksjon: kjøres først når Anders har sagt ja.
 */
import "./_env";
import { Client } from "pg";

export const MONTH_PLANS_SQL = [
  `CREATE TABLE IF NOT EXISTS "month_plans" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seasonPlanId" TEXT,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "focus" TEXT,
    "notes" TEXT,
    "evaluation" TEXT,
    "weekAxisMinutes" JSONB,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "month_plans_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "month_plans_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "month_plans_seasonPlanId_fkey" FOREIGN KEY ("seasonPlanId") REFERENCES "season_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "month_plans_userId_year_month_key" ON "month_plans"("userId", "year", "month")`,
  `CREATE INDEX IF NOT EXISTS "month_plans_userId_idx" ON "month_plans"("userId")`,
];

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler");
  const parsed = new URL(url);
  const target = `${parsed.hostname}:${parsed.port}${parsed.pathname}`;
  const expected = process.env.MONTH_PLAN_EXPECT_TARGET;
  if (!expected || expected !== target) {
    throw new Error("DIRECT_URL samsvarer ikke med MONTH_PLAN_EXPECT_TARGET.");
  }

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    await client.query("BEGIN");
    for (const sql of MONTH_PLANS_SQL) await client.query(sql);
    await client.query("COMMIT");
    const { rows } = await client.query(
      `select count(*)::int as n from information_schema.columns where table_name = 'month_plans'`,
    );
    console.log(`month_plans har ${rows[0].n} kolonner`);
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    await client.end();
  }
}

if (process.argv[1]?.endsWith("add-month-plans-2026-10-14.ts")) {
  main().catch((e) => {
    console.error(e instanceof Error ? e.message : "Ukjent feil");
    process.exit(1);
  });
}
