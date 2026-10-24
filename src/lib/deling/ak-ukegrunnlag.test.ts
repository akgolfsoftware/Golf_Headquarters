import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";
let allowed = true, read = 0, writes = 0;
let row: Record<string, unknown>;
const proof = { versjon: 1, spillerId: "p", gruppeId: "g", coachId: "c" };
const tx = { user: { findFirst: async () => ({ id: "p" }) }, $queryRaw: async (query: TemplateStringsArray) => { read++; return query.join("?").includes("FOR UPDATE") ? [{ id: "plan" }] : [row]; } };
mock.module("./ak-profil-mellomlagring", { namedExports: {
  hentMedAkProfilBevis: async (_job: unknown, _player: unknown, callback: (tx: unknown, scope: unknown) => Promise<unknown>) =>
    allowed ? { bevis: proof, verdi: await callback(tx, { id: "p" }) } : null,
  brukMedSammeAkProfilBevis: async (_job: unknown, _player: unknown, _proof: unknown, callback: (tx: unknown, scope: unknown) => Promise<unknown>) =>
    allowed ? { verdi: await callback(tx, { id: "p" }) } : null,
} });
const job = { gruppeId: "g", coachId: "c" };
const week = "2026-10-26";
beforeEach(() => {
  allowed = true; read = 0; writes = 0;
  row = { nivaKildeGyldig: true, nivaTurneringer: [], koblingsVersjoner: null, fasiliteter: [], hcp: 12, preferanser: { okterPerUke: 4, dager: [1, 3] }, planer: [{ id: "plan", revisjon: "1", coachId: "c", fra: "2026-01-01", til: null }],
    sesonger: [{ id: "season", revisjon: "1" }],
    perioder: [{ id: "period", revisjon: "1", fase: "GRUNN", gruppeId: "g", budsjett: { TEK: 3 }, minutter: null, letteMinutter: null }],
    sg: [{ id: "sg", revisjon: "1", verdi: -1, omrade: "PUTT" }], turnering: null, fullforte: 2,
    oktVersjoner: "one", planOktVersjoner: null, manedVersjoner: null, ukeVersjoner: null };
});

test("weekly capture is scoped and only controlled context reaches model boundary", async () => {
  const { hentAkUkegrunnlag, brukSammeAkUkegrunnlag } = await import("./ak-ukegrunnlag");
  const captured = await hentAkUkegrunnlag(job, "p", week); assert.ok(captured);
  assert.deepEqual(captured.budsjett, { TEK: 3 });
  assert.equal(captured.modell.context.completedSessions, 2);
  assert.ok(!JSON.stringify(captured.modell).includes('"id"'));
  assert.deepEqual(await brukSammeAkUkegrunnlag(job, "p", proof, captured.databevis, async () => ++writes), { verdi: 1 });
});

test("no access or invalid calendar week cannot read player inputs", async () => {
  const { hentAkUkegrunnlag } = await import("./ak-ukegrunnlag");
  for (const invalid of [null, "2026-10-27", "2026-02-30", "2026-10-26T00:00:00Z", "2026-10-26 injected"]) {
    assert.equal(await hentAkUkegrunnlag(job, "p", invalid), null);
  }
  allowed = false; assert.equal(await hentAkUkegrunnlag(job, "p", week), null);
  assert.equal(read, 0);
});

test("missing, ambiguous, other-coach or other-group basis is denied", async () => {
  const { hentAkUkegrunnlag } = await import("./ak-ukegrunnlag");
  const original = structuredClone(row);
  const variations = [ { planer: [] }, { planer: [{ id: "plan", revisjon: "1", coachId: "other" }] },
    { planer: [original.planer, original.planer].flat() }, { sesonger: [original.sesonger, original.sesonger].flat() },
    { perioder: [original.perioder, original.perioder].flat() },
    { perioder: [{ id: "period", revisjon: "1", fase: "GRUNN", gruppeId: "other", budsjett: null, minutter: null, letteMinutter: null }] } ];
  for (const change of variations) { row = { ...original, ...change }; assert.equal(await hentAkUkegrunnlag(job, "p", week), null); }
});

test("each plan/data revision change prevents the mutation callback", async () => {
  const { hentAkUkegrunnlag, brukSammeAkUkegrunnlag } = await import("./ak-ukegrunnlag");
  const captured = await hentAkUkegrunnlag(job, "p", week); assert.ok(captured);
  const original = structuredClone(row);
  for (const change of [{ oktVersjoner: "two" }, { planOktVersjoner: "new" }, { ukeVersjoner: "new" },
    { manedVersjoner: "new" }, { fullforte: 3 }, { planer: [{ id: "plan", revisjon: "2", coachId: "c", fra: "2026-01-01", til: null }] }]) {
    row = { ...original, ...change };
    assert.equal(await brukSammeAkUkegrunnlag(job, "p", proof, captured.databevis, async () => ++writes), null);
  }
  assert.equal(writes, 0);
});

test("missing phase and untrusted text remain unknown without guessed defaults", async () => {
  row.perioder = []; row.sesonger = []; row.hcp = 100;
  row.preferanser = { okterPerUke: "private", dager: ["private"] };
  row.sg = [{ id: "sg", revisjon: "1", verdi: -1, omrade: "private" }];
  row.manedVersjoner = "override";
  const { hentAkUkegrunnlag } = await import("./ak-ukegrunnlag");
  const captured = await hentAkUkegrunnlag(job, "p", week); assert.ok(captured);
  assert.equal(captured.modell.category, null); assert.equal(captured.modell.signals.aktivFase, null);
  assert.equal(captured.modell.signals.okterPerUke, null); assert.deepEqual(captured.modell.context.sgWeaknesses, []);
  assert.equal(captured.harManedsEllerUkevalg, true);
  assert.ok(!JSON.stringify(captured.modell).includes("private"));
});

test("malformed server data proof is denied before reading weekly data", async () => {
  const { brukSammeAkUkegrunnlag } = await import("./ak-ukegrunnlag");
  for (const value of [null, {}, { versjon: 0 }, { versjon: 1, uke: week, planId: "plan", fingeravtrykk: "bad" }]) {
    assert.equal(await brukSammeAkUkegrunnlag(job, "p", proof, value, async () => ++writes), null);
  }
  assert.equal(read, 0); assert.equal(writes, 0);
});


test("facility facts stay local and each recorded revision binds the snapshot", async () => {
  const maal = { type: "KLUBBANLEGG", isIndoor: false, rangeLengdeM: 200, maksPuttLengdeM: 12 };
  row.fasiliteter = [{ id: "private-facility", revisjon: "1", capabilities: ["RADAR", "DRIVING_RANGE"], ...maal, name: "Private name", notes: "Private notes" }];
  const { hentAkUkegrunnlag, brukSammeAkUkegrunnlag } = await import("./ak-ukegrunnlag");
  const captured = await hentAkUkegrunnlag(job, "p", week); assert.ok(captured);
  assert.deepEqual(captured.fasiliteter, [{ capabilities: ["RADAR", "DRIVING_RANGE"], ...maal }]);
  for (const field of Object.keys(maal)) assert.ok(!JSON.stringify(captured.modell).includes(field));
  for (const word of ["private-facility", "Private name", "Private notes"]) assert.ok(!JSON.stringify(captured).includes(word));
  assert.ok(!JSON.stringify(captured.modell).includes("RADAR"));
  row.fasiliteter = [{ id: "private-facility", revisjon: "2", ...maal, capabilities: ["RADAR", "DRIVING_RANGE"] }];
  assert.equal(await brukSammeAkUkegrunnlag(job, "p", proof, captured.databevis, async () => ++writes), null);
  assert.equal(writes, 0);
});

test("unknown capability is not treated as verified equipment", async () => {
  row.fasiliteter = [{ id: "f", revisjon: "1", capabilities: ["ARBITRARY_TEXT"] }];
  const { hentAkUkegrunnlag } = await import("./ak-ukegrunnlag");
  assert.equal(await hentAkUkegrunnlag(job, "p", week), null);
});
