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

  // Legg til area, category, repetitionType på session_ball_logs
  await client.query(`
    ALTER TABLE "session_ball_logs"
    ADD COLUMN IF NOT EXISTS "area" TEXT,
    ADD COLUMN IF NOT EXISTS "category" TEXT,
    ADD COLUMN IF NOT EXISTS "repetitionType" TEXT;
  `);
  console.log("Kolonner lagt til på session_ball_logs (hvis ikke fantes fra før)");

  // Verifiser kolonnene
  const res = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'session_ball_logs'
    ORDER BY ordinal_position;
  `);
  console.log("Verifiserte kolonner på session_ball_logs:", res.rows);

  await client.end();
}

main().catch((err) => {
  console.error("Feil ved migrering:", err);
  process.exit(1);
});
