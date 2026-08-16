/**
 * Geometrikontrakten for Gameplan/baneguide — enhetstester for dispersion.ts.
 *
 * Motoren har vært i produksjon uten tester (AP0.3 i
 * docs/plan-baneguide-sg-app-2026-08-16.md). Fasit-verdiene under er
 * håndregnet; endres motoren, skal disse feile.
 *
 * Nøkkeltall brukt:
 *  - 1° breddegrad = π/180 · 6 371 000 m = 111 194,9 m (motorens R_EARTH).
 *  - 95 %-konfidens (chi-kvadrat, 2 frihetsgrader): k = √(−2·ln 0,05) = 2,4477.
 *  - Punktsettet {(−4,0),(4,0),(0,−6),(0,6)}: var(lateral)=8, var(distance)=18,
 *    cov=0 → σ_lat=2,828, σ_dist=4,243; ellipse-halvakser √18·k=10,386 og
 *    √8·k=6,923, vinkel 0 (storaksen langs distance-aksen).
 *
 * Kjør med: npm test
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  haversine,
  bearing,
  destinationPoint,
  circlePolygon,
  projectToAimFrame,
  computeDispersion,
  shotsToPoints,
  trackmanToPoints,
  ellipseGpsPunkter,
  andelISone,
} from "./dispersion";

// Onsøy-omtrentlig utgangspunkt — reelle koordinater i motorens bruksområde.
const TEE = { lat: 59.25, lng: 10.85 };

const naer = (faktisk: number, forventet: number, avvik: number, melding: string) =>
  assert.ok(
    Math.abs(faktisk - forventet) <= avvik,
    `${melding}: fikk ${faktisk}, forventet ${forventet} ±${avvik}`,
  );

describe("haversine", () => {
  it("samme punkt er 0 m", () => {
    assert.equal(haversine(TEE, TEE), 0);
  });

  it("1° breddegrad er 111 195 m (R=6371 km)", () => {
    const nord = { lat: TEE.lat + 1, lng: TEE.lng };
    naer(haversine(TEE, nord), 111194.9, 1, "1° nord");
  });

  it("er symmetrisk", () => {
    const b = { lat: 59.3, lng: 10.9 };
    naer(haversine(TEE, b), haversine(b, TEE), 1e-9, "a→b vs b→a");
  });
});

describe("bearing", () => {
  it("rett nord er 0", () => {
    naer(bearing(TEE, { lat: TEE.lat + 0.01, lng: TEE.lng }), 0, 1e-9, "nord");
  });

  it("rett øst er π/2 (kort avstand)", () => {
    naer(bearing(TEE, { lat: TEE.lat, lng: TEE.lng + 0.001 }), Math.PI / 2, 0.001, "øst");
  });

  it("rett sør er ±π", () => {
    const b = bearing(TEE, { lat: TEE.lat - 0.01, lng: TEE.lng });
    naer(Math.abs(b), Math.PI, 1e-9, "sør");
  });
});

describe("destinationPoint", () => {
  it("rundtur: avstand og retning gjenskapes", () => {
    for (const [retning, avstand] of [
      [0, 150],
      [Math.PI / 3, 220],
      [-Math.PI / 2, 90],
    ] as const) {
      const p = destinationPoint(TEE, retning, avstand);
      naer(haversine(TEE, p), avstand, 0.01, `avstand (retning ${retning})`);
      naer(bearing(TEE, p), retning, 1e-6, `retning (retning ${retning})`);
    }
  });
});

describe("circlePolygon", () => {
  it("gir lukket ring der alle hjørner ligger på radius", () => {
    const ring = circlePolygon(TEE, 20, 16);
    assert.equal(ring.length, 17); // points + lukkepunkt
    assert.deepEqual(ring[0], ring[16]);
    for (const [lng, lat] of ring) {
      naer(haversine(TEE, { lat, lng }), 20, 0.05, "hjørne på radius");
    }
  });
});

describe("projectToAimFrame", () => {
  const target = destinationPoint(TEE, 0, 200); // 200 m rett nord

  it("landing i målet er (0, 0)", () => {
    const p = projectToAimFrame(target, TEE, target);
    naer(p.lateral, 0, 0.01, "lateral");
    naer(p.distance, 0, 0.01, "distance");
  });

  it("10 m forbi målet er distance +10", () => {
    const p = projectToAimFrame(destinationPoint(TEE, 0, 210), TEE, target);
    naer(p.distance, 10, 0.05, "distance");
    naer(p.lateral, 0, 0.05, "lateral");
  });

  it("10 m kort er distance −10", () => {
    const p = projectToAimFrame(destinationPoint(TEE, 0, 190), TEE, target);
    naer(p.distance, -10, 0.05, "distance");
  });

  it("8 m øst for målet er lateral +8 (høyre)", () => {
    const landing = destinationPoint(target, Math.PI / 2, 8);
    const p = projectToAimFrame(landing, TEE, target);
    naer(p.lateral, 8, 0.05, "lateral");
    // Buet projeksjon gir marginal distanse-komponent — skal være ~0.
    naer(p.distance, 0, 0.25, "distance");
  });

  it("8 m vest for målet er lateral −8 (venstre)", () => {
    const landing = destinationPoint(target, -Math.PI / 2, 8);
    const p = projectToAimFrame(landing, TEE, target);
    naer(p.lateral, -8, 0.05, "lateral");
  });
});

describe("computeDispersion", () => {
  it("tomt sett gir null-ellipse og nøytral bias", () => {
    const d = computeDispersion([]);
    assert.equal(d.n, 0);
    assert.equal(d.ellipse, null);
    assert.equal(d.bias.side, "rett");
    assert.equal(d.bias.length, "presis");
  });

  it("kjent punktsett gir håndregnet σ og ellipse (95 %)", () => {
    const d = computeDispersion([
      { lateral: -4, distance: 0 },
      { lateral: 4, distance: 0 },
      { lateral: 0, distance: -6 },
      { lateral: 0, distance: 6 },
    ]);
    assert.equal(d.n, 4);
    naer(d.mean.lateral, 0, 1e-9, "mean lateral");
    naer(d.std.lateral, Math.sqrt(8), 1e-9, "σ lateral");
    naer(d.std.distance, Math.sqrt(18), 1e-9, "σ distance");
    assert.ok(d.ellipse, "ellipse finnes");
    const k = Math.sqrt(-2 * Math.log(0.05));
    naer(d.ellipse.semiMajor, Math.sqrt(18) * k, 1e-6, "semiMajor = √18·k");
    naer(d.ellipse.semiMinor, Math.sqrt(8) * k, 1e-6, "semiMinor = √8·k");
    naer(d.ellipse.angleRad, 0, 1e-9, "storaksen langs distance-aksen");
    assert.equal(d.ellipse.confidence, 0.95);
  });

  it("bias-terskelen er 2 m: +5 lateral / −5 distance er høyre + kort", () => {
    const d = computeDispersion([
      { lateral: 5, distance: -5 },
      { lateral: 5, distance: -5 },
    ]);
    assert.equal(d.bias.side, "høyre");
    assert.equal(d.bias.length, "kort");
  });

  it("under terskelen (±2 m) er rett + presis", () => {
    const d = computeDispersion([
      { lateral: 1.5, distance: -1.5 },
      { lateral: 1.5, distance: -1.5 },
    ]);
    assert.equal(d.bias.side, "rett");
    assert.equal(d.bias.length, "presis");
  });

  it("kovarians ≠ 0 gir rotert storakse med riktig fortegn", () => {
    // Punkter langs +lateral/+distance-diagonalen = fade-bias (høyre-lang).
    // sxx = syy og sxy > 0 → angleRad = ½·atan2(2sxy, syy−sxx) = +π/4.
    // Positiv vinkel = storaksen tiltet fra distance-aksen MOT +lateral.
    const hoyreLang = computeDispersion([-10, -5, 5, 10].map((t) => ({ lateral: t, distance: t })));
    assert.ok(hoyreLang.ellipse);
    naer(hoyreLang.ellipse.angleRad, Math.PI / 4, 1e-9, "+π/4 for høyre-lang");

    // Speilvendt sett (draw-bias: venstre-lang) skal gi motsatt fortegn.
    const venstreLang = computeDispersion(
      [-10, -5, 5, 10].map((t) => ({ lateral: -t, distance: t })),
    );
    assert.ok(venstreLang.ellipse);
    naer(venstreLang.ellipse.angleRad, -Math.PI / 4, 1e-9, "−π/4 for venstre-lang");

    // Storaksen skal være klart lengre enn lillaksen for et tiltet sett.
    assert.ok(
      hoyreLang.ellipse.semiMajor > hoyreLang.ellipse.semiMinor * 5,
      "diagonalt sett gir avlang ellipse",
    );
  });

  it("konfidens skalerer halvaksene (39,3 % ≈ 1σ)", () => {
    const punkter = [
      { lateral: -4, distance: 0 },
      { lateral: 4, distance: 0 },
      { lateral: 0, distance: -6 },
      { lateral: 0, distance: 6 },
    ];
    const d = computeDispersion(punkter, { confidence: 0.3934693 }); // 1−e^(−1/2·1²)… k≈1
    assert.ok(d.ellipse);
    naer(d.ellipse.semiMajor, Math.sqrt(18), 0.001, "semiMajor ≈ √18 ved k≈1");
  });
});

describe("shotsToPoints / trackmanToPoints", () => {
  const target = destinationPoint(TEE, 0, 200);

  it("shotsToPoints hopper over slag uten endepunkt", () => {
    const punkter = shotsToPoints(
      [{ end: null }, { end: target }, { end: null }],
      TEE,
      target,
    );
    assert.equal(punkter.length, 1);
    naer(punkter[0].distance, 0, 0.01, "landing i mål");
  });

  it("trackmanToPoints sentrerer carry på snittet og beholder side", () => {
    const punkter = trackmanToPoints([
      { side: -3, carryDistance: 210 },
      { side: 5, carryDistance: 220 },
      { side: null, carryDistance: 200 }, // filtreres
      { side: 2, carryDistance: null }, // filtreres
    ]);
    assert.equal(punkter.length, 2);
    // Snitt-carry over gyldige = 215 → avvik −5 og +5.
    assert.deepEqual(
      punkter.map((p) => ({ lateral: p.lateral, distance: p.distance })),
      [
        { lateral: -3, distance: -5 },
        { lateral: 5, distance: 5 },
      ],
    );
  });

  it("trackmanToPoints uten gyldige slag gir tomt sett", () => {
    assert.deepEqual(trackmanToPoints([{ side: null, carryDistance: null }]), []);
  });
});

describe("ellipseGpsPunkter + andelISone", () => {
  const sikte = destinationPoint(TEE, 0, 200);

  it("sirkulær ellipse sentrert i sikte holder seg innenfor radius", () => {
    const punkter = ellipseGpsPunkter(
      {
        centerLateral: 0,
        centerDistance: 0,
        semiMajor: 15,
        semiMinor: 15,
        angleRad: 0,
        confidence: 0.95,
      },
      TEE,
      sikte,
      120,
    );
    assert.equal(punkter.length, 120);
    for (const p of punkter) {
      assert.ok(haversine(p, sikte) <= 15.5, "punkt innenfor 15 m + slingring");
    }
  });

  it("rundtur bevarer rotasjonsvinkelen (regresjon: speilvendt ellipse)", () => {
    // Hele produksjonspipelinen: punkter → computeDispersion → ellipseGpsPunkter
    // → projectToAimFrame → computeDispersion. Ellipsen skal komme tilbake med
    // SAMME rotasjon. Frem til 2026-08-16 hadde ellipseGpsPunkter invertert
    // fortegn i rotasjonsmatrisen, så +π/4 (fade, høyre-lang) kom tilbake som
    // −π/4 (venstre-lang) — og Gameplans pctAldri/pctBra pekte spilleren mot
    // feil side av hullet. Dette er testen som fanger den.
    const inn = computeDispersion([-10, -5, 5, 10].map((t) => ({ lateral: t, distance: t })));
    assert.ok(inn.ellipse);

    const gps = ellipseGpsPunkter(inn.ellipse, TEE, sikte, 400);
    const ut = computeDispersion(gps.map((p) => projectToAimFrame(p, TEE, sikte)));
    assert.ok(ut.ellipse);

    naer(ut.ellipse.angleRad, inn.ellipse.angleRad, 0.01, "rotasjon bevart gjennom rundturen");

    // Storakse-enden skal ligge høyre-lang (begge positive), ikke speilvendt.
    const enden = destinationPoint(
      destinationPoint(sikte, bearing(TEE, sikte), inn.ellipse.semiMajor * Math.cos(inn.ellipse.angleRad)),
      bearing(TEE, sikte) + Math.PI / 2,
      inn.ellipse.semiMajor * Math.sin(inn.ellipse.angleRad),
    );
    const projisert = projectToAimFrame(enden, TEE, sikte);
    assert.ok(projisert.lateral > 0 && projisert.distance > 0, "storaksen peker høyre-lang");
  });

  it("andelISone teller kun soner av riktig type", () => {
    // 4 punkter 0/10/20/30 m nord for sikte; bra-sone med radius 15 dekker 2.
    const punkter = [0, 10, 20, 30].map((d) => destinationPoint(sikte, 0, d));
    const soner = [
      { type: "bra" as const, senter: sikte, radiusMeter: 15 },
      { type: "aldri" as const, senter: sikte, radiusMeter: 1000 },
    ];
    assert.equal(andelISone(punkter, soner, "bra"), 0.5);
    assert.equal(andelISone(punkter, soner, "aldri"), 1);
    assert.equal(andelISone(punkter, [], "bra"), 0);
    assert.equal(andelISone([], soner, "bra"), 0);
  });
});
