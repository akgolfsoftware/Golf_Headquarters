import assert from "node:assert/strict";
import { test } from "node:test";
import { hydrate, stripChrome } from "./hydrate.ts";

test("stripper 232-rail og 1440-ramme", () => {
  const html = `<div style="width:1440px;height:900px;background:var(--surface-page);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);overflow:hidden;display:flex;"><div style="width:232px;flex-shrink:0;">rail</div><div>innhold</div></div>`;
  const out = stripChrome(html);
  assert.equal(out.includes("width:232px"), false);
  assert.equal(out.includes("rail"), false);
  assert.equal(out.includes("innhold"), true);
  assert.equal(out.includes("width:1440px"), false);
  assert.equal(out.includes("box-shadow:var(--shadow-lg)"), false);
});

test("stripper iPhone-klokke og falsk tab-bar", () => {
  const html = `<div style="width:390px;height:844px;background:var(--surface-page);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden;display:flex;flex-direction:column;"><div style="height:44px;flex-shrink:0;background:var(--surface-card);display:flex;align-items:flex-end;padding:0 20px 4px"><span>09.41</span></div><div>DEKNINGSGRAD</div><div style="height:76px;flex-shrink:0;background:var(--surface-card);border-top:1px solid var(--border-subtle);display:flex;align-items:flex-start;padding:8px 8px 0">tabs</div></div>`;
  const out = stripChrome(html);
  assert.equal(out.includes("09.41"), false);
  assert.equal(out.includes("tabs"), false);
  assert.equal(out.includes("DEKNINGSGRAD"), true);
  assert.equal(out.includes("width:390px"), false);
});

test("sc-for interpolerer liste", () => {
  const html = `<sc-for list="{{ poster }}" as="p"><b>{{ p.tittel }}</b></sc-for>`;
  const out = hydrate(html, { poster: [{ tittel: "Uttak" }, { tittel: "Reise" }] });
  assert.equal(out.includes("Uttak"), true);
  assert.equal(out.includes("Reise"), true);
  assert.equal(out.includes("sc-for"), false);
});

test("sc-if skiller overskrift og punkt i meny", () => {
  const html = `<sc-for list="{{ meny }}" as="m"><sc-if value="{{ m.isHeading }}">H:{{ m.label }}</sc-if><sc-if value="{{ m.isItem }}">I:{{ m.label }}</sc-if></sc-for>`;
  const out = hydrate(html, {
    meny: [
      { isHeading: true, isItem: false, label: "Daglig" },
      { isHeading: false, isItem: true, label: "Oversikt" },
    ],
  });
  assert.equal(out.includes("H:Daglig"), true);
  assert.equal(out.includes("I:Oversikt"), true);
  assert.equal(out.includes("H:Oversikt"), false);
  assert.equal(out.includes("I:Daglig"), false);
});

test("bytter prototypnavn til Øyvind Royan", () => {
  const out = hydrate(`<p>Emma Hovden · Marit Hovden</p>`, {});
  assert.equal(out.includes("Øyvind Royan"), true);
  assert.equal(out.includes("Kari Royan"), true);
  assert.equal(out.includes("Emma"), false);
});

test("nøstet sc-for bruker barnets liste", () => {
  const html = `<sc-for list="{{ dager }}" as="d"><h>{{ d.dag }}</h><sc-for list="{{ d.okter }}" as="o">{{ o.navn }}</sc-for></sc-for>`;
  const out = hydrate(html, {
    dager: [{ dag: "Fredag", okter: [{ navn: "Range" }, { navn: "Bane" }] }],
  });
  assert.equal(out.includes("<sc-for"), false);
  assert.equal(out.includes("Fredag"), true);
  assert.equal(out.includes("Range"), true);
  assert.equal(out.includes("Bane"), true);
});

test("skriver om logo og fjerner tom sc-if", () => {
  const html = `<img src="../../assets/logo/team-norway-golf.png"><sc-if value="{{ mangler }}" hint-placeholder-val="">HEMMELIG</sc-if>synlig`;
  const out = hydrate(html, {});
  assert.ok(out.includes("/tn/team-norway-golf.png"));
  assert.equal(out.includes("HEMMELIG"), false);
  assert.equal(out.includes("<sc-if"), false);
  assert.ok(out.includes("synlig"));
});

test("språk: elev/session/kortspill", () => {
  const out = hydrate(`<p>Elev session kortspill</p>`, {});
  assert.equal(out.includes("elev"), false);
  assert.equal(out.includes("session"), false);
  assert.equal(out.includes("kortspill"), false);
  assert.match(out, /spiller/i);
  assert.ok(out.includes("økt"));
  assert.ok(out.includes("nærspill"));
});
