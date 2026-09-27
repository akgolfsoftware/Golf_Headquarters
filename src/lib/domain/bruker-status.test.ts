import { test } from "node:test";
import assert from "node:assert/strict";

import { brukerStatusOrd, brukerStatusTone } from "@/lib/domain/bruker-status";

test("PERMISJON heter Idrettsfravær på skjermen", () => {
  assert.equal(brukerStatusOrd("PERMISJON"), "Idrettsfravær");
});

test("de øvrige statusene beholder sitt eget ord", () => {
  assert.equal(brukerStatusOrd("AKTIV"), "Aktiv");
  assert.equal(brukerStatusOrd("SKADET"), "Skadet");
  assert.equal(brukerStatusOrd("INAKTIV"), "Inaktiv");
});

test("ukjent verdi vises som den er, aldri som tom eller gjettet", () => {
  assert.equal(brukerStatusOrd("NOE_NYTT"), "NOE_NYTT");
});

test("ingen status bærer rødt — rød er identitet og frist", () => {
  const toner = ["AKTIV", "PERMISJON", "SKADET", "INAKTIV", "NOE_NYTT"].map(brukerStatusTone);

  assert.deepEqual(toner, ["green", "nøytral", "amber", "nøytral", "nøytral"]);
});
