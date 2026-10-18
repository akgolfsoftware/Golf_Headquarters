import assert from "node:assert/strict";
import { before, mock, test } from "node:test";

let fail = false;
let rows: Array<{ id: string; recordedAt: Date; shots: Array<Record<string, unknown>> }> = [];
let requestedUser = "";
mock.module("@/lib/prisma", { namedExports: { prisma: { trackManSession: { findMany: async (args: { where: { userId: string } }) => {
  requestedUser = args.where.userId;
  if (fail) throw new Error("Synthetic unavailable source");
  return rows;
} } } } });
let load: typeof import("./load-ph17-trackman").loadPH17TrackMan;
before(async () => { load = (await import("./load-ph17-trackman")).loadPH17TrackMan; });
const shot = (carry: number) => ({ club: "7i", carryDistance: carry, side: 0, clubSpeed: null, ballSpeed: null, smashFactor: null, launchAngle: null, clubPath: 0, faceToPath: null, spinRate: null });
test("tomt innlogget spillergrunnlag gir ingen syntetiske slag, fitting eller referanser", async () => {
  fail = false; rows = [];
  const result = await load("synthetic-player", "Syntetisk spiller");
  assert.equal(requestedUser, "synthetic-player"); assert.equal(result.state, "tom");
  assert.deepEqual(result.sessions, []); assert.deepEqual(result.clubStats, {}); assert.deepEqual(result.gear, []); assert.deepEqual(result.station.rows, []);
});
test("feil ved kilden vises som feil, uten å bytte inn eksempeldata", async () => {
  fail = true; const result = await load("synthetic-player");
  assert.equal(result.state, "feil"); assert.deepEqual(result.sessions, []); fail = false;
});
test("valgt økt og datovindu bruker egne målinger og Oslo-dato", async () => {
  rows = [
    { id: "session-a", recordedAt: new Date("2026-10-01T23:30:00Z"), shots: [shot(140)] },
    { id: "session-b", recordedAt: new Date("2026-09-01T12:00:00Z"), shots: [shot(180)] },
  ];
  const result = await load("synthetic-player");
  assert.equal(result.sessions[0].date, "02.10.2026"); assert.equal(result.sessions[0].bay, "");
  assert.equal(result.sessionData?.["session-a"].clubStats["7i"].carry, 140);
  assert.equal(result.sessionData?.["session-b"].clubStats["7i"].carry, 180);
  assert.equal(result.clubStats["7i"].carry, 160); assert.equal(result.clubStats["7i"].clubSpeed, null);
});
