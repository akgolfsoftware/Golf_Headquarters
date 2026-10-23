import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

// Full bredde og bevegelse (planen tn-designloft 22.10, steg 8 og 9; beslutninger.md §DESKTOP-SKJERMER BRUKER FULL BREDDE).

const les = (sti: string) => readFileSync(new URL(sti, import.meta.url), "utf8");

test("kortene (TnFlate og TnKort) glir inn ved første visning", () => {
  assert.ok(les("./tn-flate.tsx").includes("className={b.innkomst}"));
  assert.ok(les("./core.tsx").includes("className={bevegelse.innkomst}"));
});

test("alt står stille med «reduser bevegelse»", () => {
  const css = les("./tn-bevegelse.module.css");
  assert.match(css, /@media \(prefers-reduced-motion: reduce\) \{ \.innkomst \{ animation: none; \} \}/);
});

test("skjermene har ingen maxWidth utenom løpende tekst og felt", () => {
  const mappe = new URL("./skjermer/", import.meta.url);
  const brudd: string[] = [];
  for (const f of readdirSync(mappe).filter((f) => f.endsWith(".tsx"))) {
    for (const m of readFileSync(new URL(f, mappe), "utf8").matchAll(/maxWidth:\s*("[^"]*"|\d+)/g)) {
      // Løpende tekst begrenses i tegn (ch); felt får aldri bli bredere enn beholderen (100%).
      if (!/ch"$|"100%"/.test(m[1]!)) brudd.push(`${f}: ${m[0]}`);
    }
  }
  assert.deepEqual(brudd, []);
});

test("innholdet i skallet har ikke tak på bredden", () => {
  assert.match(les("../../styles/team-norway-tokens.css"), /--tn-max-content: none;/);
});
