import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  speedToMph,
  distanceToMeters,
  csvShotsToCanonical,
  htmlReportToCanonical,
} from "./canonical";
import { parseTrackManCsv } from "./parse-csv";
import type { TrackManHtmlReport } from "./parse-html-report";

describe("speedToMph", () => {
  it("konverterer 70 m/s korrekt, uten å ta det som mph", () => {
    const mph = speedToMph(70, "mps");
    assert.ok(mph != null && Math.abs(mph - 156.59) < 0.02);
  });

  it("beholder mph", () => {
    assert.equal(speedToMph(95, "mph"), 95);
  });

  it("ukjent enhet blir null, ikke gjettet", () => {
    assert.equal(speedToMph(70, "unknown"), null);
    assert.equal(speedToMph(95, "unknown"), null);
  });
});

describe("distanceToMeters", () => {
  it("beholder 330 m, uten å ta det som yards", () => {
    assert.equal(distanceToMeters(330, "m"), 330);
  });

  it("konverterer yards når enheten er kjent", () => {
    const m = distanceToMeters(350, "yd");
    assert.ok(m != null && Math.abs(m - 320.04) < 0.02);
  });

  it("manglende carry/enhet blir null", () => {
    assert.equal(distanceToMeters(null, "m"), null);
    assert.equal(distanceToMeters(180, "unknown"), null);
  });
});

describe("csvShotsToCanonical", () => {
  it("mapper kølle og konverterer kjent m/s + meter", () => {
    const out = csvShotsToCanonical([
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
        speedUnit: "mps",
        distanceUnit: "m",
      },
    ]);
    assert.equal(out[0]?.club, "7 Iron");
    assert.ok((out[0]?.clubSpeedMph ?? 0) > 80);
    assert.equal(out[0]?.carryMeters, 150);
    assert.equal(out[0]?.totalMeters, 160);
  });

  it("skiller carry fra total og gjetter ikke manglende carry", () => {
    const out = csvShotsToCanonical([
      {
        club: "Driver",
        clubSpeedMps: 110,
        ballSpeedMps: 160,
        smashFactor: 1.45,
        carryMeters: null,
        totalMeters: 280,
        launchAngleDeg: null,
        spinRateRpm: null,
        sideMeters: null,
        notes: null,
        speedUnit: "mph",
        distanceUnit: "m",
      },
    ]);
    assert.equal(out[0]?.carryMeters, null);
    assert.equal(out[0]?.totalMeters, 280);
    assert.equal(out[0]?.clubSpeedMph, 110);
  });
});

describe("faste CSV-testfiler", () => {
  it("m/s + meter-hode bevarer 70 m/s og 330 m", () => {
    const csv = [
      "Date,Club,Club Speed (m/s),Ball Speed (m/s),Carry (m),Total (m)",
      "2026-09-11,Driver,70,50,330,340",
    ].join("\n");
    const parsed = parseTrackManCsv(csv);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const shot = csvShotsToCanonical(parsed.sessions[0]!.rawJson.shots)[0]!;
    assert.ok(Math.abs((shot.clubSpeedMph ?? 0) - 156.59) < 0.02);
    assert.equal(shot.carryMeters, 330);
  });

  it("mph + yards via enhetsrad", () => {
    const csv = [
      "Date,Club,Club Speed,Ball Speed,Carry,Total",
      ",,mph,mph,yd,yd",
      "2026-09-11,Driver,110,160,280,300",
    ].join("\n");
    const parsed = parseTrackManCsv(csv);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const shot = csvShotsToCanonical(parsed.sessions[0]!.rawJson.shots)[0]!;
    assert.equal(shot.clubSpeedMph, 110);
    assert.ok(shot.carryMeters != null && Math.abs(shot.carryMeters - 256.03) < 0.02);
  });

  it("manglende enhet og manglende carry blir ukjent", () => {
    const csv = [
      "Date,Club,Club Speed,Carry,Total",
      "2026-09-11,Driver,70,,330",
    ].join("\n");
    const parsed = parseTrackManCsv(csv);
    assert.equal(parsed.ok, true);
    if (!parsed.ok) return;
    const shot = csvShotsToCanonical(parsed.sessions[0]!.rawJson.shots)[0]!;
    assert.equal(shot.clubSpeedMph, null);
    assert.equal(shot.carryMeters, null);
    assert.equal(shot.totalMeters, null);
  });
});

describe("htmlReportToCanonical", () => {
  it("flater ut slag og kopierer aldri total til carry", () => {
    const report: TrackManHtmlReport = {
      type: "multi-group",
      reportDate: "2026-03-19",
      sessionName: "Test",
      speedUnit: "mph",
      distanceUnit: "m",
      clubs: [
        {
          clubId: "7i",
          clubName: "7-jern",
          shotCount: 2,
          shots: [
            {
              shotNumber: 1,
              clubSpeed: 85,
              clubPath: 0,
              swingDirection: 0,
              lowPoint: "0",
              faceAngle: 0,
              ballSpeed: 115,
              faceToPath: 1,
              smashFactor: 1.35,
              totalDistance: 160,
              launchDirection: 0,
            },
            {
              shotNumber: 2,
              clubSpeed: 86,
              clubPath: 0,
              swingDirection: 0,
              lowPoint: "0",
              faceAngle: 0,
              ballSpeed: 116,
              faceToPath: -1,
              smashFactor: 1.36,
              totalDistance: 162,
              launchDirection: 0,
            },
          ],
          average: {
            clubSpeed: 85.5,
            clubPath: 0,
            swingDirection: 0,
            lowPoint: "0",
            faceAngle: 0,
            ballSpeed: 115.5,
            faceToPath: 0,
            smashFactor: 1.355,
            totalDistance: 161,
            launchDirection: 0,
          },
          consistency: {
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
          },
        },
      ],
    };
    const shots = htmlReportToCanonical(report);
    assert.equal(shots.length, 2);
    assert.equal(shots[0]?.club, "7-jern");
    assert.equal(shots[0]?.clubSpeedMph, 85);
    assert.equal(shots[0]?.faceToPath, 1);
    assert.equal(shots[0]?.carryMeters, null);
    assert.equal(shots[0]?.totalMeters, 160);
  });
});
