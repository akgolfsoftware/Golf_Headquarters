import { test } from "node:test";
import assert from "node:assert/strict";
import { signerDeltaker2Lenke, lesDeltaker2Lenke } from "./deltaker2-lenke";
import { signerGjestLenke, lesGjestLenke } from "./gjest-lenke";

const nokkel = Buffer.from("x".repeat(32));
const start = new Date("2099-01-10T10:00:00.000Z");
const naa = new Date("2098-01-01T00:00:00.000Z");

test("deltaker 2-lenke kan leses tilbake", () => {
  const t = signerDeltaker2Lenke("b1", start, nokkel)!;
  const d = lesDeltaker2Lenke(t, naa, nokkel);
  assert.equal(d?.bookingId, "b1");
  assert.equal(d?.startAt.getTime(), start.getTime());
});

test("deltaker 2-lenke kan ikke brukes som gjestelenke (avbestille/flytte/refundere)", () => {
  const t = signerDeltaker2Lenke("b1", start, nokkel)!;
  assert.equal(lesGjestLenke(t, naa, nokkel), null);
});

test("gjestelenken kan ikke brukes som deltaker 2-lenke", () => {
  const t = signerGjestLenke("b1", start, nokkel)!;
  assert.equal(lesDeltaker2Lenke(t, naa, nokkel), null);
});

test("endret signatur og utløpt lenke avvises", () => {
  const t = signerDeltaker2Lenke("b1", start, nokkel)!;
  assert.equal(lesDeltaker2Lenke(t.slice(0, -2) + "xx", naa, nokkel), null);
  assert.equal(lesDeltaker2Lenke(t, new Date("2100-01-01T00:00:00Z"), nokkel), null);
  assert.equal(lesDeltaker2Lenke(t, naa, null), null);
});
