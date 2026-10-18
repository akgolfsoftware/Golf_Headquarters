import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Låser reglene i src/styles/bevegelse.css (Anders 16.10.2026).
const css = readFileSync(join(process.cwd(), "src/styles/bevegelse.css"), "utf8").replace(
  /\/\*[\s\S]*?\*\//g,
  "",
);
const layout = readFileSync(join(process.cwd(), "src/app/layout.tsx"), "utf8");

function blokkEtter(start: number): { innhold: string; slutt: number } {
  const apen = css.indexOf("{", start);
  let dybde = 0;
  for (let i = apen; i < css.length; i++) {
    if (css[i] === "{") dybde++;
    if (css[i] === "}" && --dybde === 0) return { innhold: css.slice(apen + 1, i), slutt: i };
  }
  throw new Error("Ubalansert CSS");
}

test("bevegelse: arket lastes i rotlayouten", () => {
  assert.match(layout, /import "@\/styles\/bevegelse\.css";/);
});

test("bevegelse: all animasjon og overgang ligger bak prefers-reduced-motion: no-preference", () => {
  const start = css.indexOf("@media (prefers-reduced-motion: no-preference)");
  assert.ok(start >= 0, "mangler no-preference-blokken");
  const { slutt } = blokkEtter(start);
  const utenfor = css.slice(0, start) + css.slice(slutt + 1);
  assert.doesNotMatch(utenfor, /\banimation\s*:|\btransition\s*:|\bscale\s*:\s*var/);
});

test("bevegelse: nøkkelbildene animerer bare opacity, translate og scale", () => {
  const navn = [...css.matchAll(/@keyframes\s+([\w-]+)/g)];
  assert.ok(navn.length > 0);
  for (const treff of navn) {
    const { innhold } = blokkEtter(treff.index ?? 0);
    const egenskaper = [...innhold.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]);
    for (const e of egenskaper) {
      assert.ok(["opacity", "translate", "scale"].includes(e), `${treff[1]} animerer ${e}`);
    }
  }
});

test("bevegelse: sideskiftet flytter ikke <main> (faste bunnlinjer skal stå stille)", () => {
  const regel = css.match(/:where\(main\):where\(:not\(\.ak-marked > main\)\)\s*\{([^}]*)\}/);
  assert.ok(regel, "mangler regelen for sideskiftet");
  assert.match(regel[1], /bv-tone/);
  assert.doesNotMatch(regel[1], /bv-loft|translate|transform/);
});

test("bevegelse: markedssidene er utenfor", () => {
  const velgere = [...css.matchAll(/([^{}]+)\{[^{}]*animation\s*:/g)].map((m) => m[1]);
  for (const v of velgere) {
    if (v.includes(":nth-child")) continue;
    assert.match(v, /ak-marked/, `regelen mangler unntak for markedssidene: ${v.trim()}`);
  }
});
