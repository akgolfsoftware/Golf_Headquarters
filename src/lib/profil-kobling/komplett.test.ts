import { before, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { tnProtocol } from "@/lib/portal-tester/tn-catalog";
import { tnScore } from "@/lib/portal-tester/tn-scoring";

// Kun fiktive personer.
let profilKall: { golf?: boolean }[] = [];
let maaltallKall: { kunDelte?: boolean }[] = [];
let harIup = true;
let rundeFilter: unknown = null;
let treningFilter: unknown = null;

mock.module("@/lib/profil-kobling/data", { namedExports: {
  hentSpillerprofil: async (_id: string, o: { inkluderGolfId?: boolean }) => { profilKall.push({ golf: o.inkluderGolfId }); return { person: { name: "Pia Egenes", birth_year: 2009 }, sesonger: [], monster: [], runder: [], turneringer: [] }; },
} });
mock.module("@/lib/profil-kobling/tilgang", { namedExports: { medSpillerTilgang: async () => null } });
mock.module("@/lib/iup/trener-profil-lesing", { namedExports: { lesLeverteIupForProfil: async () => [{ id: "i1", type: "UTVIKLINGSSJEKK" }] } });
mock.module("@/lib/iup/maaltall-data", { namedExports: { hentIupMaaltallForSpiller: async (_id: string, _db: unknown, o: { kunDelteRunder?: boolean }) => { maaltallKall.push({ kunDelte: o.kunDelteRunder }); return null; } } });

// Ekte, reberegnbart Team Norway-resultat (A10: bare gyldige forsøk telles).
const puttProtokoll = tnProtocol("putt-1-3m")!;
const puttResultat = tnScore(puttProtokoll, Object.fromEntries(puttProtokoll.rows.map((_, i) => [String(i + 1), { strokes: 1 }])));

const db = {
  user: { findFirst: async (a: { where: { id: string; groupMemberships?: unknown } }) => (a.where.groupMemberships ? (harIup ? { id: "u1" } : null) : { name: "Pia Egenes" }) },
  testResult: { findMany: async () => [
    { id: "r1", testId: "tn-v3-putt-1-3m", takenAt: new Date("2026-10-01"), score: puttResultat.score, details: puttResultat, test: { name: "Putt 1–3 m", pyramidArea: "SLAG" } },
    { id: "r2", testId: "tn-v3-putt-1-3m", takenAt: new Date("2026-09-15"), score: puttResultat.score, details: puttResultat, test: { name: "Putt 1–3 m", pyramidArea: "SLAG" } },
    { id: "r3", testId: "tn-v3-putt-1-3m", takenAt: new Date("2026-09-01"), score: 300, details: { ugyldig: true }, test: { name: "Putt 1–3 m", pyramidArea: "SLAG" } },
    { id: "r4", testId: "t-putt", takenAt: new Date("2026-10-05"), score: 8, details: null, test: { name: "Putt 3 fot", pyramidArea: "SLAG" } },
  ] },
  round: {
    aggregate: async (a: { where: unknown }) => { rundeFilter = a.where; return { _count: { _all: 3 }, _avg: { sgTotal: 1.2, sgOtt: 0.1, sgApp: 0.5, sgArg: 0.3, sgPutt: 0.3 } }; },
    findMany: async (a: { where: unknown }) => { treningFilter = a.where; return []; },
  },
};

let bygg: typeof import("./komplett").byggKomplettProfil;
before(async () => { bygg = (await import("./komplett")).byggKomplettProfil; });
beforeEach(() => { profilKall = []; maaltallKall = []; harIup = true; rundeFilter = null; treningFilter = null; });

test("golf-ID hentes bare når betrakteren er trener", async () => {
  await bygg(db as never, "u1", { kanSeGolfId: false });
  await bygg(db as never, "u1", { kanSeGolfId: true });
  assert.deepEqual(profilKall, [{ golf: false }, { golf: true }]);
});

test("runder merket «Bare deg» telles ikke, verken i statistikk eller IUP-måltall", async () => {
  await bygg(db as never, "u1", { kanSeGolfId: true });
  assert.equal((rundeFilter as { sharedWithCoach: boolean }).sharedWithCoach, true);
  assert.equal((treningFilter as { sharedWithCoach: boolean }).sharedWithCoach, true);
  assert.deepEqual(maaltallKall, [{ kunDelte: true }]);
});

test("Team Norway-tester vises uten score, grupperes per test og teller bare gyldige forsøk", async () => {
  const p = await bygg(db as never, "u1", { kanSeGolfId: false });
  const tn = p.tester.find((t) => t.testId === "tn-v3-putt-1-3m");
  assert.equal(tn?.antall, 2);
  assert.equal(tn?.sisteScore, null);
  assert.equal(p.tester.find((t) => t.testId === "t-putt")?.sisteScore, 8);
});

test("spillere uten IUP får ingen IUP-seksjon og ingen IUP-lesing", async () => {
  harIup = false;
  const p = await bygg(db as never, "u1", { kanSeGolfId: false });
  assert.equal(p.iup, null);
  assert.equal(maaltallKall.length, 0);
});

test("IUP leses når spilleren har IUP", async () => {
  const p = await bygg(db as never, "u1", { kanSeGolfId: false });
  assert.equal(p.iup?.levert.length, 1);
});
