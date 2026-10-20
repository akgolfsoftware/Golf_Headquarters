import { before, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";

// Kun fiktive personer.
let profilKall: { golf?: boolean }[] = [];
let maaltallKall: { kunDelte?: boolean }[] = [];
let harIup = true;
let rundeFilter: unknown = null;

mock.module("@/lib/profil-kobling/data", { namedExports: {
  hentSpillerprofil: async (_id: string, o: { inkluderGolfId?: boolean }) => { profilKall.push({ golf: o.inkluderGolfId }); return { person: { name: "Pia Egenes", birth_year: 2009 }, sesonger: [], monster: [], runder: [], turneringer: [] }; },
} });
mock.module("@/lib/profil-kobling/tilgang", { namedExports: { medSpillerTilgang: async () => null } });
mock.module("@/lib/iup/trener-profil-lesing", { namedExports: { lesLeverteIupForProfil: async () => [{ id: "i1", type: "UTVIKLINGSSJEKK" }] } });
mock.module("@/lib/iup/maaltall-data", { namedExports: { hentIupMaaltallForSpiller: async (_id: string, _db: unknown, o: { kunDelteRunder?: boolean }) => { maaltallKall.push({ kunDelte: o.kunDelteRunder }); return null; } } });

const db = {
  user: { findFirst: async (a: { where: { id: string; groupMemberships?: unknown } }) => (a.where.groupMemberships ? (harIup ? { id: "u1" } : null) : { name: "Pia Egenes" }) },
  testResult: { findMany: async () => [
    { testId: "tn-v3-driver", takenAt: new Date("2026-10-01"), score: 312, test: { name: "Driver", pyramidArea: "TEK" } },
    { testId: "tn-v3-driver", takenAt: new Date("2026-09-01"), score: 300, test: { name: "Driver", pyramidArea: "TEK" } },
    { testId: "t-putt", takenAt: new Date("2026-10-05"), score: 8, test: { name: "Putt 3 fot", pyramidArea: "SLAG" } },
  ] },
  round: { aggregate: async (a: { where: unknown }) => { rundeFilter = a.where; return { _count: { _all: 3 }, _avg: { score: 74, sgTotal: 1.2, sgOtt: 0.1, sgApp: 0.5, sgArg: 0.3, sgPutt: 0.3 } }; } },
};

let bygg: typeof import("./komplett").byggKomplettProfil;
before(async () => { bygg = (await import("./komplett")).byggKomplettProfil; });
beforeEach(() => { profilKall = []; maaltallKall = []; harIup = true; rundeFilter = null; });

test("golf-ID hentes bare når betrakteren er trener", async () => {
  await bygg(db as never, "u1", { kanSeGolfId: false });
  await bygg(db as never, "u1", { kanSeGolfId: true });
  assert.deepEqual(profilKall, [{ golf: false }, { golf: true }]);
});

test("runder merket «Bare deg» telles ikke, verken i statistikk eller IUP-måltall", async () => {
  await bygg(db as never, "u1", { kanSeGolfId: true });
  assert.equal((rundeFilter as { sharedWithCoach: boolean }).sharedWithCoach, true);
  assert.deepEqual(maaltallKall, [{ kunDelte: true }]);
});

test("Team Norway-tester vises uten score, og tester grupperes per test", async () => {
  const p = await bygg(db as never, "u1", { kanSeGolfId: false });
  const tn = p.tester.find((t) => t.testId === "tn-v3-driver");
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
