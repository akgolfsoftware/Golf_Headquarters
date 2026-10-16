// Kjør kun mot den separate, syntetiske IUP-databasen. Leser aldri .env.local.
import fs from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "dotenv";
import pg from "pg";

const rot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const lokal = parse(fs.readFileSync(path.join(rot, ".codex/environments/iup/.env.runtime")));
const url = new URL(lokal.DATABASE_URL);
if (url.protocol !== "postgresql:" || url.hostname !== "127.0.0.1" || url.port !== "55622"
  || url.pathname !== "/ak_hq_iup_test_20261002" || url.username !== "iup_test_20261002" || url.search || url.hash) {
  throw new Error("IUP-testen avviser annet målmiljø.");
}
const ports = JSON.parse(execFileSync("docker", ["inspect", "--format", "{{json .NetworkSettings.Ports}}", "supabase_db_ak-hq-brukere-20261001"], { encoding: "utf8" }));
if (!ports["5432/tcp"]?.length || !ports["5432/tcp"].every((p) => p.HostIp === "127.0.0.1" && p.HostPort === "55622")) {
  throw new Error("IUP-testen krever kontrollert lokal portbinding.");
}
const db = new pg.Client({ connectionString: lokal.DATABASE_URL });
try {
  await db.connect();
  const identitet = await db.query("SELECT current_database() AS db, current_user AS rolle, name FROM public._iup_test_identity");
  if (identitet.rowCount !== 1 || identitet.rows[0].db !== "ak_hq_iup_test_20261002"
    || identitet.rows[0].rolle !== "iup_test_20261002" || identitet.rows[0].name !== "ak-hq-iup-test-20261002") {
    throw new Error("Feil databaseidentitet.");
  }
} catch {
  throw new Error("Kunne ikke bekrefte separat lokal IUP-testdatabase.");
} finally { await db.end(); }

const r = spawnSync(process.execPath, ["--import", "tsx", "--conditions=react-server", "--experimental-test-module-mocks", "--test", "tests/iup-local/lagring.test.ts"], {
  cwd: rot, encoding: "utf8", timeout: 120_000, maxBuffer: 5 * 1024 * 1024,
  env: { PATH: process.env.PATH, HOME: process.env.HOME, NODE_OPTIONS: "--max-old-space-size=4096", DATABASE_URL: lokal.DATABASE_URL },
});
const rens = (s) => (s ?? "").replaceAll(lokal.DATABASE_URL, "[lokal database]").replaceAll(url.password, "[skjult]");
process.stdout.write(rens(r.stdout)); process.stderr.write(rens(r.stderr));
if (r.error) process.stderr.write("Lokal IUP-prøve kunne ikke fullføres.\n");
process.exitCode = r.status ?? 1;
