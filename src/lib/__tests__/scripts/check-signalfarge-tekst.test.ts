import test from "node:test";
import assert from "node:assert/strict";
import { tellSignalfarge, finnBrudd, parseNameStatus } from "../../../../scripts/check-signalfarge-tekst.mjs";

test("teller color: TL.<signal> i alle skrivemåter, men ikke kant/flate", () => {
  assert.equal(tellSignalfarge("style={{ color: TL.danger }}"), 1);
  assert.equal(tellSignalfarge("color:TL.ok"), 1);
  assert.equal(tellSignalfarge("color:   TL.warn"), 1);
  assert.equal(tellSignalfarge("color: TL.viz.target"), 1);
  assert.equal(tellSignalfarge("borderColor: TL.danger, backgroundColor: TL.ok"), 0);
  assert.equal(tellSignalfarge("color: TL.warnHair"), 0);
  assert.equal(tellSignalfarge("color: TL.text, color: TL.mute"), 0);
  assert.equal(tellSignalfarge("color: TL.danger\ncolor: TL.ok\ncolor: TL.warn"), 3);
});

test("brudd = fila har fått flere enn på origin/main", () => {
  const par = [
    { sti: "a.tsx", head: 2, base: 1 },
    { sti: "b.tsx", head: 1, base: 1 },
    { sti: "c.tsx", head: 0, base: 3 },
    { sti: "ny.tsx", head: 1, base: 0 },
  ];
  assert.deepEqual(finnBrudd(par).map((b) => b.sti), ["a.tsx", "ny.tsx"]);
});

test("parseNameStatus: én sti per rad, to for rename", () => {
  const ut = "M\0src/a.tsx\0R100\0src/gammel.tsx\0src/ny.tsx\0D\0src/borte.tsx\0";
  assert.deepEqual(parseNameStatus(ut), [
    { status: "M", gammel: null, ny: "src/a.tsx" },
    { status: "R", gammel: "src/gammel.tsx", ny: "src/ny.tsx" },
    { status: "D", gammel: null, ny: "src/borte.tsx" },
  ]);
  assert.deepEqual(parseNameStatus(""), []);
});
