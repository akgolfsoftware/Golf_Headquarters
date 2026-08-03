/**
 * Schema-runde FØR/UNDER/ETTER + Spillere (2026-07-31) — Anders sa ja til SQL.
 *
 * Kjører `prisma/sql/2026-07-31-schema-runde-sloyfe.sql` kirurgisk mot DIRECT_URL.
 * Idempotent. Ikke `migrate dev` / `db push` (blokkert — se gotchas).
 *
 *   npx tsx scripts/run-schema-runde-sloyfe-2026-07-31.ts
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.local" });

const direct = process.env.DIRECT_URL;
if (!direct) {
  console.error("DIRECT_URL mangler i .env.local — avbryter.");
  process.exit(1);
}

// Aldri logg connection string.
const adapter = new PrismaPg({ connectionString: direct });
const prisma = new PrismaClient({ adapter });

const SQL_PATH = resolve("prisma/sql/2026-07-31-schema-runde-sloyfe.sql");

/** Split på semikolon utenom kommentarlinjer — enkle statements i denne fila. */
function statementsFromFile(path: string): string[] {
  const raw = readFileSync(path, "utf8");
  const withoutLineComments = raw
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");
  return withoutLineComments
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function verify(): Promise<void> {
  const rows = await prisma.$queryRawUnsafe<
    Array<{ relname: string; relrowsecurity: boolean }>
  >(`
    SELECT c.relname, c.relrowsecurity
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN ('lyd_samtykker', 'trad_apninger')
      AND c.relkind = 'r'
    ORDER BY c.relname;
  `);

  const cols = await prisma.$queryRawUnsafe<Array<{ column_name: string }>>(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'plan_actions'
      AND column_name IN ('sjekkpunkt', 'fangstId')
    ORDER BY column_name;
  `);

  const groupKind = await prisma.$queryRawUnsafe<Array<{ column_name: string }>>(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'groups'
      AND column_name = 'kind';
  `);

  console.log("Verifisering:");
  console.log("  tabeller:", rows.map((r) => `${r.relname}(rls=${r.relrowsecurity})`).join(", ") || "(mangler!)");
  console.log(
    "  plan_actions kolonner:",
    cols.map((c) => c.column_name).join(", ") || "(mangler!)",
  );
  console.log("  groups.kind:", groupKind.length ? "OK" : "MANGLER");

  if (rows.length !== 2) throw new Error("Forventet 2 nye tabeller");
  if (!rows.every((r) => r.relrowsecurity)) {
    throw new Error("RLS må være på for lyd_samtykker og trad_apninger");
  }
  if (cols.length !== 2) throw new Error("Forventet sjekkpunkt + fangstId på plan_actions");
  if (groupKind.length !== 1) throw new Error("Forventet groups.kind");
}

async function main() {
  const stmts = statementsFromFile(SQL_PATH);
  console.log(`Kjører ${stmts.length} statements fra schema-runde SQL…`);

  for (const sql of stmts) {
    const label = sql.slice(0, 60).replace(/\s+/g, " ");
    await prisma.$executeRawUnsafe(sql);
    console.log("  OK:", label);
  }

  // Gotcha: nye tabeller i public MÅ ha RLS (deny-by-default for PostgREST).
  // Prisma (eier) bypasser RLS. Ingen policies = kun server-tilgang.
  await prisma.$executeRawUnsafe(
    `ALTER TABLE lyd_samtykker ENABLE ROW LEVEL SECURITY;`,
  );
  await prisma.$executeRawUnsafe(
    `ALTER TABLE trad_apninger ENABLE ROW LEVEL SECURITY;`,
  );
  console.log("  OK: RLS på lyd_samtykker + trad_apninger");

  await verify();
  console.log("Schema-runde: FERDIG.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
