import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ukeOversikt } from "./uke-oversikt";
import type { AG06Booking } from "./data";

const DAG = 86_400_000;
const NAA = Date.UTC(2026, 9, 20, 10, 0);
const b = (dagerFram: number, pay: AG06Booking["pay"], st: AG06Booking["st"] = "Bekreftet") => ({ startMs: NAA + dagerFram * DAG, pay, st, ukedag: "tir" }) as AG06Booking;

describe("ukeOversikt (AG-06 Booking, designløftet 20.10)", () => {
  it("teller bookinger per dag de neste sju dagene, uten avlyste", () => {
    const u = ukeOversikt([b(0, "Betalt"), b(0, "Klipp"), b(2, "Faktura"), b(3, "Betalt", "Avlyst"), b(9, "Betalt")], NAA);
    assert.deepEqual(u.dager.map((d) => d.antall), [2, 0, 1, 0, 0, 0, 0]);
    assert.equal(u.totalt, 3);
  });
  it("fordeler på betalingsmåte i fast rekkefølge, Betalt heter Stripe", () => {
    const u = ukeOversikt([b(1, "Gratis"), b(1, "Betalt"), b(2, "Betalt"), b(2, "Klipp")], NAA);
    assert.deepEqual(u.betaling, [{ navn: "Stripe", antall: 2 }, { navn: "Klipp", antall: 1 }, { navn: "Gratis", antall: 1 }]);
  });
  it("ingen bookinger gir tom fordeling", () => {
    const u = ukeOversikt([], NAA);
    assert.equal(u.totalt, 0);
    assert.deepEqual(u.betaling, []);
  });
});
