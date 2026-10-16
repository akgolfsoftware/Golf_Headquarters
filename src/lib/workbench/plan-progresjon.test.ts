import assert from "node:assert/strict";
import { test } from "node:test";
import { hovedakse, leggSammen, prosent, tempo, ukeErGatt, ukeErNa, velgGrunnlag, tomAkser } from "./plan-progresjon";

const V = { FYS: 90, TEK: 180, SLAG: 225, SPILL: 350 }; // 845 min

test("I rute når gjennomført i gåtte uker er minst 90 % av det som var fordelt i dem", () => {
  const t = tempo([
    { weekStart: "2026-09-28", fordelt: V, gjennomfort: 790 },
    { weekStart: "2026-10-05", fordelt: V, gjennomfort: 0 },
  ], "2026-10-05");
  assert.deepEqual(t, { status: "rute", gjort: 790, skulle: 845, gatteUker: 1 });
});

test("Bak under 90 %", () => {
  const t = tempo([{ weekStart: "2026-09-28", fordelt: V, gjennomfort: 700 }], "2026-10-05");
  assert.equal(t.status, "bak");
});

test("uker uten fordeling teller verken opp eller ned", () => {
  const t = tempo([
    { weekStart: "2026-09-21", fordelt: null, gjennomfort: 0 },
    { weekStart: "2026-09-28", fordelt: V, gjennomfort: 845 },
  ], "2026-10-05");
  assert.equal(t.status, "rute");
  assert.equal(t.gatteUker, 2);
  assert.equal(t.status === "rute" && t.skulle, 845);
});

test("ukjent når ingen uke er gått, eller ingenting var fordelt", () => {
  assert.deepEqual(tempo([{ weekStart: "2026-10-05", fordelt: V, gjennomfort: 0 }], "2026-10-07"), { status: "ukjent", grunn: "ingen-gatt", gatteUker: 0 });
  assert.deepEqual(tempo([{ weekStart: "2026-09-28", fordelt: null, gjennomfort: 300 }], "2026-10-07"), { status: "ukjent", grunn: "ikke-fordelt", gatteUker: 1 });
});

test("uka er over først etter søndagen", () => {
  assert.equal(ukeErGatt("2026-09-28", "2026-10-04"), false);
  assert.equal(ukeErGatt("2026-09-28", "2026-10-05"), true);
  assert.equal(ukeErNa("2026-10-05", "2026-10-11"), true);
  assert.equal(ukeErNa("2026-10-12", "2026-10-11"), false);
});

test("måler mot fordelt, ellers lagt inn, ellers ingenting", () => {
  const lagt = { ...tomAkser(), SLAG: 60 };
  assert.equal(velgGrunnlag(leggSammen([V]), lagt).kilde, "fordelt");
  assert.deepEqual(velgGrunnlag(tomAkser(), lagt), { grunnlag: lagt, kilde: "lagt inn" });
  assert.equal(velgGrunnlag(tomAkser(), tomAkser()).kilde, null);
});

test("hovedakse og prosent gjetter aldri", () => {
  assert.equal(hovedakse(V), "SPILL");
  assert.equal(hovedakse(tomAkser()), null);
  assert.equal(prosent(5, 0), null);
  assert.equal(prosent(790, 845), 93);
});
