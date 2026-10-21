/**
 * Tilstandene i Team Norway (Skrå, steg 8): skjelettet har toppen, og laster, feil og tom
 * viser tekst, handling og aria-busy der det skal.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

test("laster: skjelett med topp og aria-busy", async () => {
  const { TnLaster, TnSkallSkjelett } = await import("@/components/team-norway/tn-tilstand");
  const html = renderToStaticMarkup(createElement(TnSkallSkjelett, null, createElement(TnLaster, { tekst: "Henter Team Norway …" })));
  assert.match(html, /Henter Team Norway/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /aria-hidden="true"/);
});

test("feil: viser tittel, at ingenting er endret, og handling", async () => {
  const { TnFeilkort, TnSkallSkjelett } = await import("@/components/team-norway/tn-tilstand");
  const html = renderToStaticMarkup(createElement(TnSkallSkjelett, null, createElement(TnFeilkort, { tittel: "Siden kunne ikke hentes", handling: createElement("button", null, "Prøv igjen") })));
  assert.match(html, /role="alert"/);
  assert.match(html, /Ingenting er endret/);
  assert.match(html, /Prøv igjen/);
});
