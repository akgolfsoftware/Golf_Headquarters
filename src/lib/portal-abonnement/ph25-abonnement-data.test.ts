import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  beregnArligBesparelse,
  formaterKroner,
  PH25_PLANER,
  PH25_STANDARD_DATA,
  PH25_TOM_DATA,
} from "./ph25-abonnement-data";

describe("ph25-abonnement-data", () => {
  it("formaterer beløp i kroner med mellomrom som tusenskille uten .toFixed", () => {
    assert.equal(formaterKroner(null), "—");
    assert.equal(formaterKroner(undefined), "—");
    assert.equal(formaterKroner(0), "0 kr");
    assert.equal(formaterKroner(299), "299 kr");
    assert.equal(formaterKroner(2690), "2 690 kr");
    assert.equal(formaterKroner(12500), "12 500 kr");
  });

  it("beregner årlig besparelse korrekt for Full-planen", () => {
    const full = PH25_PLANER.find((p) => p.id === "FULL");
    assert.ok(full);
    const besparelse = beregnArligBesparelse(full.prisMnd, full.prisAr);
    // 299 * 12 = 3588; 3588 - 2690 = 898 kr
    assert.equal(besparelse, 898);
  });

  it("definerer både Gratis og Full med riktige features fra Claude Design", () => {
    assert.equal(PH25_PLANER.length, 2);
    const [gratis, full] = PH25_PLANER;
    assert.equal(gratis.id, "TALENT");
    assert.equal(gratis.navn, "Gratis");
    assert.equal(gratis.prisMnd, 0);
    assert.ok(gratis.features.includes("Åpent testbatteri"));
    assert.ok(gratis.features.includes("Booking av enkelttimer"));

    assert.equal(full.id, "FULL");
    assert.equal(full.navn, "Full");
    assert.equal(full.prisMnd, 299);
    assert.equal(full.prisAr, 2690);
    assert.ok(full.features.includes("Alt i Gratis"));
    assert.ok(full.features.includes("Caddie"));
  });

  it("leverer standard- og tomtilstandsdata med alle påkrevde felter", () => {
    assert.equal(PH25_STANDARD_DATA.current.plan, "FULL");
    assert.equal(PH25_STANDARD_DATA.card?.brand, "Visa");
    assert.ok(PH25_STANDARD_DATA.invoices.length > 0);
    assert.equal(PH25_STANDARD_DATA.samtykker.coach, true);
    assert.equal(PH25_STANDARD_DATA.varsler.plan, true);

    assert.equal(PH25_TOM_DATA.current.plan, "TALENT");
    assert.equal(PH25_TOM_DATA.card, null);
    assert.equal(PH25_TOM_DATA.invoices.length, 0);
  });
});
