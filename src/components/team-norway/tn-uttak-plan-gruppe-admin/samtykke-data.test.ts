import test from "node:test";
import assert from "node:assert/strict";

import type { DelingSamtykkeRad } from "@/lib/deling/samtykke-regler";
import { delingGruppe, lesDelingFilter, vurderDeling } from "./samtykke-data";

const G = "tn";
const rad = (dag: number, gitt: boolean, gittAvRolle: "SELV" | "FORESATT" = "SELV", scope = "TEST_RESULTATER", mottakerGruppeId = G): DelingSamtykkeRad => ({
  scope, mottakerGruppeId, gitt, gittAvRolle, createdAt: new Date(Date.UTC(2026, 8, dag)),
});

test("ingen rader gir ikke delt", () => {
  const v = vurderDeling([], G, false);
  assert.equal(v.status, "IKKE_DELT");
  assert.equal(v.dato, null);
});

test("voksen som har delt tester og statistikk", () => {
  const v = vurderDeling([rad(1, true), rad(2, true, "SELV", "STATS")], G, false);
  assert.equal(v.status, "DELT");
  assert.deepEqual(v.scopes, ["TEST_RESULTATER", "STATS"]);
  assert.equal(v.dato?.getUTCDate(), 2);
});

test("samtykke mot en annen gruppe teller ikke", () => {
  assert.equal(vurderDeling([rad(1, true, "SELV", "TEST_RESULTATER", "wang")], G, false).status, "IKKE_DELT");
});

test("trukket deling vises som trukket, ikke som delt", () => {
  const v = vurderDeling([rad(1, true), rad(5, false)], G, false);
  assert.equal(v.status, "TRUKKET");
  assert.equal(v.dato?.getUTCDate(), 5);
});

test("mindreårig med bare eget ja venter på forelder", () => {
  assert.equal(vurderDeling([rad(3, true)], G, true).status, "VENTER_FORELDER");
});

test("mindreårig med foresattes ja er delt og merket", () => {
  const v = vurderDeling([rad(3, true), rad(4, true, "FORESATT")], G, true);
  assert.equal(v.status, "DELT");
  assert.equal(v.foresattGodkjent, true);
});

test("foresatt som trekker etter spillerens ja gir trukket", () => {
  assert.equal(vurderDeling([rad(3, true), rad(4, true, "FORESATT"), rad(6, false, "FORESATT")], G, true).status, "TRUKKET");
});

test("filter og grupper", () => {
  assert.equal(delingGruppe("TRUKKET"), "ikke");
  assert.equal(delingGruppe("VENTER_FORELDER"), "venter");
  assert.equal(lesDelingFilter("venter"), "venter");
  assert.equal(lesDelingFilter("tull"), "alle");
});
