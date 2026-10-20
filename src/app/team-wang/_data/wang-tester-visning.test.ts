import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { PRIORITERTE_ANTALL_FOR_TEST, TESTBATTERI, hoererTil, skoleaarStart } from "./wang-tester-visning";

describe("testbatteriet", () => {
  it("har 19 tester: 8 golfslag, 6 teknikk og 5 fysiske", () => {
    assert.equal(TESTBATTERI.length, 19);
    assert.equal(TESTBATTERI.filter((t) => t.del === "golfslag").length, 8);
    assert.equal(TESTBATTERI.filter((t) => t.del === "teknikk").length, 6);
    assert.equal(TESTBATTERI.filter((t) => t.del === "fysisk").length, 5);
  });

  it("har de fem prioriterte med minste antall fra Team Norway", () => {
    assert.deepEqual(PRIORITERTE_ANTALL_FOR_TEST, {
      "Driver Basic": 1,
      "Inspill Basic": 2,
      "Wedge Variation": 2,
      "8-balls variation": 2,
      "Putt 1–3 m": 4,
    });
  });

  it("lar treneren føre PEI- og teknikktestene, og eleven resten", () => {
    const eleven = TESTBATTERI.filter((t) => !t.trenerForer).map((t) => t.navn);
    assert.deepEqual(eleven, ["Putt 1–3 m", "9 hull lengde", "Benkpress", "Markløft trapbar", "Lengdehopp", "Rotasjonskast", "Club Speed"]);
  });
});

describe("hoererTil", () => {
  it("kjenner testene på navnene de har i basen", () => {
    assert.equal(hoererTil({ testNavn: "Inspill Basis" }, "Inspill Basic"), true);
    assert.equal(hoererTil({ testNavn: "8-ball Variation" }, "8-balls variation"), true);
    assert.equal(hoererTil({ testNavn: "TN Driver Gate" }, "Driver Gate"), true);
    assert.equal(hoererTil({ testNavn: "Putt 1-3m" }, "Putt 1–3 m"), true);
  });

  it("blander ikke Putt Speed 3x3 med Putt Speed 1 × 5", () => {
    assert.equal(hoererTil({ testNavn: "Putt Speed 3x3" }, "Putt Speed 1 × 5"), false);
    assert.equal(hoererTil({ testNavn: "Putt Speed 1x5" }, "Putt Speed 1 × 5"), true);
  });
});

describe("skoleaarStart", () => {
  it("starter skoleåret 1. august", () => {
    assert.equal(skoleaarStart("2026-10-20"), "2026-08-01");
    assert.equal(skoleaarStart("2027-03-02"), "2026-08-01");
    assert.equal(skoleaarStart("2026-07-31"), "2025-08-01");
  });
});
