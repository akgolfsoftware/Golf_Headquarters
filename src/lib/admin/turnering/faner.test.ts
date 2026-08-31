import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  TURNERING_FANER,
  TURNERING_STANDARDFANE,
  erTurneringFaneId,
  turneringHref,
  velgTurneringFane,
} from "./faner";

/**
 * MASTERPLAN 15.6: fire adresser ble til én. Alle fire fanene arver samme
 * gate som kildesidene hadde (ADMIN/COACH) — disse testene låser at
 * fanelogikken aldri utvider den, og at hver fane peker på adressen den
 * erstattet.
 */

test("fire faner, i canvas-rekkefølgen", () => {
  assert.deepEqual(
    TURNERING_FANER.map((f) => f.id),
    ["alle", "mine-spillere", "dubletter", "kart"],
  );
});

test("hver fane med en gammel adresse peker på den den erstattet", () => {
  const gamle = TURNERING_FANER.map((f) => f.gammelHref);
  assert.deepEqual(gamle, [
    "/admin/tournaments",
    null,
    "/admin/tournaments/dubletter",
    "/admin/turnering-kart",
  ]);
  const ikkeNull = gamle.filter((g): g is string => g !== null);
  assert.equal(new Set(ikkeNull).size, ikkeNull.length, "ingen adresse to ganger");
});

test("/admin/tournaments/ny er IKKE en fane — den er CTA-en, ikke et faneinnhold", () => {
  assert.equal(
    TURNERING_FANER.some((f) => f.gammelHref === "/admin/tournaments/ny"),
    false,
  );
});

test("erTurneringFaneId avviser alt som ikke er en fane", () => {
  assert.equal(erTurneringFaneId("alle"), true);
  assert.equal(erTurneringFaneId("mine-spillere"), true);
  for (const s of [undefined, "", "ny", "Alle", "tull"]) {
    assert.equal(erTurneringFaneId(s), false, String(s));
  }
});

test("ukjent, tom eller manglende ?fane= faller til standardfanen", () => {
  for (const forsok of [undefined, "", "tull", "ny", "../admin"]) {
    assert.equal(velgTurneringFane(forsok), TURNERING_STANDARDFANE, String(forsok));
  }
});

test("gyldig ?fane= respekteres", () => {
  assert.equal(velgTurneringFane("dubletter"), "dubletter");
  assert.equal(velgTurneringFane("kart"), "kart");
  assert.equal(velgTurneringFane("mine-spillere"), "mine-spillere");
});

test("standardfanen har ren adresse, resten har ?fane=", () => {
  assert.equal(turneringHref("alle"), "/admin/turnering");
  assert.equal(turneringHref("mine-spillere"), "/admin/turnering?fane=mine-spillere");
  assert.equal(turneringHref("dubletter"), "/admin/turnering?fane=dubletter");
  assert.equal(turneringHref("kart"), "/admin/turnering?fane=kart");
});

/**
 * Kildeskann: låser at SIDEN faktisk bruker ADMIN/COACH som basisgate og
 * fanelogikken over — samme mønster som src/lib/admin/ko/faner.test.ts.
 */
test("/admin/turnering gater på ADMIN/COACH og bruker fanelogikken", () => {
  const src = readFileSync(join(process.cwd(), "src/app/admin/turnering/page.tsx"), "utf8");
  const uten = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

  assert.match(
    uten,
    /requirePortalUser\(\{\s*allow:\s*\["ADMIN",\s*"COACH"\]\s*\}\)/,
    "siden må ha ADMIN/COACH som basisgate",
  );
  assert.match(uten, /velgTurneringFane\(/, "siden må velge fane via fanelogikken");
});
