/**
 * Bevegelse i Team Norway-skallet (Skrå-drakten): Mer-arket glir inn og ut samme vei, menygruppene
 * glir inn når de åpnes, og alt følger «reduser bevegelse».
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../../src/components/team-norway/tn-skall.module.css", import.meta.url), "utf8");
const rail = readFileSync(new URL("../../src/components/team-norway/rail-mobil.tsx", import.meta.url), "utf8");

test("Mer-arket glir inn og ut samme vei", () => {
  const inn = css.match(/@keyframes arkInn \{ from \{ ([^}]+) \} \}/)?.[1];
  const ut = css.match(/@keyframes arkUt \{ to \{ ([^}]+) \} \}/)?.[1];
  assert.ok(inn && ut);
  assert.equal(inn, ut, "arket skal forsvinne samme vei som det kom");
  assert.match(css, /\.ark\[data-tilstand="lukker"\] \{ animation: arkUt/);
});

test("reduser bevegelse slår av arket og menygruppene, og arket lukkes straks", () => {
  const redusert = [...css.matchAll(/@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/g)].map((m) => m[1]).join("\n");
  assert.match(redusert, /\.ark, \.ark\[data-tilstand="lukker"\] \{ animation: none; \}/);
  assert.match(redusert, /\.menygruppe\[open\] > \.gruppePunkter \{ animation: none; \}/);
  assert.match(rail, /matchMedia\("\(prefers-reduced-motion: reduce\)"\)/);
  assert.match(rail, /setArk\(redusert \? "lukket" : "lukker"\)/);
});
