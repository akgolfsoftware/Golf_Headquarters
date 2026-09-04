import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

// Testene kjøres fra repo-roten (npm test) — tsx laster fila som CJS, så import.meta.dirname finnes ikke.
const ROT = process.cwd();
const les = (p: string) => readFileSync(path.join(ROT, p), "utf8");

describe("ak-golf.css — masterens tokens inn på markedsflaten", () => {
  it("importerer token-filene i masterens rekkefølge, uten fonter/semantikk/grunnlag", () => {
    const css = les("src/styles/ak-golf.css");
    const imports = [...css.matchAll(/@import\s+"([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(imports, [
      "../../designsystem/ak-golf/tokens/farge.css",
      "../../designsystem/ak-golf/tokens/type.css",
      "../../designsystem/ak-golf/tokens/rom.css",
      "../../designsystem/ak-golf/tokens/bevegelse.css",
      "../../designsystem/ak-golf/tokens/instrument.css",
      "../../designsystem/ak-golf/tokens/samspill.css",
      "./ak-golf-grunnlag.css",
    ]);
  });

  it("kopierer ingen hex-verdi inn i src — tokens leses fra masteren", () => {
    const css = les("src/styles/ak-golf.css");
    assert.equal(/#[0-9a-fA-F]{6}\b/.test(css), false);
  });

  it("scopet grunnlag rører aldri body, html eller :root", () => {
    const g = les("src/styles/ak-golf-grunnlag.css");
    assert.equal(/^\s*(body|html|:root)\s*\{/m.test(g), false);
    assert.match(g, /\.ak-marked\s*\{/);
  });
});
