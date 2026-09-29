import test from "node:test";
import assert from "node:assert/strict";

import type { TnProtocol } from "@/lib/portal-tester/tn-catalog";
import { akKategoriRader, enheter, gjelderKlasse, kortVersjon, lagReferanseRader, lesKlasse } from "./referanse-data";

const p = (id: string, name: string, extra: Partial<TnProtocol> = {}): TnProtocol => ({
  id, name, source: "x", kind: "carry",
  rows: [{ label: "Forsøk 1", fields: [{ key: "carry", label: "Carry", unit: "m" }, { key: "speed", label: "Hastighet", unit: "mph", optional: true }] }],
  ...extra,
});

test("lesKlasse godtar bare gyldige indekser", () => {
  assert.equal(lesKlasse("2"), 2);
  assert.equal(lesKlasse(["3"]), 3);
  assert.equal(lesKlasse("9"), 0);
  assert.equal(lesKlasse("abc"), 0);
  assert.equal(lesKlasse(undefined), 0);
});

test("kjønnsvarianter vises bare i sin klasse", () => {
  assert.equal(gjelderKlasse("Golfslag bane · gutter", "Herrer"), true);
  assert.equal(gjelderKlasse("Golfslag bane · gutter", "Damer"), false);
  assert.equal(gjelderKlasse("Innspill Basis · jenter 125 m", "Jenter U18"), true);
  assert.equal(gjelderKlasse("Innspill Basis · jenter 125 m", "Gutter U18"), false);
  assert.equal(gjelderKlasse("Wedge Variation", "Damer"), true);
});

test("enheter hopper over valgfrie felt og dubletter", () => {
  assert.equal(enheter(p("a", "A")), "m");
  assert.equal(enheter({ rows: [{ label: "x", fields: [{ key: "k", label: "K" }] }] }), "—");
});

test("kortVersjon plukker versjonsnummeret", () => {
  assert.equal(kortVersjon("tn-excel-v3-2026-09-10"), "v3");
  assert.equal(kortVersjon("ukjent"), "ukjent");
});

test("landslagsnormen er aldri gjettet", () => {
  const rader = lagReferanseRader([p("a", "A"), p("b", "B · jenter", { blocked: "mangler skala" })], "Herrer");
  assert.equal(rader.length, 1);
  assert.equal(rader[0].landslag, null);
  assert.equal(rader[0].utkast, false);
});

test("AK-kategoriene har åpne ender", () => {
  const rader = akKategoriRader();
  assert.equal(rader.length, 11);
  assert.equal(rader[0].grenser, "under 68");
  assert.equal(rader[1].grenser, "68–72");
  assert.equal(rader[10].grenser, "100+");
});
