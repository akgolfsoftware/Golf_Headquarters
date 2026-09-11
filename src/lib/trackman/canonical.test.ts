import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  speedToMph,
  distanceToMeters,
  csvShotsToCanonical,
  htmlReportToCanonical,
  CSV_SOURCE_UNITS,
  PHOTO_SOURCE_UNITS,
  HTML_REPORT_SOURCE_UNITS,
} from "./canonical";
import type { TrackManHtmlReport } from "./parse-html-report";

describe("speedToMph — ingen gjetning fra tallstørrelse (R-D)", () => {
  it("konverterer m/s til mph når enheten er eksplisitt mps", () => {
    const mph = speedToMph(45, "mps");
    assert.ok(mph != null && mph > 100 && mph < 102);
  });

  it("beholder mph uendret når enheten er eksplisitt mph", () => {
    assert.equal(speedToMph(95, "mph"), 95);
  });

  it("REGRESJON: 70 m/s (ballspeed) konverteres korrekt til ~156.6 mph — " +
    "ikke gjettet som allerede-mph fordi 70 > gammel 60-terskel", () => {
    const mph = speedToMph(70, "mps");
    assert.ok(mph != null);
    assert.ok(Math.abs((mph as number) - 156.59) < 0.1, `fikk ${mph}`);
  });

  it("mph-verdier under 60 blir IKKE feilaktig 'oppkonvertert' som m/s " +
    "(wedge-slag via foto-avlesning, tidligere reell bug)", () => {
    // AI-bildeavlesning ba modellen om mph. Et wedge-slag på 48 mph skal
    // forbli 48 mph — ikke bli tolket som m/s og bli til ~107 mph.
    assert.equal(speedToMph(48, PHOTO_SOURCE_UNITS.speed), 48);
  });

  it("null/NaN gir null, aldri et anslag", () => {
    assert.equal(speedToMph(null, "mps"), null);
    assert.equal(speedToMph(Number.NaN, "mph"), null);
  });
});

describe("distanceToMeters — ingen gjetning fra tallstørrelse (R-D)", () => {
  it("beholder meter uendret når enheten er eksplisitt meters", () => {
    assert.equal(distanceToMeters(180, "meters"), 180);
  });

  it("konverterer yards til meter når enheten er eksplisitt yards", () => {
    const m = distanceToMeters(350, "yards");
    assert.ok(m != null && m < 350 && m > 300);
  });

  it("REGRESJON: 330 meter (carry, CSV) beholdes som 330 meter — " +
    "ikke gjettet som yards fordi 330 > gammel 320-terskel", () => {
    assert.equal(distanceToMeters(330, "meters"), 330);
  });

  it("null/NaN gir null, aldri et anslag", () => {
    assert.equal(distanceToMeters(null, "meters"), null);
    assert.equal(distanceToMeters(Number.NaN, "yards"), null);
  });
});

describe("csvShotsToCanonical", () => {
  it("mapper kølle og konverterer hastighet med eksplisitt CSV-enhet (mps/meter)", () => {
    const out = csvShotsToCanonical(
      [
        {
          club: "7 Iron",
          clubSpeedMps: 40,
          ballSpeedMps: 50,
          smashFactor: 1.4,
          carryMeters: 150,
          totalMeters: 160,
          launchAngleDeg: 18,
          spinRateRpm: 6000,
          sideMeters: 2,
          notes: null,
        },
      ],
      CSV_SOURCE_UNITS,
    );
    assert.equal(out[0]?.club, "7 Iron");
    assert.ok((out[0]?.clubSpeedMph ?? 0) > 80);
    assert.equal(out[0]?.carryMeters, 150);
  });

  it("REGRESJON: CSV carry=330 meter og ballSpeed=70 m/s beholdes/konverteres " +
    "korrekt sammen, i én shot", () => {
    const out = csvShotsToCanonical(
      [
        {
          club: "Driver",
          clubSpeedMps: 50,
          ballSpeedMps: 70,
          smashFactor: 1.4,
          carryMeters: 330,
          totalMeters: 340,
          launchAngleDeg: 12,
          spinRateRpm: 2200,
          sideMeters: 0,
          notes: null,
        },
      ],
      CSV_SOURCE_UNITS,
    );
    assert.equal(out[0]?.carryMeters, 330);
    assert.ok(out[0]?.ballSpeedMph != null && Math.abs(out[0].ballSpeedMph - 156.59) < 0.1);
  });

  it("mapper foto-shots (mph/meter) UTEN å feiltolke som m/s", () => {
    const out = csvShotsToCanonical(
      [
        {
          club: "PW",
          clubSpeedMps: 48, // faktisk mph, feltnavnet er delt med CSV-typen
          ballSpeedMps: 62,
          smashFactor: 1.25,
          carryMeters: 90,
          totalMeters: 92,
          launchAngleDeg: 30,
          spinRateRpm: 8000,
          sideMeters: 1,
          notes: null,
        },
      ],
      PHOTO_SOURCE_UNITS,
    );
    assert.equal(out[0]?.clubSpeedMph, 48);
    assert.equal(out[0]?.ballSpeedMph, 62);
  });
});

describe("htmlReportToCanonical", () => {
  const baseMetrics = {
    clubSpeed: 0,
    clubPath: 0,
    swingDirection: 0,
    lowPoint: "0",
    faceAngle: 0,
    ballSpeed: 0,
    faceToPath: 0,
    smashFactor: 0,
    totalDistance: 0,
    launchDirection: 0,
  };

  it("flater ut slag per køllegruppe og setter carry til null (aldri = total)", () => {
    const report: TrackManHtmlReport = {
      type: "multi-group",
      reportDate: "2026-03-19",
      sessionName: "Test",
      clubs: [
        {
          clubId: "7i",
          clubName: "7-jern",
          shotCount: 2,
          shots: [
            { shotNumber: 1, ...baseMetrics, clubSpeed: 85, ballSpeed: 115, faceToPath: 1, smashFactor: 1.35, totalDistance: 160 },
            { shotNumber: 2, ...baseMetrics, clubSpeed: 86, ballSpeed: 116, faceToPath: -1, smashFactor: 1.36, totalDistance: 162 },
          ],
          average: baseMetrics,
          consistency: baseMetrics,
        },
      ],
    };
    const shots = htmlReportToCanonical(report);
    assert.equal(shots.length, 2);
    assert.equal(shots[0]?.club, "7-jern");
    assert.equal(shots[0]?.clubSpeedMph, 85);
    assert.equal(shots[0]?.faceToPath, 1);
    // R-D-krav: manglende carry (rapporten har kun total) erstattes ALDRI av total.
    assert.equal(shots[0]?.carryMeters, null);
    assert.equal(shots[1]?.carryMeters, null);
  });

  it("HTML-hastigheter under 60 tolkes IKKE som m/s (fast mph-konvensjon, ikke gjetning)", () => {
    const report: TrackManHtmlReport = {
      type: "multi-group",
      reportDate: "2026-03-19",
      sessionName: "Test",
      clubs: [
        {
          clubId: "pw",
          clubName: "PW",
          shotCount: 1,
          shots: [{ shotNumber: 1, ...baseMetrics, clubSpeed: 55, ballSpeed: 58, totalDistance: 90 }],
          average: baseMetrics,
          consistency: baseMetrics,
        },
      ],
    };
    const shots = htmlReportToCanonical(report);
    assert.equal(shots[0]?.clubSpeedMph, 55);
    assert.equal(shots[0]?.ballSpeedMph, 58);
  });

  it("bruker deklarert enhet, kan overstyres eksplisitt (aldri gjettet)", () => {
    const report: TrackManHtmlReport = {
      type: "multi-group",
      reportDate: "2026-03-19",
      sessionName: "Test",
      clubs: [
        {
          clubId: "d",
          clubName: "Driver",
          shotCount: 1,
          shots: [{ shotNumber: 1, ...baseMetrics, clubSpeed: 100, ballSpeed: 150, totalDistance: 250 }],
          average: baseMetrics,
          consistency: baseMetrics,
        },
      ],
    };
    const yards = htmlReportToCanonical(report, HTML_REPORT_SOURCE_UNITS);
    const meters = htmlReportToCanonical(report, { speed: "mph", distance: "meters" });
    assert.ok(yards[0]?.totalMeters != null && meters[0]?.totalMeters != null);
    assert.ok((yards[0]!.totalMeters as number) < (meters[0]!.totalMeters as number));
  });
});
