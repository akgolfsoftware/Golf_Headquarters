import { test } from "node:test";
import assert from "node:assert/strict";
import {
  detectLiveArtefaktKind,
  liveArtefaktShots,
  peiTillMalNokkel,
  peiMalAvstandNokkel,
  harMissSideFelt,
  parseGateMaal,
  gateMaalFraProtokoll,
  peiStartMalAvstand,
  tomtGateForsok,
  gateOkTeller,
  gateBomTeller,
  gateNesteIndeks,
  gateErFerdig,
  gateForrigeOkFraScore,
  peiForForsok,
  snittPei,
  formatPei,
  tomtPeiForsok,
  peiNesteIndeks,
} from "../domain/tester-live";

const puttGate = {
  scoringMode: "hit-rate",
  steps: [
    {
      id: "gate-10",
      label: "10 putter",
      shots: 10,
      target: "≥ 8 / 10",
      inputFields: [
        { key: "ok", label: "Gjennom gate", type: "checkbox" },
        { key: "miss_side", label: "Miss-retning", type: "select", options: ["—", "Venstre", "Høyre"] },
      ],
    },
  ],
};

const driverGate = {
  scoringMode: "hit-rate",
  steps: [
    {
      id: "gate-6",
      label: "6 driver-slag",
      shots: 6,
      target: "≥ 4 av 6 innenfor",
      inputFields: [{ key: "ok", label: "Innenfor gate", type: "checkbox" }],
    },
  ],
};

const inspillBasic = {
  scoringMode: "pei",
  steps: [
    {
      id: "inspill-10",
      label: "10 inspill",
      shots: 10,
      target: "PEI 100-150m < 0.06, 150-200m < 0.06",
      inputFields: [
        { key: "shot_distance_m", label: "Slagavstand", type: "number", unit: "m" },
        { key: "till_hull_m", label: "Avstand til hull etter slag", type: "number", unit: "m" },
      ],
    },
  ],
};

const driverBasic = {
  scoringMode: "pei",
  steps: [
    {
      id: "drive-5",
      label: "5 driver-slag",
      shots: 5,
      target: "PEI < 0.06",
      inputFields: [
        { key: "carry_m", label: "Carry", type: "number", unit: "m" },
        { key: "total_m", label: "Total", type: "number", unit: "m" },
        { key: "side_m", label: "Sideavvik", type: "number", unit: "m" },
      ],
    },
  ],
};

test("detectLiveArtefaktKind: Putt Gate → gate, med miss_side", () => {
  assert.equal(detectLiveArtefaktKind(puttGate), "gate");
  assert.equal(harMissSideFelt(puttGate), true);
  assert.equal(liveArtefaktShots(puttGate), 10);
});

test("detectLiveArtefaktKind: Driver Gate → gate, uten miss_side", () => {
  assert.equal(detectLiveArtefaktKind(driverGate), "gate");
  assert.equal(harMissSideFelt(driverGate), false);
  assert.equal(liveArtefaktShots(driverGate), 6);
});

test("detectLiveArtefaktKind: Inspill Basic → pei (avstand + till-mål felt)", () => {
  assert.equal(detectLiveArtefaktKind(inspillBasic), "pei");
  assert.equal(peiTillMalNokkel(inspillBasic), "till_hull_m");
  assert.equal(peiMalAvstandNokkel(inspillBasic), "shot_distance_m");
});

test("detectLiveArtefaktKind: Driver Basic (carry+side, ingen till-mål-felt) → null (generisk)", () => {
  assert.equal(detectLiveArtefaktKind(driverBasic), null);
});

test("detectLiveArtefaktKind: ukjent/manglende protokoll → null", () => {
  assert.equal(detectLiveArtefaktKind(null), null);
  assert.equal(detectLiveArtefaktKind({}), null);
  assert.equal(detectLiveArtefaktKind({ scoringMode: "average", steps: [] }), null);
});

test("parseGateMaal: plukker tallet i target-teksten", () => {
  assert.equal(parseGateMaal("≥ 8 / 10"), 8);
  assert.equal(parseGateMaal("≥ 4 av 6 innenfor"), 4);
  assert.equal(parseGateMaal(undefined), null);
  assert.equal(parseGateMaal("ingen tall her"), null);
});

test("gateMaalFraProtokoll: leser målet fra steg-target", () => {
  assert.equal(gateMaalFraProtokoll(puttGate), 8);
  assert.equal(gateMaalFraProtokoll(driverGate), 4);
  assert.equal(gateMaalFraProtokoll(inspillBasic), null); // ikke en gate-protokoll uansett innhold i target
});

test("peiStartMalAvstand: første tall i target, fallback 100", () => {
  assert.equal(peiStartMalAvstand(inspillBasic), 100); // «PEI 100-150m < 0.06, …»
  assert.equal(peiStartMalAvstand({ scoringMode: "pei", steps: [{ shots: 1, target: "PEI < 0.06", inputFields: [{ key: "x" }] }] }), 0); // ingen ekte avstand i target → 0, ikke fabrikert 100
  assert.equal(peiStartMalAvstand({ scoringMode: "pei", steps: [{ shots: 1, inputFields: [{ key: "x" }] }] }), 100); // ingen target i det hele tatt → fallback 100
});

test("Gate-forsøk: teller, neste indeks, ferdig-sjekk", () => {
  const tomt = tomtGateForsok(4);
  assert.equal(tomt.length, 4);
  assert.equal(gateNesteIndeks(tomt, true), 0);

  const delvis = [
    { ok: true, side: null },
    { ok: false, side: "V" as const },
    { ok: null, side: null },
    { ok: null, side: null },
  ];
  assert.equal(gateOkTeller(delvis), 1);
  assert.equal(gateBomTeller(delvis), 1);
  assert.equal(gateNesteIndeks(delvis, true), 2);
  assert.equal(gateErFerdig(delvis, true), false);

  const bomVenterPaaSide = [
    { ok: true, side: null },
    { ok: false, side: null },
  ];
  // Bom uten side ennå, krevSide=true → indeksen blir stående (venter på V|H).
  assert.equal(gateNesteIndeks(bomVenterPaaSide, true), 1);
  assert.equal(gateErFerdig(bomVenterPaaSide, true), false);
  // krevSide=false (f.eks. Driver Gate uten miss_side) → ferdig uten side.
  assert.equal(gateNesteIndeks(bomVenterPaaSide, false), 2);
  assert.equal(gateErFerdig(bomVenterPaaSide, false), true);
});

test("gateForrigeOkFraScore: hit-rate-prosent tilbake til rått OK-antall", () => {
  assert.equal(gateForrigeOkFraScore(70, 10), 7);
  assert.equal(gateForrigeOkFraScore(66.67, 6), 4);
});

test("PEI: per forsøk og snitt", () => {
  assert.equal(peiForForsok({ malAvstandM: 145, tillMalM: 5.945 }), 5.945 / 145);
  assert.equal(peiForForsok({ malAvstandM: null, tillMalM: 5 }), null);
  assert.equal(peiForForsok({ malAvstandM: 0, tillMalM: 5 }), null);

  const forsok = [
    { malAvstandM: 100, tillMalM: 4 }, // 0,04
    { malAvstandM: 100, tillMalM: 6 }, // 0,06
    { malAvstandM: null, tillMalM: null }, // ikke ført ennå
  ];
  assert.equal(snittPei(forsok), 0.05);
  assert.equal(snittPei([{ malAvstandM: null, tillMalM: null }]), null);
});

test("PEI-forsøk: tomt array + neste-indeks", () => {
  const tomt = tomtPeiForsok(3);
  assert.equal(tomt.length, 3);
  assert.equal(peiNesteIndeks(tomt), 0);

  const delvis = [
    { malAvstandM: 145, tillMalM: 4 },
    { malAvstandM: null, tillMalM: null },
    { malAvstandM: null, tillMalM: null },
  ];
  assert.equal(peiNesteIndeks(delvis), 1);
});

test("formatPei: alltid to tall, komma som desimalskille", () => {
  assert.equal(formatPei(0.0426), "4,26 % · 0,04");
  assert.equal(formatPei(0.04), "4,00 % · 0,04");
});
