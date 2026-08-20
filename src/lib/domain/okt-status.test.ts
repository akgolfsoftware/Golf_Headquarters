import { test } from "node:test";
import assert from "node:assert/strict";

import {
  gyldigStjerne,
  sumEtterlevelse,
  tellerIEtterlevelse,
  vurderingSnitt,
  type OktTelling,
} from "@/lib/domain/okt-status";

function okt(
  status: OktTelling["status"],
  avbruddAarsak: OktTelling["avbruddAarsak"] = null,
): OktTelling {
  return { status, avbruddAarsak };
}

test("avlyst økt telles aldri som avvik", () => {
  assert.equal(tellerIEtterlevelse(okt("CANCELLED", "SYK")), false);
  assert.equal(tellerIEtterlevelse(okt("CANCELLED")), false);
  assert.equal(tellerIEtterlevelse(okt("COMPLETED")), true);
});

test("hoppet over MED årsak holdes utenfor, UTEN årsak er et ekte avvik", () => {
  assert.equal(tellerIEtterlevelse(okt("SKIPPED", "SKADE")), false);
  assert.equal(tellerIEtterlevelse(okt("SKIPPED")), true);
});

test("en sykeuke gir ikke 0 % gjennomført", () => {
  // Fire økter planlagt, alle avlyst med årsak — ingenting å måle mot.
  const sykeuke = sumEtterlevelse([
    okt("CANCELLED", "SYK"),
    okt("CANCELLED", "SYK"),
    okt("CANCELLED", "SYK"),
    okt("CANCELLED", "SYK"),
  ]);
  assert.equal(sykeuke.andel, null);
  assert.equal(sykeuke.planlagt, 0);
  assert.equal(sykeuke.medAarsak, 4);
});

test("etterlevelsen summerer gjennomført mot det som faktisk telte", () => {
  const sum = sumEtterlevelse([
    okt("COMPLETED"),
    okt("COMPLETED"),
    okt("SKIPPED"),
    okt("CANCELLED", "VAER"),
    okt("PLANNED"),
  ]);
  assert.equal(sum.planlagt, 4);
  assert.equal(sum.gjennomfort, 2);
  assert.equal(sum.utenAarsak, 1);
  assert.equal(sum.medAarsak, 1);
  assert.equal(sum.andel, 0.5);
});

test("vurderingssnittet følges alltid av svarandelen", () => {
  const v = vurderingSnitt(
    [
      { fokus: 5, gjennomforing: null, mestring: 4 },
      { fokus: 4, gjennomforing: null, mestring: null },
      { fokus: null, gjennomforing: null, mestring: null },
      { fokus: null, gjennomforing: null, mestring: null },
    ],
    "fokus",
  );
  assert.equal(v.snitt, 4.5);
  assert.equal(v.antallSvar, 2);
  assert.equal(v.antallOkter, 4);
  assert.equal(v.svarandel, 0.5);
});

test("tomt er tomt — aldri 3", () => {
  const v = vurderingSnitt(
    [{ fokus: null, gjennomforing: null, mestring: null }],
    "gjennomforing",
  );
  assert.equal(v.snitt, null);
  assert.equal(v.svarandel, 0);
});

test("stjerner utenfor 1–5 forkastes fremfor å klippes", () => {
  assert.equal(gyldigStjerne(1), 1);
  assert.equal(gyldigStjerne(5), 5);
  assert.equal(gyldigStjerne(0), null);
  assert.equal(gyldigStjerne(6), null);
  assert.equal(gyldigStjerne(3.5), null);
  assert.equal(gyldigStjerne("4"), null);
  assert.equal(gyldigStjerne(null), null);
});
