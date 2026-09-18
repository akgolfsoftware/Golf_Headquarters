import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { dataFor } from "../../lib/tn/demo.ts";
import { hydrate } from "./hydrate.ts";
import { frameCandidates } from "./frame-key.ts";

const DIR = join(process.cwd(), "src/components/tn/frames");

const MUST = [
  "oversikt",
  "spillere",
  "fellestesting",
  "samling",
  "college",
  "manedsplan",
  "uttak",
  "rangliste",
  "skoler",
  "poster",
  "utoverpost",
  "dokumenter",
  "samtykke",
  "protokoller",
  "protokolldetalj",
  "turneringer",
  "ny-turnering",
  "referanse",
  "tilgang",
  "inviter",
  "apparatet",
  "iup",
  "maltavle",
  "prosessmal",
  "live",
  "samtykke-reise",
  "iup-kart",
  "iup-samtale",
  "testreise",
  "utviklingssjekk",
];

test("alle TN-skjermer har 1440- eller 390-fasit", () => {
  const files = new Set(readdirSync(DIR));
  for (const id of MUST) {
    const ok = files.has(`${id}.html`) || files.has(`${id}-390.html`);
    assert.equal(ok, true, `mangler fasit for ${id}`);
  }
});

test("suksess-artboard hydreres uten sc-for og med Øyvind der navn skal inn", () => {
  const files = new Set(readdirSync(DIR));
  for (const id of MUST) {
    const name = files.has(`${id}.html`) ? `${id}.html` : `${id}-390.html`;
    const src = readFileSync(join(DIR, name), "utf8");
    const out = hydrate(src, dataFor(id));
    assert.equal(out.includes("<sc-for"), false, `${id} har sc-for igjen`);
    assert.equal(/\{\{[^{}]+\}\}/.test(out), false, `${id} har {{ }} igjen`);
  }
});

test("frameCandidates prioriterer 390 for spiller", () => {
  const keys = frameCandidates("samling", { mobile: true, tilstand: "suksess" });
  assert.equal(keys[0], "samling-390.html");
  assert.equal(keys.at(-1), "samling.html");
});

test("frameCandidates: tom/laster/feil før suksess", () => {
  assert.deepEqual(frameCandidates("oversikt", { mobile: true, tilstand: "tom" }), [
    "oversikt-390-tom.html",
    "oversikt-390.html",
    "oversikt-tom.html",
    "oversikt.html",
  ]);
  assert.deepEqual(frameCandidates("oversikt", { mobile: false, tilstand: "feil" }), [
    "oversikt-feil.html",
    "oversikt.html",
  ]);
});

test("390-fasit er ekte skjerm, ikke SUKSESS-etikett", () => {
  const files = readdirSync(DIR).filter((n) => n.endsWith("-390.html"));
  assert.ok(files.length >= 10);
  for (const name of files) {
    const src = readFileSync(join(DIR, name), "utf8");
    assert.ok(src.length > 800, `${name} er for kort (${src.length})`);
    assert.equal(/^<div[^>]*>SUKSESS<\/div>\s*$/.test(src.trim()), false, name);
  }
});
