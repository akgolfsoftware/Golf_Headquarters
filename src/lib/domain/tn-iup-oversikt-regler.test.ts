import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { byggIupHaster, tilWagrId } from "./tn-iup-oversikt-regler";

const naa = new Date(Date.UTC(2026, 9, 22, 10));
const tom = { tester: null, avslatteForslag: null, lisens: null, helseattestUtloper: null, naa };

describe("tilWagrId", () => {
  it("godtar positive heltall og avviser resten", () => {
    assert.equal(tilWagrId("12345"), 12345);
    assert.equal(tilWagrId(" 77 "), 77);
    assert.equal(tilWagrId(null), null);
    assert.equal(tilWagrId(""), null);
    assert.equal(tilWagrId("abc"), null);
    assert.equal(tilWagrId("0"), null);
    assert.equal(tilWagrId("1.5"), null);
  });
});

describe("byggIupHaster", () => {
  it("er tom når ingenting er delt og ingenting haster", () => {
    assert.deepEqual(byggIupHaster(tom), []);
  });

  it("viser prioriterte tester under minsteantallet som «1 av 2»", () => {
    const rader = byggIupHaster({
      ...tom,
      tester: [
        { testId: "tn-v3-wedge-variation", protokollNavn: "Wedge Variation", antall: 1 },
        { testId: "tn-v3-driver-220", protokollNavn: "Driver Basic", antall: 1 },
        { testId: "tn-v3-inspill-gutter-145", protokollNavn: "Inspill Basic", antall: 2 },
        { testId: "tn-v3-8-ball-variation", protokollNavn: "8-balls variation", antall: 3 },
        { testId: "tn-v3-putt-1-3m", protokollNavn: "Putt 1–3 m", antall: 4 },
      ],
    });
    assert.deepEqual(rader, [{ tekst: "Wedge Variation: 1 av 2 tatt", merke: "Mangler 1" }]);
  });

  it("viser alle fem prioriterte når spilleren har delt, men ikke tatt noen", () => {
    assert.equal(byggIupHaster({ ...tom, tester: [] }).length, 5);
  });

  it("viser ingen tester når de ikke er delt", () => {
    assert.equal(byggIupHaster({ ...tom, tester: null }).some((r) => r.tekst.includes("tatt")), false);
  });

  it("tar med avslåtte forslag, ubetalt lisens og helseattest som går ut", () => {
    const rader = byggIupHaster({
      ...tom,
      avslatteForslag: [{ avslatt: new Date(Date.UTC(2026, 9, 19, 10)) }],
      lisens: { aar: 2026, ubetalt: true },
      helseattestUtloper: new Date(Date.UTC(2026, 10, 1, 10)),
    });
    assert.deepEqual(rader.map((r) => r.tekst), ["Forslag avslått 19.10", "Lisens 2026 er ikke betalt", "Helseattesten går ut 01.11"]);
  });

  it("melder utløpt helseattest og ignorerer en som varer lenge", () => {
    assert.deepEqual(byggIupHaster({ ...tom, helseattestUtloper: new Date(Date.UTC(2026, 9, 1)) }), [{ tekst: "Helseattesten er utløpt", merke: "Utløpt" }]);
    assert.deepEqual(byggIupHaster({ ...tom, helseattestUtloper: new Date(Date.UTC(2027, 5, 1)) }), []);
  });
});
