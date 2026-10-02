/** Real PostgreSQL persistence; authentication and post-save cache/talent hooks are isolated. */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { before, after, mock, test } from "node:test";
import pg from "pg";
import { tnComparableResult } from "../../src/lib/portal-tester/tn-integration";
import { TN_CATALOG, tnVersion } from "../../src/lib/portal-tester/tn-catalog";
import { tnScore, tnSameScore, type TnValues } from "../../src/lib/portal-tester/tn-scoring";

const target = new URL(process.env.DATABASE_URL ?? "");
assert.equal(target.hostname, "127.0.0.1");
assert.equal(target.port, "56022");
assert.equal(target.pathname, "/testbatteri_20261002");
const db = new pg.Client({ connectionString: target.href });
const owner = `testbatteri-${randomUUID()}`;
const other = `testbatteri-${randomUUID()}`;
let viewer = owner;
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => ({ id: viewer, role: "PLAYER" }) } });
mock.module("@/lib/talent/test-sync", { namedExports: { syncTalentEtterTest: async () => {} } });
mock.module("next/cache", { namedExports: { revalidatePath: () => {} } });
let save: typeof import("../../src/app/portal/tren/tester/team-norway/actions").saveTnTest;
let prisma: typeof import("../../src/lib/prisma").prisma;

before(async () => {
  await db.connect();
  const identity = await db.query("SELECT current_database() AS db, name FROM public._testbatteri_identity");
  assert.deepEqual(identity.rows, [{ db: "testbatteri_20261002", name: "ak-hq-testbatteri-20261002" }]);
  ({ prisma } = await import("../../src/lib/prisma"));
  ({ saveTnTest: save } = await import("../../src/app/portal/tren/tester/team-norway/actions"));
  await prisma.user.createMany({ data: [owner, other].map(id => ({ id, authId: randomUUID(), name: "Syntetisk testspiller", email: `${id}@example.invalid` })) });
});
after(async () => { await prisma?.$disconnect(); await db.end(); });

const register = JSON.parse(readFileSync(new URL("../../docs/planer/testbatteri-protokollregister-2026-10-02.json", import.meta.url), "utf8")) as {
  acceptanceCases: { protocolId: string; inputs: Record<string, string | number>[] }[];
};
for (const p of TN_CATALOG.filter(p => !p.blocked)) {
  test(`database: ${p.id} utkast, gjenlesing, fullføring og gjentatt innsending`, async () => {
    viewer = owner;
    const source = register.acceptanceCases.find(c => c.protocolId === p.id)!.inputs;
    const values: TnValues = {};
    p.rows.forEach((row, i) => {
      values[String(i + 1)] = Object.fromEntries(row.fields.filter(f => !f.optional).map(f => {
        const raw = source[i][f.key]
          ?? (f.key === "ok" ? source[i].hit ?? source[i].gateClear : undefined)
          ?? (f.key === "speedZone" ? source[i].withinSpeedZone : undefined)
          ?? (f.key === "distanceUnit" ? source[i].unit : undefined)
          ?? (f.key === "hole" ? i + 1 : f.choices?.[0]);
        assert.notEqual(raw, undefined);
        return [f.key, raw];
      }));
      if (p.id === "putt-gate" && values[String(i + 1)].ok === "Nei") values[String(i + 1)].miss = "Venstre";
    });
    const sessionId = randomUUID();
    const command = { sessionId, version: tnVersion(p), protocolId: p.id, count: p.rows.length, revision: 0, values, intent: "draft" };
    assert.deepEqual(await save(command), { ok: true, revision: 1 });
    const draft = await db.query('SELECT "scoringData" FROM test_sessions WHERE id=$1', [sessionId]);
    assert.deepEqual(draft.rows[0].scoringData.values, values);
    assert.equal(draft.rows[0].scoringData.version, tnVersion(p));
    viewer = other;
    assert.equal((await save({ ...command, revision: 1 })).ok, false);
    viewer = owner;
    const complete = { ...command, revision: 1, intent: "complete" };
    const first = await save(complete);
    assert.ok(first.ok);
    assert.deepEqual(await save(complete), first);
    const stored = await db.query('SELECT r.score, r.details, r."testId", s.status FROM test_sessions s JOIN test_results r ON s."testResultId"=r.id WHERE s.id=$1', [sessionId]);
    assert.equal(stored.rowCount, 1);
    assert.equal(stored.rows[0].status, "COMPLETED");
    assert.ok(tnSameScore(stored.rows[0].score, tnScore(p, values).score));
    assert.ok(tnComparableResult(stored.rows[0].testId, stored.rows[0].score, stored.rows[0].details));
    assert.deepEqual(stored.rows[0].details.values, values);
  });
}

test("database: samtidige rettelser avviser tabende revisjon uten overskriving", async () => {
  viewer = owner;
  const p = TN_CATALOG.find(p => p.id === "naerspill-gate")!;
  const data = { sessionId: randomUUID(), version: tnVersion(p), protocolId: p.id, count: 9, revision: 0, values: { "1": { points: 1 } }, intent: "draft" };
  assert.ok((await save(data)).ok);
  const answers = await Promise.all([2, 3].map(points => save({ ...data, revision: 1, values: { "1": { points } } })));
  assert.equal(answers.filter(a => a.ok).length, 1);
  assert.equal(answers.filter(a => !a.ok).length, 1);
  const stored = await db.query('SELECT "scoringData" FROM test_sessions WHERE id=$1', [data.sessionId]);
  assert.equal(stored.rows[0].scoringData.revision, 2);
  assert.ok([2, 3].includes(stored.rows[0].scoringData.values["1"].points));
});
