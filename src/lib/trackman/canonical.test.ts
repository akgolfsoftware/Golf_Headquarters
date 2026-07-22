import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  speedToMph,
  distanceToMeters,
  csvShotsToCanonical,
  htmlReportToCanonical,
} from "./canonical";
import type { TrackManHtmlReport } from "./parse-html-report";

describe("speedToMph", () => {
  it("konverterer m/s under 60 til mph", () => {
    const mph = speedToMph(45);
    assert.ok(mph != null && mph > 100 && mph < 102);
  });

  it("beholder mph over 60", () => {
    assert.equal(speedToMph(95), 95);
  });
});

describe("distanceToMeters", () => {
  it("beholder meter under terskel", () => {
    assert.equal(distanceToMeters(180), 180);
  });

  it("konverterer yards over 320", () => {
    const m = distanceToMeters(350);
    assert.ok(m != null && m < 350 && m > 300);
  });
});

describe("csvShotsToCanonical", () => {
  it("mapper kølle og konverterer hastighet", () => {
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
      },
    ]);
    assert.equal(out[0]?.club, "7 Iron");
    assert.ok((out[0]?.clubSpeedMph ?? 0) > 80);
    assert.equal(out[0]?.carryMeters, 150);
  });
});

describe("htmlReportToCanonical", () => {
  it("flater ut slag per køllegruppe", () => {
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
  });
});
