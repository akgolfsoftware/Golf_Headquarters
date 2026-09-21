import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  byggKvitteringLinje,
  formaterBelop,
  KVITTERING_STATUSER,
  type KvitteringRad,
} from "./kvittering";

function rad(o: Partial<KvitteringRad> = {}): KvitteringRad {
  return {
    paidAt: new Date("2026-09-18T10:00:00Z"),
    amountOre: 29900,
    amountRefundedOre: 0,
    currency: "nok",
    status: "SUCCEEDED",
    description: "PlayerHQ Pro",
    ...o,
  };
}

describe("formaterBelop", () => {
  it("skriver kroner som kr", () => {
    assert.equal(formaterBelop(29900, "nok"), "299 kr");
  });

  it("skriver andre valutaer med sin egen kode, aldri som kroner", () => {
    assert.equal(formaterBelop(29900, "eur"), "299 EUR");
    assert.equal(formaterBelop(29900, "USD"), "299 USD");
  });

  it("markerer ukjent valuta i stedet for å anta kroner", () => {
    assert.equal(formaterBelop(29900, null), "299 —");
    assert.equal(formaterBelop(29900, "  "), "299 —");
  });

  it("tar med ørene når beløpet ikke er helt", () => {
    assert.equal(formaterBelop(29950, "nok"), "299,50 kr");
  });
});

describe("byggKvitteringLinje", () => {
  it("viser dato, beløp og at den er betalt", () => {
    const l = byggKvitteringLinje(rad());
    assert.equal(l.tittel, "PlayerHQ Pro");
    assert.match(l.meta, /18\. september 2026/);
    assert.match(l.meta, /299 kr/);
    assert.match(l.meta, /Betalt/);
  });

  it("sier fra når en betaling er refundert", () => {
    const l = byggKvitteringLinje(rad({ status: "REFUNDED", amountRefundedOre: 29900 }));
    assert.match(l.meta, /Refundert/);
    assert.match(l.meta, /299 kr tilbakeført/);
  });

  it("skiller delvis refusjon fra full, og oppgir beløpet som kom tilbake", () => {
    const l = byggKvitteringLinje(
      rad({ status: "PARTIALLY_REFUNDED", amountRefundedOre: 15000 }),
    );
    assert.match(l.meta, /Delvis refundert/);
    assert.match(l.meta, /150 kr tilbakeført/);
    assert.match(l.meta, /299 kr/, "opprinnelig beløp skal fortsatt stå");
  });

  it("viser «—» for manglende dato i stedet for å utelate feltet", () => {
    const l = byggKvitteringLinje(rad({ paidAt: null }));
    assert.match(l.meta, /—/);
    assert.match(l.meta, /299 kr/);
  });

  it("faller tilbake til «Betaling» når beskrivelsen mangler", () => {
    assert.equal(byggKvitteringLinje(rad({ description: null })).tittel, "Betaling");
    assert.equal(byggKvitteringLinje(rad({ description: "   " })).tittel, "Betaling");
  });

  it("presenterer ikke en ukjent status som betalt", () => {
    const l = byggKvitteringLinje(rad({ status: "NOE_ANNET" }));
    assert.match(l.meta, /Status ukjent/);
    assert.ok(!l.meta.includes("Betalt"));
  });

  it("refunderte statuser hører hjemme i lista", () => {
    assert.deepEqual(
      [...KVITTERING_STATUSER].sort(),
      ["PARTIALLY_REFUNDED", "REFUNDED", "SUCCEEDED"],
      "en refundert betaling har skjedd på kortet og skal ikke forsvinne",
    );
  });
});
