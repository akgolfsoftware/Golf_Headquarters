import assert from "node:assert/strict";
import { test } from "node:test";

import { tnProtocol } from "./tn-catalog";
import { byggTestvisning } from "./tn-testvisning";

test("PEI-test: avstand fra hullet og PEI som brøk per slag, og «—» uten tall", () => {
  const p = tnProtocol("driver-220")!;
  const v = byggTestvisning(p, { "1": { carry: 214, side: 8 }, "2": { carry: null, side: null } });
  assert.equal(v.type, "pei");
  if (v.type !== "pei") return;
  assert.equal(v.slag[0]?.fraHullet, 10);
  assert.equal(v.slag[0]?.pei, 10 / 220);
  assert.equal(v.slag[1]?.fraHullet, null);
  assert.equal(v.slag[1]?.pei, null);
  assert.equal(v.slag[0]?.tm, null);
});

test("PEI-test: TrackMan-tall kommer med på koblede slag", () => {
  const p = tnProtocol("wedge-variation")!;
  const tm = { club: "PW", clubSpeed: 80, ballSpeed: 100, smashFactor: 1.25, faceToPath: -1, clubPath: 2, attackAngle: -4, spinRate: 8000 };
  const v = byggTestvisning(p, { "1": { carry: 40, side: 1 } }, new Map([[0, { tm, passerIkke: false }]]));
  assert.equal(v.type === "pei" && v.slag[0]?.tm?.clubSpeed, 80);
});

test("gate-test: port og sone per slag med poeng", () => {
  const p = tnProtocol("wedge-gate")!;
  const v = byggTestvisning(p, { "1": { ok: "I sonen" }, "2": { ok: "Gjennom porten" }, "3": { ok: "Bom" } });
  assert.equal(v.type, "gate");
  if (v.type !== "gate") return;
  assert.deepEqual(v.slag.slice(0, 3).map((s) => s.poeng), [4, 1, 0]);
  assert.equal(v.fordeling.find((f) => f.navn === "I sonen")?.antall, 1);
});

test("putt: avstandsbånd for 9 hull lengde", () => {
  const p = tnProtocol("9-hull-lengde")!;
  const v = byggTestvisning(p, { "1": { klasse: "I hull" }, "2": { klasse: "1–2 fot" }, "3": { klasse: "I hull" } });
  assert.equal(v.type, "putt");
  if (v.type !== "putt") return;
  assert.equal(v.band.find((b) => b.navn === "I hull")?.antall, 2);
});
