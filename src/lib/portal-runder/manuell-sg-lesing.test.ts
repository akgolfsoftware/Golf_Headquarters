import { before, beforeEach, mock, test } from "node:test";
import assert from "node:assert/strict";
import { SG_ALLE_FELT } from "./manuell-sg";

let viewer = { id: "spiller-a", role: "PLAYER" };
let hasScope = false;
let exists = true;
let scopeChecks = 0;
/** Tomt = totalrunde uten scorekort (par og mot par ukjent). */
let hullKort: Array<{ holeNumber: number; par: number; strokes: number; putts: number | null; fairway: boolean | null; gir: boolean | null }> = [];
let sgTotalVerdi: number | null = null;
let sgKilde: string | null = "manual";
const values = Object.fromEntries(SG_ALLE_FELT.map((f) => [f.key, null]));
const round = () => ({
  ...values, id: "runde-a", userId: "spiller-a", playedAt: new Date("2026-09-10"),
  course: { name: "Testbanen", par: 72 }, score: 72, shots: [], holeScores: hullKort,
  sgSource: sgKilde, sgTotal: sgTotalVerdi, sgPutt: 0, sgLob: -0.3, sgPutt40plus: -0.2,
});
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => viewer } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => { scopeChecks++; return hasScope; } } });
mock.module("@/lib/prisma", { namedExports: { prisma: { round: { findUnique: async () => exists ? round() : null } } } });
mock.module("next/navigation", { namedExports: { notFound: () => { throw new Error("NOT_FOUND"); } } });
mock.module("@/components/v2/shell", { namedExports: { V2Shell: () => null, PLAYERHQ_NAV: [] } });
mock.module("@/components/portal/v2/RundeDetaljV2", { namedExports: { RundeDetaljV2: () => null } });
let page: typeof import("@/app/portal/mal/runder/[id]/page").default;
before(async () => { page = (await import("@/app/portal/mal/runder/[id]/page")).default; });
beforeEach(() => {
  viewer = { id: "spiller-a", role: "PLAYER" }; hasScope = false; exists = true; scopeChecks = 0;
  hullKort = []; sgTotalVerdi = null; sgKilde = "manual";
});
/** Ni hull, par 36 — brukes til å prøve at par IKKE hentes fra banens 72. */
const niHull = () =>
  [4, 3, 5, 4, 4, 3, 4, 5, 4].map((par, i) => ({
    holeNumber: i + 1, par, strokes: par, putts: null, fairway: null, gir: null,
  }));
const read = () => page({ params: Promise.resolve({ id: "runde-a" }), searchParams: Promise.resolve({ lagret: "1" }) });

test("eieren får alle manuelle felt, også nullkategori og lob uten kjent total", async () => {
  const result = await read();
  const data = result.props.children.props.data;
  assert.equal(data.erEier, true); assert.equal(scopeChecks, 0);
  assert.equal(data.sg.vis, false, "uten lagret SG-verdi skal ingenting vises");
  assert.equal(data.sgSource, "manual");
  assert.deepEqual(data.sgKategorier, [{ akse: "PUTT", sg: 0 }]);
  assert.equal(data.manuellSg.sgLob, -0.3); assert.equal(data.granulaerSg.lob, -0.3);
  assert.equal(Object.keys(data.manuellSg).length, 21);
});

test("andre spillere, uvedkommende coach og admin uten spillerrelasjon får ikke lese", async () => {
  for (const role of ["PLAYER", "COACH", "ADMIN", "PARENT"]) {
    viewer = { id: "annen", role };
    await assert.rejects(read(), /NOT_FOUND/);
  }
  assert.equal(scopeChecks, 2);
});

test("coach med bekreftet spillerrelasjon kan lese, men er ikke eier", async () => {
  viewer = { id: "coach-a", role: "COACH" }; hasScope = true;
  const result = await read(); assert.equal(result.props.children.props.data.erEier, false);
  assert.equal(scopeChecks, 1);
});

test("ukjent runde gir ikke et tomt redigeringsskjema", async () => {
  exists = false; await assert.rejects(read(), /NOT_FOUND/);
});

test("totalrunde uten scorekort: par, mot par og hullantall er ukjent", async () => {
  const data = (await read()).props.children.props.data;
  assert.equal(data.par, null, "banens par 72 skal ikke påføres en runde vi ikke vet lengden på");
  assert.equal(data.antallSpilteHull, null);
  assert.equal(data.score, 72, "uten scorekort er lagret total eneste kjente score");
});

test("nihullsrunde måles mot par 36 fra scorekortet, ikke mot banens 72", async () => {
  hullKort = niHull();
  const data = (await read()).props.children.props.data;
  assert.equal(data.antallSpilteHull, 9);
  assert.equal(data.par, 36);
  assert.equal(data.score, 36, "brutto er summen av de spilte hullene");
});

test("komplett scorekort gir ikke SG av seg selv", async () => {
  hullKort = niHull();
  sgTotalVerdi = null;
  const data = (await read()).props.children.props.data;
  assert.equal(data.sg.vis, false, "hullkort er ikke en SG-beregning");
});

test("SG med ukjent metode vises ikke, selv om verdien finnes", async () => {
  sgTotalVerdi = -1.4;
  sgKilde = null;
  const data = (await read()).props.children.props.data;
  assert.equal(data.sg.vis, false);
});

test("lagret SG med kjent metode vises med metodemerking", async () => {
  sgTotalVerdi = -1.4;
  sgKilde = "beregnet";
  const data = (await read()).props.children.props.data;
  assert.equal(data.sg.vis, true);
  assert.equal(data.sg.verdi, -1.4);
  assert.equal(data.sg.erEstimat, false);
});

test("eldre estimert SG skjules ikke, men merkes som estimat", async () => {
  sgTotalVerdi = 2.1;
  sgKilde = "estimert";
  const data = (await read()).props.children.props.data;
  assert.equal(data.sg.vis, true);
  assert.equal(data.sg.erEstimat, true);
});
