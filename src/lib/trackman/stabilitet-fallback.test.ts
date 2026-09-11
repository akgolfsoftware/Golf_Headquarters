/**
 * E.03 / E.06: stabilitet fra strukturerte slag når rawJson er tom.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { beregnStabilitet } from "@/lib/trackman/stabilitet";

describe("beregnStabilitet fallback (E.03)", () => {
  it("tom rawJson + DB-slag → klubber og score", () => {
    const db = [
      {
        club: "7-jern",
        carryDistance: 150,
        totalDistance: 155,
        smashFactor: 1.35,
        ballSpeed: 120,
        launchAngle: 16,
        spinRate: 6500,
        side: 2,
        clubSpeed: 90,
      },
      {
        club: "7-jern",
        carryDistance: 152,
        totalDistance: 157,
        smashFactor: 1.36,
        ballSpeed: 121,
        launchAngle: 16.5,
        spinRate: 6400,
        side: -1,
        clubSpeed: 91,
      },
      {
        club: "7-jern",
        carryDistance: 148,
        totalDistance: 153,
        smashFactor: 1.34,
        ballSpeed: 119,
        launchAngle: 15.5,
        spinRate: 6600,
        side: 3,
        clubSpeed: 89,
      },
    ];
    const data = beregnStabilitet({ shots: [] }, db);
    assert.equal(data.klubber.length, 1);
    assert.equal(data.klubber[0].navn, "7-jern");
    assert.equal(data.klubber[0].antallSlag, 3);
    assert.ok(data.klubber[0].params.carry.mean != null);
    assert.ok(data.mestStødig != null);
  });

  it("rawJson.shots brukes når den er rik", () => {
    const data = beregnStabilitet({
      shots: [
        {
          club: "Driver",
          clubSpeedMps: 45,
          ballSpeedMps: 65,
          smashFactor: 1.45,
          carryMeters: 230,
          totalMeters: 250,
          launchAngleDeg: 12,
          spinRateRpm: 2500,
          sideMeters: 5,
          notes: null,
        },
        {
          club: "Driver",
          clubSpeedMps: 46,
          ballSpeedMps: 66,
          smashFactor: 1.46,
          carryMeters: 235,
          totalMeters: 255,
          launchAngleDeg: 12.5,
          spinRateRpm: 2400,
          sideMeters: -2,
          notes: null,
        },
      ],
    });
    assert.equal(data.klubber[0].navn, "Driver");
    assert.equal(data.klubber[0].antallSlag, 2);
  });

  it("normaliserer eksplisitt mph og yards før stabilitet beregnes", () => {
    const shots = [
      { ballSpeedMps: 60, carryMeters: 320 },
      { ballSpeedMps: 70, carryMeters: 330 },
      { ballSpeedMps: 80, carryMeters: 340 },
    ].map(({ ballSpeedMps, carryMeters }) => ({
      club: "Driver",
      clubSpeedMps: null,
      ballSpeedMps,
      smashFactor: null,
      carryMeters,
      totalMeters: null,
      launchAngleDeg: null,
      spinRateRpm: null,
      sideMeters: null,
      notes: null,
      sourceUnits: { ballSpeed: "mph" as const, carry: "yd" as const },
    }));

    const data = beregnStabilitet({ shots });
    const driver = data.klubber[0];
    assert.ok(driver);
    assert.ok(Math.abs((driver.params.ballSpeed.mean ?? 0) - 31.2928) < 0.001);
    assert.ok(Math.abs((driver.params.carry.mean ?? 0) - 301.753) < 0.001);
  });
});
