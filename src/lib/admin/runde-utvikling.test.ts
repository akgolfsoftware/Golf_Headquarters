import assert from "node:assert/strict";
import { test } from "node:test";
import { bygUtvikling } from "./runde-utvikling";

const r = (dato: string, brutto: number, hull: number | null = 18) => ({ dato, brutto, hull });

test("snur til eldst først og regner endring", () => {
  const u = bygUtvikling([r("17.10.2026", 72), r("13.10.2026", 74), r("08.10.2026", 79)]);
  assert.ok(u);
  assert.deepEqual(u.punkter.map((p) => p.brutto), [79, 74, 72]);
  assert.equal(u.forste, 79);
  assert.equal(u.siste, 72);
  assert.equal(u.endring, -7);
  assert.equal(u.beste, 72);
  assert.equal(u.punkter[0].kort, "08.10");
});

test("ni hull teller ikke, og telles som utelatt", () => {
  const u = bygUtvikling([r("17.10.2026", 38, 9), r("13.10.2026", 74), r("08.10.2026", 75), r("01.10.2026", 76, null)]);
  assert.ok(u);
  assert.equal(u.utelatt, 1);
  assert.equal(u.punkter.length, 3);
});

test("under tre tellende runder gir ingen diagram", () => {
  assert.equal(bygUtvikling([r("17.10.2026", 72), r("13.10.2026", 74)]), null);
  assert.equal(bygUtvikling([]), null);
});
