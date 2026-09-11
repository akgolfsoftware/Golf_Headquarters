import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { completedLiveDrills } from "./live-summary";
import type { LiveV2Session } from "@/components/portal/live/types";

type Rad = Pick<LiveV2Session, "drills" | "existingLogs" | "completedSummary">;

function drill(id: string) {
  return { id, index: 1, name: id, description: null, durationMinutes: 10,
    actualDurationSec: null, plannedReps: 10, pyramide: "TEK" as const, lFase: null,
    notes: null, repType: null, repAntall: null, repMinutter: null, repSett: null,
    repReps: null, fysTreningstype: null, fysMuskelgruppe: null, fysSett: null,
    fysReps: null, fysVektKg: null, fysTempo: null, fysPauseSek: null,
    fysVarighetMin: null, fysIntensitetsSone: null, fysDistanseM: null,
    fysAktivitet: null, fysBevegelighetType: null, fysHoldSek: null };
}

function log(drillId: string) {
  return { drillId, repsTotal: 5, repsWithoutBall: 0, repsLowSpeed: 0,
    repsAutomatic: 0, repsHit: 3, successRate: 0.6, notes: null,
    loggedAt: "2026-09-11T10:00:00.000Z" };
}

describe("completedLiveDrills", () => {
  it("bruker eksplisitt completedDrillIds fra nye økter — ikke autosendte logger", () => {
    const data: Rad = {
      drills: [drill("a"), drill("b")],
      existingLogs: [log("a"), log("b")], // begge har logger (autosendt)
      completedSummary: { liveSummary: { completedDrillIds: ["a"] } }, // kun a er markert ferdig
    };
    assert.deepEqual(completedLiveDrills(data), ["a"]);
  });

  it("eldre økter uten completedDrillIds faller tilbake til loggene (dokumentert fallback)", () => {
    const data: Rad = {
      drills: [drill("a"), drill("b")],
      existingLogs: [log("a")],
      completedSummary: null,
    };
    assert.deepEqual(completedLiveDrills(data), ["a"]);
  });

  it("filtrerer bort id-er som ikke lenger finnes blant drillsene", () => {
    const data: Rad = {
      drills: [drill("a")],
      existingLogs: [],
      completedSummary: { liveSummary: { completedDrillIds: ["a", "slettet-drill"] } },
    };
    assert.deepEqual(completedLiveDrills(data), ["a"]);
  });

  it("dedupliserer", () => {
    const data: Rad = {
      drills: [drill("a")],
      existingLogs: [],
      completedSummary: { liveSummary: { completedDrillIds: ["a", "a"] } },
    };
    assert.deepEqual(completedLiveDrills(data), ["a"]);
  });

  it("tom completedDrillIds-liste betyr eksplisitt ingen ferdige — brukes som den er, ikke fallback", () => {
    const data: Rad = {
      drills: [drill("a")],
      existingLogs: [log("a")],
      completedSummary: { liveSummary: { completedDrillIds: [] } },
    };
    assert.deepEqual(completedLiveDrills(data), []);
  });

  it("tomt datagrunnlag gir tom liste, ikke feil", () => {
    const data: Rad = { drills: [], existingLogs: [], completedSummary: null };
    assert.deepEqual(completedLiveDrills(data), []);
  });
});
