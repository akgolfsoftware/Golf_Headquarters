import test from "node:test";
import assert from "node:assert/strict";
import { feilloggKuttdato, FEILLOGG_RETENSJON_DAGER } from "./slett-gamle-feillogger";

test("feilloggKuttdato ligger nøyaktig 90 dager bak", () => {
  const naa = new Date("2026-08-02T12:00:00.000Z");
  const kutt = feilloggKuttdato(naa);
  const dager = (naa.getTime() - kutt.getTime()) / (24 * 60 * 60 * 1000);
  assert.equal(dager, FEILLOGG_RETENSJON_DAGER);
  assert.equal(kutt.toISOString(), "2026-05-04T12:00:00.000Z");
});
