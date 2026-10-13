/** Denne riggen kan bare nå den tomme, særskilte oppgraderingsstacken. */
import { readFileSync } from "node:fs";
import { spawn } from "node:child_process";
import pg from "pg";
const status = JSON.parse(readFileSync("tmp/upgrade/local/status.json", "utf8"));
const api = new URL(status.API_URL);
const db = new URL(status.DB_URL);
if (api.origin !== "http://127.0.0.1:55321" || db.hostname !== "127.0.0.1" || db.port !== "55322" || db.pathname !== "/postgres") throw new Error("Bare isolert oppgraderingsmiljø tillatt.");
const command = process.argv[2];
if (command === "schema") {
  const pool = new pg.Pool({ connectionString: status.DB_URL });
  try {
    const client = await pool.connect();
    try {
      const check = await client.query("select count(*)::int as count from information_schema.tables where table_schema='public' and table_name='users'");
      if (check.rows[0].count) throw new Error("Testskjema finnes allerede. Ingen gjenoppbygging er utført.");
      await client.query("begin");
      await client.query("create extension if not exists vector with schema public");
      await client.query(readFileSync("tmp/upgrade/local/schema.sql", "utf8"));
      await client.query(readFileSync("prisma/migrations/20261012_monthly_plans/migration.sql", "utf8"));
      await client.query("comment on schema public is 'AK_HQ_UPGRADE_LOCAL_SYNTHETIC_20261012'");
      await client.query("commit");
      console.log("Isolert appskjema og månedsplanregler opprettet. Ingen ekte data.");
    } catch (error) { await client.query("rollback"); throw error; }
    finally { client.release(); }
  } finally { await pool.end(); }
} else if (command === "dev" || command === "verify" || command === "build") {
  // Lokale funksjonsprøver skal aldri arve ekte AI-, betalings- eller utsendingsnøkler.
  const localEnv = Object.fromEntries(Object.entries(process.env).filter(([name]) =>
    !/(?:KEY|TOKEN|SECRET|PASSWORD|DATABASE_URL|DIRECT_URL|SUPABASE|STRIPE|RESEND|SENDGRID|DATAGOLF|UPSTASH|OPENAI|ANTHROPIC|AI_GATEWAY|SMTP|MAILGUN)/.test(name)));
  const child = spawn("npm", command === "dev" ? ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", "3300"] : ["run", command], {
    stdio: "inherit", env: { ...localEnv, DATABASE_URL: status.DB_URL, DIRECT_URL: status.DB_URL,
      NEXT_PUBLIC_SUPABASE_URL: status.API_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: status.ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY, NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3300",
      VEDLIKEHOLD: "0", NEXT_TELEMETRY_DISABLED: "1" },
  });
  child.on("exit", (code) => { process.exitCode = code ?? 1; });
} else {
  console.log("Bruk schema, dev, verify eller build. Nøkler skrives ikke ut.");
}
