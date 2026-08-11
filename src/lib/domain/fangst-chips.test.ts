import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { deriveFangstChips, fangstFormelTag, type FangstFormel } from "./fangst-chips";

const FULL: FangstFormel = {
  pyramide: "TEK",
  omraade: "INNSPILL_50",
  motorikk: "LAV_HASTIGHET",
  press: "KRAV",
};

describe("deriveFangstChips", () => {
  it("full formel gir 6 chips med min. én positiv, én negativ og én kroppslig", () => {
    const chips = deriveFangstChips(FULL);
    assert.equal(chips.length, 6);
    assert.ok(chips.some((c) => c.kategori === "positiv"));
    assert.ok(chips.some((c) => c.kategori === "negativ"));
    assert.ok(chips.some((c) => c.kategori === "kroppslig"));
    assert.ok(chips.some((c) => c.tekst === "Traff ball før torv"));
    assert.ok(chips.some((c) => c.tekst === "Holdt formen i lav hastighet"));
    // KRAV → Paper OBSERVERT-teksten
    assert.ok(chips.some((c) => c.tekst === "Holdt kvaliteten mens noen så på"));
  });

  it("uten formel gir generisk sett innenfor 4–6 med alle tre kategorier", () => {
    const chips = deriveFangstChips(null);
    assert.ok(chips.length >= 4 && chips.length <= 6);
    assert.ok(chips.some((c) => c.kategori === "positiv"));
    assert.ok(chips.some((c) => c.kategori === "negativ"));
    assert.ok(chips.some((c) => c.kategori === "kroppslig"));
  });

  it("ukjent område faller tilbake til generisk sett", () => {
    const chips = deriveFangstChips({ ...FULL, omraade: "UKJENT_X" });
    assert.ok(chips.some((c) => c.tekst === "Bedre enn sist"));
  });

  it("delvis formel (kun område) gir 4 chips", () => {
    const chips = deriveFangstChips({ pyramide: null, omraade: "PUTT_3_5", motorikk: null, press: null });
    assert.equal(chips.length, 4);
    assert.ok(chips.some((c) => c.tekst === "Startlinjen traff"));
  });
});

describe("fangstFormelTag", () => {
  it("bygger tag av leddene som finnes", () => {
    assert.equal(fangstFormelTag(FULL), "TEK_INNSPILL_50_LAV_HASTIGHET_KRAV");
    assert.equal(fangstFormelTag({ pyramide: "TEK", omraade: null, motorikk: null, press: null }), "TEK");
    assert.equal(fangstFormelTag(null), null);
  });
});
