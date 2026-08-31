import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  OPPSETT_FANER,
  OPPSETT_STANDARDFANE,
  erOppsettFaneId,
  oppsettHref,
  synligeOppsettFaner,
  velgOppsettFane,
} from "./faner";

const ADMIN = synligeOppsettFaner(true);
const COACH = synligeOppsettFaner(false);

test("åtte faner, i rekkefølgen fra canvasen Anders godkjente", () => {
  assert.deepEqual(OPPSETT_FANER.map((f) => f.id), [
    "akademi",
    "klubb",
    "kalender",
    "tilgang",
    "sikkerhet",
    "integrasjoner",
    "api",
    "perioder",
  ]);
  assert.deepEqual(OPPSETT_FANER.map((f) => f.label), [
    "Akademi",
    "Klubb",
    "Kalender",
    "Tilgang",
    "Sikkerhet",
    "Integrasjoner",
    "API",
    "Perioder",
  ]);
});

test("hver fane peker på adressen den erstattet", () => {
  const m = Object.fromEntries(OPPSETT_FANER.map((f) => [f.id, f.gammelHref]));
  assert.equal(m.akademi, "/admin/settings");
  assert.equal(m.klubb, "/admin/klubb/innstillinger");
  assert.equal(m.kalender, "/admin/settings/calendar");
  assert.equal(m.tilgang, "/admin/settings/tilgang");
  assert.equal(m.sikkerhet, "/admin/settings/security");
  assert.equal(m.integrasjoner, "/admin/integrasjoner");
  assert.equal(m.api, "/admin/settings/api");
  assert.equal(m.perioder, "/admin/settings/periode-navn");
});

test("ukjent, tom eller manglende ?fane= faller til standardfanen", () => {
  for (const f of [undefined, "", "tull", "settings", "../admin", "Akademi"]) {
    assert.equal(velgOppsettFane(f, ADMIN), OPPSETT_STANDARDFANE, String(f));
  }
});

test("gyldig ?fane= respekteres", () => {
  assert.equal(velgOppsettFane("perioder", ADMIN), "perioder");
  assert.equal(velgOppsettFane("integrasjoner", ADMIN), "integrasjoner");
});

test("tilgangsgatet er arvet 1:1 fra kildesidenes egen requirePortalUser", () => {
  // Kalender, Sikkerhet og Perioder tillot ADMIN/COACH på kildesiden —
  // de fire andre var ADMIN-only. En sammenslåing skal aldri utvide tilgang.
  const kreverAdmin = Object.fromEntries(OPPSETT_FANER.map((f) => [f.id, f.kreverAdmin]));
  assert.equal(kreverAdmin.akademi, true);
  assert.equal(kreverAdmin.klubb, true);
  assert.equal(kreverAdmin.kalender, false);
  assert.equal(kreverAdmin.tilgang, true);
  assert.equal(kreverAdmin.sikkerhet, false);
  assert.equal(kreverAdmin.integrasjoner, true);
  assert.equal(kreverAdmin.api, true);
  assert.equal(kreverAdmin.perioder, false);

  assert.deepEqual(ADMIN.map((f) => f.id), OPPSETT_FANER.map((f) => f.id));
  assert.deepEqual(COACH.map((f) => f.id), ["kalender", "sikkerhet", "perioder"]);
});

test("?fane=akademi/klubb/tilgang/integrasjoner/api kan ALDRI åpnes av en coach", () => {
  for (const f of ["akademi", "klubb", "tilgang", "integrasjoner", "api"]) {
    // En coach har ikke «akademi» blant synlige faner, så resultatet faller
    // til første synlige fane — «kalender» — aldri den ADMIN-only fanen.
    assert.equal(velgOppsettFane(f, COACH), "kalender", f);
  }
});

test("coach uten standardfanen (akademi) lander på første synlige (kalender)", () => {
  assert.equal(velgOppsettFane(undefined, COACH), "kalender");
});

test("erOppsettFaneId avviser alt som ikke er en fane", () => {
  assert.equal(erOppsettFaneId("perioder"), true);
  for (const s of [undefined, "", "Perioder", "oppsett", "settings"]) {
    assert.equal(erOppsettFaneId(s), false, String(s));
  }
});

test("standardfanen har ren adresse, resten har ?fane=", () => {
  assert.equal(oppsettHref("akademi"), "/admin/oppsett");
  assert.equal(oppsettHref("klubb"), "/admin/oppsett?fane=klubb");
  assert.equal(oppsettHref("perioder"), "/admin/oppsett?fane=perioder");
});

/**
 * Kildeskann: låser at siden faktisk bruker modulen og gater minst like
 * strengt som den snevreste kildesiden (ADMIN/COACH — tre av åtte faner
 * tillot COACH, resten er strengere internt i hver fane).
 */
test("/admin/oppsett gater ADMIN/COACH og bruker fanemodulen", () => {
  const src = readFileSync(join(process.cwd(), "src/app/admin/oppsett/page.tsx"), "utf8");
  const uten = src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  assert.match(uten, /requirePortalUser\(\{\s*allow:\s*\["ADMIN",\s*"COACH"\]\s*\}\)/);
  assert.match(uten, /velgOppsettFane\(/);
});
