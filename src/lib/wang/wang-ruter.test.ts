import assert from "node:assert/strict";
import { test } from "node:test";

import {
  WANG_HOVEDPUNKTER,
  WANG_SKJERMER,
  byggWangMeny,
  elevprofilHref,
  erWangTrenerSti,
  finnWangSkjerm,
  lesElevprofilFane,
  wangHref,
} from "./wang-ruter";

test("alle skjermer har unik ID og unik sti", () => {
  const ider = WANG_SKJERMER.map((s) => s.id);
  assert.equal(new Set(ider).size, ider.length);
  const stier = WANG_SKJERMER.map((s) => s.sti);
  assert.equal(new Set(stier).size, stier.length);
});

test("hver skjerm står i nøyaktig ett hovedpunkt, og hovedpunktet stemmer", () => {
  for (const s of WANG_SKJERMER) {
    const treff = WANG_HOVEDPUNKTER.filter((h) => h.faner.includes(s.id));
    assert.equal(treff.length, 1, s.id);
    assert.equal(treff[0].id, s.hovedpunkt, s.id);
  }
});

test("ingen trenerskjerm ligger på fellessiden eller innloggingen", () => {
  for (const s of WANG_SKJERMER) {
    assert.notEqual(s.sti, "/team-wang");
    assert.ok(!s.sti.includes("?"), s.id);
    assert.ok(!s.sti.startsWith("/team-wang/logg-inn"), s.id);
  }
  assert.equal(finnWangSkjerm("/team-wang"), null);
  assert.equal(finnWangSkjerm("/team-wang/logg-inn"), null);
  assert.equal(erWangTrenerSti("/team-wang"), false);
  assert.equal(erWangTrenerSti("/team-wang/logg-inn"), false);
  assert.equal(erWangTrenerSti("/team-wang/manifest.webmanifest"), false);
});

test("stier og detaljsider finner riktig skjerm", () => {
  assert.equal(finnWangSkjerm("/team-wang/trening")?.id, "WANG-42");
  assert.equal(finnWangSkjerm("/team-wang/trening/arsplan")?.id, "WANG-29");
  assert.equal(finnWangSkjerm("/team-wang/trening/okter/abc")?.id, "WANG-18");
  assert.equal(finnWangSkjerm("/team-wang/elev/cuid123")?.id, "WANG-44");
  assert.equal(finnWangSkjerm("/team-wang/konkurranse/turnering/t1")?.id, "WANG-11");
  assert.equal(finnWangSkjerm("/team-wang/coach")?.id, "WG-05");
  assert.equal(erWangTrenerSti("/team-wang/coach/iup/elev-1"), true);
  assert.equal(erWangTrenerSti("/team-wang/admin/plasser"), true);
});

test("trener ser seks hovedpunkter, sportssjef sju med Administrasjon", () => {
  const trener = byggWangMeny("TRENER", "/team-wang/i-dag");
  assert.deepEqual(trener.hovedpunkter.map((h) => h.navn), ["I dag", "Trening", "Tester", "Konkurranse", "Meldinger", "Elever"]);
  const sjef = byggWangMeny("SPORTSSJEF", "/team-wang/i-dag");
  assert.deepEqual(sjef.hovedpunkter.map((h) => h.id), ["idag", "trening", "tester", "konkurranse", "meldinger", "elever", "admin"]);
});

test("mobil: I dag, Trening, Tester og Elever i bunnraden, resten under Mer", () => {
  const trener = byggWangMeny("TRENER", "/team-wang/i-dag");
  assert.deepEqual(trener.mobil.map((h) => h.id), ["idag", "trening", "tester", "elever"]);
  assert.deepEqual(trener.mer.map((h) => h.id), ["konkurranse", "meldinger"]);
  const sjef = byggWangMeny("SPORTSSJEF", "/team-wang/i-dag");
  assert.deepEqual(sjef.mer.map((h) => h.id), ["konkurranse", "meldinger", "admin"]);
});

test("trener får ingen Administrasjon-skjerm aktiv, heller ikke via sti", () => {
  const meny = byggWangMeny("TRENER", "/team-wang/admin/trenere");
  assert.equal(meny.aktivtHovedpunkt, null);
  assert.deepEqual(meny.faner, []);
});

test("fanene i Trening har skillelinjene Plan og Økter", () => {
  const meny = byggWangMeny("TRENER", "/team-wang/trening/periode");
  assert.equal(meny.aktivtHovedpunkt?.id, "trening");
  assert.deepEqual(meny.faner.map((f) => f.id), ["WANG-42", "WANG-29", "WANG-16", "WANG-17", "WANG-18", "WANG-04", "WANG-38"]);
  assert.equal(meny.faner.find((f) => f.aktiv)?.id, "WANG-16");
  assert.equal(meny.faner.find((f) => f.id === "WANG-29")?.del, "Plan");
  assert.equal(meny.faner.find((f) => f.id === "WANG-16")?.valgEtikett, "Plan · Periodeplan");
  assert.equal(meny.faner.find((f) => f.id === "WANG-42")?.etikett, "Oversikt");
});

test("detaljskjerm vises som fane bare når den er åpen, uten lenke", () => {
  const liste = byggWangMeny("TRENER", "/team-wang/elever");
  assert.ok(!liste.faner.some((f) => f.id === "WANG-44"));
  const profil = byggWangMeny("TRENER", "/team-wang/elev/e1");
  const fane = profil.faner.find((f) => f.id === "WANG-44");
  assert.ok(fane?.aktiv);
  assert.equal(fane?.href, null);
});

test("lenker bygges fra rutekartet", () => {
  assert.equal(wangHref("WANG-11", { turneringId: "t 1" }), "/team-wang/konkurranse/turnering/t%201");
  assert.throws(() => wangHref("WANG-11"));
  assert.equal(elevprofilHref("e1"), "/team-wang/elev/e1");
  assert.equal(elevprofilHref("e1", "iup"), "/team-wang/elev/e1?fane=iup");
  assert.equal(lesElevprofilFane("samtaler"), "samtaler");
  assert.equal(lesElevprofilFane("tull"), "plan");
});
