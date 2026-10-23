import assert from "node:assert/strict";
import { test } from "node:test";

import { lesTestokt, skrivTestokt, testoktUtvalg } from "./tn-testokt";

const ID = "3f1c2a7e-9b4d-4e2a-8c1f-0a1b2c3d4e5f";
const ID2 = "4f1c2a7e-9b4d-4e2a-8c1f-0a1b2c3d4e5f";

test("prioriterte tester som mangler forsøk står først, med fremdrift", () => {
  const u = testoktUtvalg(new Map([["wedge-variation", 1], ["driver-basic", 1]]), () => true);
  assert.equal(u.mangler[0]?.protokollId.startsWith("inspill-"), true);
  assert.ok(u.mangler.some((v) => v.protokollId === "wedge-variation" && v.merknad === "1 av 2"));
  assert.ok(!u.mangler.some((v) => v.protokollId.startsWith("driver-")), "Driver Basic har nådd 1 av 1");
});

test("tester spilleren fører selv er aldri med i utvalget", () => {
  const u = testoktUtvalg(new Map(), () => true);
  const alle = [...u.mangler, ...u.teknikk, ...u.golfslag].map((v) => v.protokollId);
  assert.ok(!alle.includes("putt-1-3m"));
  assert.ok(!alle.includes("9-hull-lengde"));
  assert.ok(u.spillerForer.includes("Putt 1–3 m"));
  assert.ok(u.spillerForer.includes("Club Speed"));
});

test("løpet leses fra adressen og avviser ukjente tester, trenerforbudte tester og like økt-ID-er", () => {
  const lop = [{ protokollId: "wedge-gate", sessionId: ID }, { protokollId: "driver-220", sessionId: ID2 }];
  assert.deepEqual(lesTestokt(skrivTestokt(lop)), lop);
  assert.equal(lesTestokt(`putt-1-3m:${ID}`), null);
  assert.equal(lesTestokt(`finnes-ikke:${ID}`), null);
  assert.equal(lesTestokt(`wedge-gate:${ID},driver-220:${ID}`), null);
  assert.equal(lesTestokt("wedge-gate:ikke-uuid"), null);
  assert.equal(lesTestokt(undefined), null);
});
