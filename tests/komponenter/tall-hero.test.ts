/**
 * TallHero viser målt tall direkte — ingen opptelling fra 0 (STEG 19.7, Anders 03.09.2026,
 * `.claude/rules/beslutninger.md` §KONTRAST-REGEL I STEDET FOR NY FASIT + TALLHERO SLUTTER Å TELLE).
 *
 * Ligger utenfor `src/` med vilje: `npm test` kjører med `--conditions=react-server`, og der er
 * `react-dom/server` ikke tilgjengelig. Kjøres av `npm run test:komponenter` (uten den betingelsen).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { TallHero } from "@/components/v2/core";

function render(value: number | string | null): string {
  return renderToStaticMarkup(createElement(TallHero, { label: "Snitt", value, unit: "slag" }));
}

test("TallHero viser 42 fra første ramme, ikke 0", () => {
  const html = render(42);
  assert.ok(html.includes(">42<"), `forventet >42< i: ${html}`);
  assert.ok(!html.includes(">0<"), `fant tellingens startverdi 0 i: ${html}`);
});

test("TallHero beholder komma-desimal og fortegn fra streng-verdi", () => {
  assert.ok(render("+2,1").includes(">+2,1<"));
  assert.ok(render("-1.5").includes(">−1,5<"));
});

test("TallHero viser em-dash for tom verdi", () => {
  assert.ok(render(null).includes(">—<"));
});
