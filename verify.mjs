import { config } from "dotenv";
config({ path: ".env.local" });
import pg from "pg";
for (const k of ["DATABASE_URL", "DIRECT_URL"]) {
  const v = process.env[k];
  const u = new URL(v);
  const c = new pg.Client({ connectionString: v, connectionTimeoutMillis: 10000 });
  try {
    await c.connect();
    const r = await c.query("select count(*)::int as n from \"User\"");
    console.log(`${k}: OK — ${u.hostname}:${u.port}${u.search || " (ingen parametre)"} — ${r.rows[0].n} brukere i basen`);
    await c.end();
  } catch (e) { console.log(`${k}: FEIL — ${e.message}`); }
}
