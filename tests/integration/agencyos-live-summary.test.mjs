/** Isolert PostgreSQL i minnet. Bruker eksisterende lokal PGlite, ingen ekstern database. */
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { coachLiveSummaryUpdate } = require("../../src/lib/agencyos/live-summary-update.ts");
const { summaryFieldUpdate } = require("../../src/lib/portal-live/summary-field.ts");
const { PGlite } = await import(require.resolve("@electric-sql/pglite"));
const db = new PGlite();
try {
  await db.exec('CREATE TABLE "training_sessions_v2" ("id" text PRIMARY KEY, "coachId" text, "status" text, "completedSummary" jsonb, "notes" text, "updatedAt" timestamp)');
  await db.query('INSERT INTO "training_sessions_v2" VALUES ($1, $2, $3, $4, $5, NOW())', ["session", "coach", "COMPLETED", JSON.stringify({ liveSummary: { durationSec: 600 }, nested: { keep: true } }), "Tidligere notat"]);
  const run = (change, actor = "coach", admin = false, id = "session") => {
    const query = coachLiveSummaryUpdate(id, actor, admin, change);
    return db.query(query.text, query.values);
  };
  const playerWrite = () => {
    const query = summaryFieldUpdate("session", "dineOrd", { tekst: "Spillerens notat" });
    return db.query(query.text, query.values);
  };
  const read = async () => (await db.query('SELECT "completedSummary" AS summary, "notes" FROM "training_sessions_v2" WHERE "id"=$1', ["session"])).rows[0];
  const message = n => ({ kind: "message", value: { content: `Melding ${n}`, ts: "2026-09-13T00:00:00Z", sentById: "coach" } });
  const rating = { kind: "rating", rating: 4, at: "2026-09-13T00:00:00Z", note: "Coachens notat" };
  const brief = { kind: "brief", value: { melding: "Rytme", sentAt: "2026-09-13T00:00:00Z", sentById: "coach" } };
  await Promise.all([...Array.from({ length: 30 }, (_, i) => run(message(i))), run(rating), run(brief), playerWrite()]);
  const saved = await read();
  assert.equal(saved.summary.coachMessages.length, 30);
  assert.equal(new Set(saved.summary.coachMessages.map(x => x.content)).size, 30);
  assert.equal(saved.summary.coachRating, 4);
  assert.equal(saved.summary.coachRatedById, "coach");
  assert.deepEqual(saved.summary.coachBrief, brief.value);
  assert.deepEqual(saved.summary.dineOrd, { tekst: "Spillerens notat" });
  assert.deepEqual(saved.summary.liveSummary, { durationSec: 600 });
  assert.deepEqual(saved.summary.nested, { keep: true });
  assert.equal(saved.notes, "Coachens notat");
  for (const change of [message(40), brief, rating]) assert.equal((await run(change, "uvedkommende")).affectedRows, 0);
  assert.deepEqual(await read(), saved);
  assert.equal((await run(rating, "admin", true)).affectedRows, 1);
  assert.equal((await read()).summary.coachRatedById, "admin");
  assert.equal((await run(rating, "coach", false, "session' OR true --")).affectedRows, 0);
  assert.equal((await run(rating, "coach' OR true --")).affectedRows, 0);
  const quoted = "Notat med ' og $1 er bare tekst";
  await run({ ...rating, note: quoted });
  assert.equal((await read()).notes, quoted);
  await run({ ...rating, note: "" });
  assert.equal((await read()).notes, quoted);
  const before = await read();
  await db.exec("BEGIN");
  await run(message(50));
  await db.exec("ROLLBACK");
  assert.deepEqual(await read(), before);
  for (const raw of [null, "null", "[]", '"eldre-verdi"', '{"coachMessages":null}', '{"coachMessages":{}}']) {
    await db.query('UPDATE "training_sessions_v2" SET "completedSummary"=$1 WHERE "id"=$2', [raw, "session"]);
    await Promise.all([run(message(1)), run(message(2)), run(brief)]);
    const current = await read();
    assert.equal(current.summary.coachMessages.length, 2);
    assert.deepEqual(current.summary.coachBrief, brief.value);
  }
  console.log("Bestått: 30 meldinger, brief, vurdering og spillerfelt, JSON-bevaring, coach/admin-grense, sitater, tomt notat, rollback og seks eldre JSON-tilstander. PGlite serialiserer spørringene; dette er SQL-bevis, ikke flerforbindelses- eller innlogget nettleserprøve.");
} finally { await db.close(); }
