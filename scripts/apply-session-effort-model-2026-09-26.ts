import "./_env";
import { Client } from "pg";

async function main() {
  const directUrl = process.env.DIRECT_URL;
  if (!directUrl) {
    throw new Error("DIRECT_URL mangler i miljøvariablene");
  }

  const client = new Client({ connectionString: directUrl });
  await client.connect();
  console.log("Koblet til PostgreSQL via DIRECT_URL");

  // Legg til perceivedEffort og actualMinutes på workbench_sessions
  await client.query(`
    ALTER TABLE "workbench_sessions"
    ADD COLUMN IF NOT EXISTS "perceivedEffort" INTEGER,
    ADD COLUMN IF NOT EXISTS "actualMinutes" INTEGER;
  `);
  console.log("Kolonner lagt til på workbench_sessions (hvis ikke fantes fra før)");

  // Verifiser kolonnene
  const res = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'workbench_sessions'
      AND column_name IN ('perceivedEffort', 'actualMinutes')
    ORDER BY column_name;
  `);
  console.log("Verifiserte kolonner:", res.rows);

  await client.end();
}

main().catch((err) => {
  console.error("Feil ved migrering:", err);
  process.exit(1);
});
