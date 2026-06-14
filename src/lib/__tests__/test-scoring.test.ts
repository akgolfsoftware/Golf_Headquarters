import { test } from "node:test";
import assert from "node:assert/strict";
import {
  scoreTest,
  lavereErBedre,
  parseForScoring,
  type Forsok,
} from "../portal-tester/test-scoring";

/* Hjelper: bygg variant B-protokoll (Team Norway, `scoring`). */
function protB(scoring: string, shots: Array<{ nr: number; target?: number }>, unit = "m") {
  return { shots, inputFields: [{ key: "x", label: "x", unit }], scoring };
}

test("pei_average (nærspill, resultatM) = snitt av nærhet ÷ lengde", () => {
  const protocol = protB("pei_average", [{ nr: 1, target: 100 }, { nr: 2, target: 100 }]);
  const forsok: Forsok[] = [
    { nr: 1, verdier: { resultatM: 10 } }, // 10/100 = 0,1
    { nr: 2, verdier: { resultatM: 20 } }, // 20/100 = 0,2
  ];
  const { score, details } = scoreTest(protocol, forsok);
  assert.equal(score, 0.15);
  assert.equal(details.retning, "lavere_bedre");
  assert.equal(details.perSlag[0].pei, 0.1);
  assert.equal(details.perSlag[1].pei, 0.2);
});

test("pei_average (fullslag, carry+side) regner nærhet til hull først", () => {
  const protocol = {
    shots: [{ nr: 1, target: 200 }, { nr: 2, target: 200 }],
    inputFields: [{ key: "carry", unit: "m" }, { key: "carrySide", unit: "m" }],
    scoring: "pei_average",
  };
  const forsok: Forsok[] = [
    { nr: 1, verdier: { carry: 195, carrySide: 0 } }, // √(5²+0²)=5 → 0,025
    { nr: 2, verdier: { carry: 200, carrySide: 3 } }, // √(0²+3²)=3 → 0,015
  ];
  const { score } = scoreTest(protocol, forsok);
  assert.equal(score, 0.02);
});

test("pei_total = sum av PEI per slag", () => {
  const protocol = protB("pei_total", [{ nr: 1, target: 100 }, { nr: 2, target: 100 }]);
  const { score } = scoreTest(protocol, [
    { nr: 1, verdier: { resultatM: 10 } },
    { nr: 2, verdier: { resultatM: 20 } },
  ]);
  assert.equal(score, 0.3);
});

test("spread_stddev = standardavvik av carry", () => {
  const protocol = protB("spread_stddev", [{ nr: 1 }, { nr: 2 }, { nr: 3 }]);
  const { score } = scoreTest(protocol, [
    { nr: 1, verdier: { carry: 10 } },
    { nr: 2, verdier: { carry: 12 } },
    { nr: 3, verdier: { carry: 14 } },
  ]);
  assert.equal(score, 1.63); // √(((−2)²+0²+2²)/3) = √2,667 ≈ 1,633
});

test("carry_average = snitt carry; høyere er bedre", () => {
  const protocol = protB("carry_average", [{ nr: 1 }, { nr: 2 }]);
  const { score, details } = scoreTest(protocol, [
    { nr: 1, verdier: { carry: 245 } },
    { nr: 2, verdier: { carry: 255 } },
  ]);
  assert.equal(score, 250);
  assert.equal(details.retning, "hoyere_bedre");
});

test("distance_average = snitt avstand forbi hull", () => {
  const protocol = protB("distance_average", [{ nr: 1 }, { nr: 2 }, { nr: 3 }]);
  const { score } = scoreTest(protocol, [
    { nr: 1, verdier: { distanse: 1 } },
    { nr: 2, verdier: { distanse: 2 } },
    { nr: 3, verdier: { distanse: 3 } },
  ]);
  assert.equal(score, 2);
});

test("points_total = sum poeng", () => {
  const protocol = protB("points_total", [{ nr: 1 }, { nr: 2 }, { nr: 3 }], "poeng");
  const { score } = scoreTest(protocol, [
    { nr: 1, verdier: { poeng: 2 } },
    { nr: 2, verdier: { poeng: 1 } },
    { nr: 3, verdier: { poeng: 2 } },
  ]);
  assert.equal(score, 5);
});

test("count_ok = antall treff", () => {
  const protocol = protB("count_ok", [{ nr: 1 }, { nr: 2 }, { nr: 3 }, { nr: 4 }], "ja/nei");
  const { score } = scoreTest(protocol, [
    { nr: 1, verdier: { ok: true } },
    { nr: 2, verdier: { ok: false } },
    { nr: 3, verdier: { ok: true } },
    { nr: 4, verdier: { ok: true } },
  ]);
  assert.equal(score, 3);
});

test("hit-rate (variant A) = treff / forventet × 100", () => {
  const protocol = {
    scoringMode: "hit-rate",
    steps: [{ label: "Gate", shots: 6, inputFields: [{ key: "ok", unit: "ja/nei" }] }],
  };
  const spec = parseForScoring(protocol);
  assert.equal(spec.shots.length, 6); // steps utvides til 6 slag
  const forsok: Forsok[] = Array.from({ length: 6 }, (_, i) => ({
    nr: i + 1,
    verdier: { ok: i < 3 }, // 3 treff
  }));
  const { score } = scoreTest(protocol, forsok);
  assert.equal(score, 50);
});

test("value_max = beste forsøk (Standing Long Jump)", () => {
  const protocol = protB("value_max", [{ nr: 1 }, { nr: 2 }, { nr: 3 }], "cm");
  const { score } = scoreTest(protocol, [
    { nr: 1, verdier: { lengde: 240 } },
    { nr: 2, verdier: { lengde: 255 } },
    { nr: 3, verdier: { lengde: 250 } },
  ]);
  assert.equal(score, 255);
});

test("value_single = enkeltverdi, plukker 1RM (vekt) ikke kroppsvekt", () => {
  const protocol = protB("value_single", [{ nr: 1 }], "kg");
  const { score } = scoreTest(protocol, [
    { nr: 1, verdier: { vekt: 100, kroppsvekt: 80 } },
  ]);
  assert.equal(score, 100);
});

test("time_seconds = rå tid (lavere er bedre)", () => {
  const protocol = protB("time_seconds", [{ nr: 1 }], "sek");
  const { score, details } = scoreTest(protocol, [{ nr: 1, verdier: { tid: 720 } }]);
  assert.equal(score, 720);
  assert.equal(details.retning, "lavere_bedre");
});

test("scoringMode lowest → min; average → snitt; sum → sum", () => {
  const lowest = scoreTest(
    { scoringMode: "lowest", steps: [{ shots: 3, inputFields: [{ key: "distanse", unit: "m" }] }] },
    [{ nr: 1, verdier: { distanse: 5 } }, { nr: 2, verdier: { distanse: 3 } }, { nr: 3, verdier: { distanse: 7 } }],
  );
  assert.equal(lowest.score, 3);

  const avg = scoreTest(
    { scoringMode: "average", steps: [{ shots: 2, inputFields: [{ key: "distanse", unit: "m" }] }] },
    [{ nr: 1, verdier: { distanse: 10 } }, { nr: 2, verdier: { distanse: 20 } }],
  );
  assert.equal(avg.score, 15);

  const sum = scoreTest(
    { scoringMode: "sum", steps: [{ shots: 3, inputFields: [{ key: "poeng", unit: "poeng" }] }] },
    [{ nr: 1, verdier: { poeng: 1 } }, { nr: 2, verdier: { poeng: 2 } }, { nr: 3, verdier: { poeng: 3 } }],
  );
  assert.equal(sum.score, 6);
});

test("ingen protokoll → fallback enkeltverdi", () => {
  const { score, details } = scoreTest(null, [{ nr: 1, verdier: { score: 42 } }]);
  assert.equal(score, 42);
  assert.equal(details.scoring, "fallback");
});

test("lavereErBedre stemmer per kind", () => {
  assert.equal(lavereErBedre("pei_average"), true);
  assert.equal(lavereErBedre("time_seconds"), true);
  assert.equal(lavereErBedre("spread_stddev"), true);
  assert.equal(lavereErBedre("carry_average"), false);
  assert.equal(lavereErBedre("points_total"), false);
  assert.equal(lavereErBedre("value_max"), false);
});
