import assert from "node:assert/strict";
import { test } from "node:test";
import { vurderDuoDeltaker } from "./duo-deltaker";

const duo = { kategori: "duo", name: "Flex Duo 50 min" };
const flex = { kategori: "drop-in", name: "Flex 50 min" };

test("duo krever navn og en gyldig, annen e-post for deltaker 2", () => {
  assert.deepEqual(vurderDuoDeltaker(duo, { email: "kari@ex.no", partnerName: " Ola Nordmann ", partnerEmail: " Ola@Ex.no " }),
    { ok: true, partner: { name: "Ola Nordmann", email: "ola@ex.no" } });
  assert.equal(vurderDuoDeltaker(duo, { email: "kari@ex.no", partnerEmail: "ola@ex.no" }).ok, false);
  assert.equal(vurderDuoDeltaker(duo, { email: "kari@ex.no", partnerName: "Ola", partnerEmail: "ikke-epost" }).ok, false);
  assert.equal(vurderDuoDeltaker(duo, { email: "kari@ex.no", partnerName: "Ola", partnerEmail: "KARI@ex.no" }).ok, false);
});

test("andre tjenester lagrer aldri deltaker 2, selv om feltene er sendt med", () => {
  assert.deepEqual(vurderDuoDeltaker(flex, { email: "kari@ex.no", partnerName: "Ola", partnerEmail: "ola@ex.no" }),
    { ok: true, partner: null });
});
