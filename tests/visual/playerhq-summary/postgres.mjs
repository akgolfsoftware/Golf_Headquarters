/** Isolert PostgreSQL-prøve i minnet. Krever lokalt tilgjengelig @electric-sql/pglite. */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { summaryFieldUpdate } = require("../../../src/lib/portal-live/summary-field.ts");
const { PGlite } = await import(require.resolve("@electric-sql/pglite"));
const db = new PGlite();
try {
  await db.exec('CREATE TABLE "training_sessions_v2" ("id" text PRIMARY KEY, "status" text, "completedSummary" jsonb, "updatedAt" timestamp)');
  await db.query('INSERT INTO "training_sessions_v2" VALUES ($1, $2, $3, NOW()), ($4, $5, $6, NOW())', ["session", "COMPLETED", JSON.stringify({ liveSummary: { completedDrillIds: ["d1"] }, coachBrief: { melding: "Bevares" } }), "other", "IN_PROGRESS", "{}"]);
  const run = (id, field, value, merge = false) => { const sql = summaryFieldUpdate(id, field, value, merge); return db.query(sql.text, sql.values); };
  await Promise.all([run("session", "dineOrd", { tekst: "Mine ord" }), run("session", "spillerVurdering", { kvalitet: 4 })]);
  const read = async () => (await db.query('SELECT "completedSummary" AS summary FROM "training_sessions_v2" WHERE id=$1', ["session"])).rows[0].summary;
  const expected = { liveSummary: { completedDrillIds: ["d1"] }, coachBrief: { melding: "Bevares" }, dineOrd: { tekst: "Mine ord" }, spillerVurdering: { kvalitet: 4 } };
  assert.deepEqual(await read(), expected);
  await db.exec("BEGIN");
  await run("session", "spillerVurdering", { kvalitet: 2 });
  await db.exec("ROLLBACK");
  assert.deepEqual(await read(), expected);
  assert.equal((await run("other", "dineOrd", { tekst: "Skal avvises" })).affectedRows, 0);
  assert.equal((await run("session' OR true --", "dineOrd", { tekst: "Skal avvises" })).affectedRows, 0);
  const quoted = "Tekst med ' sitat og $1 er data";
  await run("session", "dineOrd", { tekst: quoted });
  assert.equal((await read()).dineOrd.tekst, quoted);
  await Promise.all([run("session", "spillerVurdering", { rpe: 7 }, true), run("session", "spillerVurdering", { fokus: 8 }, true)]);
  assert.deepEqual((await read()).spillerVurdering, { kvalitet: 4, rpe: 7, fokus: 8 });
  await run("session", "spillerVurdering", { fokus: null }, true);
  assert.deepEqual((await read()).spillerVurdering, { kvalitet: 4, rpe: 7, fokus: null });
  for (const old of [null, [], "eldre"] ) {
    await db.query('UPDATE "training_sessions_v2" SET "completedSummary"=$1 WHERE id=$2', [JSON.stringify({ spillerVurdering: old, dineOrd: {tekst:"Bevares"} }), "session"]);
    await run("session", "spillerVurdering", {rpe:6}, true);
    assert.deepEqual(await read(), {spillerVurdering:{rpe:6},dineOrd:{tekst:"Bevares"}});
  }
  for (const value of [null, "null", "[]", '"eldre-verdi"']) {
    await db.query('UPDATE "training_sessions_v2" SET "completedSummary"=$1 WHERE id=$2', [value, "session"]);
    await run("session", "dineOrd", { tekst: "Nytt notat" });
    assert.deepEqual(await read(), { dineOrd: { tekst: "Nytt notat" } });
  }
  console.log("PostgreSQL: separate felt bevart, rollback, status/ID-avgrensning, sitater og fire eldre JSON-tilstander bestod. Isolert PGlite; ikke produksjonsdatabase eller full appreise.");
} finally { await db.close(); }
