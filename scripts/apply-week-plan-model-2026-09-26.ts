/**
 * DDL execution for WeekPlan model and enums (WeekType, WeekNote).
 * Runs against DIRECT_URL. Idempotent.
 */
import "./_env";
import { Client } from "pg";
import { readFileSync } from "fs";
import { join } from "path";

async function main() {
  const url = process.env.DIRECT_URL;
  if (!url) throw new Error("DIRECT_URL mangler i miljøvariabler.");

  const client = new Client({ connectionString: url });
  await client.connect();

  try {
    const sql = readFileSync(
      join(__dirname, "../prisma/migrations/20260926170000_week_plan_model/migration.sql"),
      "utf-8"
    );
    await client.query(sql);

    const { rows } = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'week_plans'
      ORDER BY ordinal_position;
    `);
    console.log(`OK — week_plans tabell opprettet med ${rows.length} kolonner:`, rows.map((r) => r.column_name));
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Feil ved kjøring av DDL:", err);
  process.exit(1);
});
