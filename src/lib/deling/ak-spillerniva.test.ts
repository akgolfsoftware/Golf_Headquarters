import assert from "node:assert/strict";
import { test } from "node:test";
import { AK_BANDS, akKategoriFraTall } from "@/lib/domain/ak-kategori";
import { akNivaTurneringerSchema, beregnAkSpillerniva, ovelseMatcherAkNiva } from "./ak-spillerniva";
const turnering = (score: Array<number | null>, year = 2026, klasse = "G19") => ({
  start_date: `${year}-06-01`, year, klasse, plassering: score.length ? 1 : null,
  total_score: score.length ? score.reduce<number>((sum, s) => sum + (s ?? 0), 0) : null,
  runder: score.map((s, i) => ({ runde: i + 1, score: s })),
});
const fri = { minKategori: null, maxKategori: null, minHcp: null, maxHcp: null };

test("same gross tournament rule excludes net classes, previous years and empty entries", () => {
  const niva = beregnAkSpillerniva([turnering([72, 74]), turnering([76]), turnering([60], 2026, "G19N"),
    turnering([100], 2025), turnering([])], 30, 2026);
  assert.deepEqual(niva, { kategori: "D", kilde: "BRUTTO_TURNERING", aar: 2026, runder: 3, bruttoSnitt: 74, hcp: 30 });
});

test("category boundaries match the canonical A–K table", () => {
  for (const band of AK_BANDS) {
    const score = band.min ?? 67;
    assert.equal(beregnAkSpillerniva([turnering([score])], null, 2026).kategori, band.kategori);
  }
});

test("HCP fallback is explicitly estimated and never fills a measured average", () => {
  const niva = beregnAkSpillerniva([], 12, 2026);
  assert.equal(niva.kategori, akKategoriFraTall({ snitt: null, hcp: 12 }));
  assert.equal(niva.kilde, "HCP_ESTIMAT"); assert.equal(niva.bruttoSnitt, null); assert.equal(niva.runder, 0);
  for (const hcp of [null, undefined, NaN, Infinity, 100, -11, "12"]) {
    const unknown = beregnAkSpillerniva([], hcp, 2026);
    assert.equal(unknown.kategori, null); assert.equal(unknown.kilde, "UKJENT");
  }
});

test("partial scores use only actual positive rounds, not a guessed round count", () => {
  const niva = beregnAkSpillerniva([turnering([null, 72, 0, -1])], null, 2026);
  assert.equal(niva.bruttoSnitt, 72); assert.equal(niva.runder, 1);
  assert.equal(beregnAkSpillerniva([{ ...turnering([72]), start_date: null }], null, 2026).bruttoSnitt, 72);
  assert.equal(beregnAkSpillerniva([{ ...turnering([72]), start_date: null, year: null }], null, 2026).kilde, "UKJENT");
});

test("source shape is validated, extra identity fields are removed", () => {
  const parsed = akNivaTurneringerSchema.parse([{ ...turnering([72]), name: "Syntetisk privat navn", golf_id: "private" }]);
  assert.ok(!JSON.stringify(parsed).includes("private")); assert.ok(!JSON.stringify(parsed).includes("Syntetisk"));
  for (const value of [null, {}, [{}], [{ ...turnering([72]), runder: [{ runde: 1, score: "72" }] }]]) {
    assert.equal(akNivaTurneringerSchema.safeParse(value).success, false);
  }
});

test("declared category and handicap bounds both apply without repairing invalid ranges", () => {
  const niva = beregnAkSpillerniva([turnering([74])], 5, 2026);
  assert.equal(ovelseMatcherAkNiva({ ...fri, minKategori: "C", maxKategori: "E" }, niva), true);
  for (const invalid of [{ minKategori: "A", maxKategori: "C" }, { minKategori: "E", maxKategori: "D" },
    { minKategori: "L" }, { maxKategori: "private" }, { minHcp: 6 }, { maxHcp: 4 },
    { minHcp: 10, maxHcp: 0 }, { minHcp: NaN }, { maxHcp: Infinity }]) {
    assert.equal(ovelseMatcherAkNiva({ ...fri, ...invalid }, niva), false);
  }
  assert.equal(ovelseMatcherAkNiva({ ...fri, minHcp: 5, maxHcp: 5 }, niva), true);
});

test("unknown level allows only unrestricted category and no explicit HCP bound", () => {
  const niva = beregnAkSpillerniva([], null, 2026);
  assert.equal(ovelseMatcherAkNiva(fri, niva), true);
  assert.equal(ovelseMatcherAkNiva({ ...fri, minKategori: "A", maxKategori: "K" }, niva), true);
  for (const restriction of [{ minKategori: "B" }, { maxKategori: "J" }, { minHcp: -10 }, { maxHcp: 54 }]) {
    assert.equal(ovelseMatcherAkNiva({ ...fri, ...restriction }, niva), false);
  }
});
