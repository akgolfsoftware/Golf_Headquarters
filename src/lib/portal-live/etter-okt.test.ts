import assert from "node:assert/strict";
import { test } from "node:test";
import type { LiveV2Drill, LiveV2DrillLog, LiveV2Summary } from "@/components/portal/live/types";
import { byggEtterOkt, mmss } from "./etter-okt";

const drill = (o: Partial<LiveV2Drill> & { id: string }): LiveV2Drill => ({
  index: 1, name: o.id, description: null, durationMinutes: 10, actualDurationSec: null, plannedReps: 0,
  pyramide: "SLAG", lFase: null, notes: null, repType: null, repAntall: null, repMinutter: null, repSett: null, repReps: null,
  fysTreningstype: null, fysMuskelgruppe: null, fysSett: null, fysReps: null, fysVektKg: null, fysTempo: null, fysPauseSek: null,
  fysVarighetMin: null, fysIntensitetsSone: null, fysDistanseM: null, fysAktivitet: null, fysBevegelighetType: null, fysHoldSek: null, ...o,
});
const logg = (drillId: string, repsTotal: number, notes: string | null = null): LiveV2DrillLog => ({
  drillId, repsTotal, repsWithoutBall: 0, repsLowSpeed: 0, repsAutomatic: 0, repsHit: 0, successRate: 0, notes, loggedAt: "2026-09-26T12:00:00Z",
});
const okt = (o: Partial<LiveV2Summary>): LiveV2Summary => ({
  sessionId: "s", title: "Økt", coachComment: null, focus: null, status: "COMPLETED",
  scheduledAtISO: "2026-09-26T12:30:00Z", endTimeISO: "2026-09-26T13:42:00Z", location: null, maalsetning: null,
  coachName: null, publishedAtISO: null, completed: true, studentName: null, pyramide: "SLAG", drills: [], existingLogs: [],
  completedSummary: null, durationSec: 0, totalReps: 0, drillsCompleted: 0, pyramidSummary: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 }, ...o,
} as LiveV2Summary);

test("golf: tid og reps mot plan, per øvelse", () => {
  const r = byggEtterOkt(okt({
    durationSec: 2612,
    drills: [drill({ id: "a", plannedReps: 40, actualDurationSec: 600 }), drill({ id: "b", plannedReps: 60 })],
    existingLogs: [logg("a", 38), logg("b", 50)],
  }));
  assert.equal(r.variant, "golf");
  assert.equal(r.tom, false);
  assert.equal(r.totalSek, 2612);
  assert.equal(r.planSek, 72 * 60);
  assert.equal(r.antall, 88);
  assert.equal(r.planAntall, 100);
  assert.equal(r.rader[0].sek, 600);
  assert.equal(r.rader[1].sek, null);
});

test("mangler logg: null og ikke null-tall, aldri gjetning", () => {
  const r = byggEtterOkt(okt({ drills: [drill({ id: "a", plannedReps: 40 })] }));
  assert.equal(r.antall, null);
  assert.equal(r.rader[0].antall, null);
  assert.equal(r.tom, true);
});

test("fysisk økt teller serier mot plan", () => {
  const r = byggEtterOkt(okt({
    durationSec: 1800,
    drills: [drill({ id: "f", pyramide: "FYS", fysSett: 3 })],
    existingLogs: [logg("f", 20, "Styrke: 60 kg × 8 · 60 kg × 8")],
  }));
  assert.equal(r.variant, "fys");
  assert.equal(r.antall, 2);
  assert.equal(r.planAntall, 3);
});

test("fysisk uten planlagte serier gir «—» for plan", () => {
  const r = byggEtterOkt(okt({ durationSec: 60, drills: [drill({ id: "f", pyramide: "FYS" })], existingLogs: [logg("f", 8, "Styrke: 50 kg × 8")] }));
  assert.equal(r.planAntall, null);
});

test("tapper-økt bruker slagtelling uten øvelser", () => {
  const r = byggEtterOkt(okt({ logSource: "tapper", totalReps: 120 }));
  assert.equal(r.antall, 120);
  assert.equal(r.tom, false);
});

test("mmss", () => {
  assert.equal(mmss(2612), "43:32");
  assert.equal(mmss(null), "—");
});

test("fysisk kondisjon og bevegelighet beholder detaljer uten å kalle dem serier", () => {
  const r = byggEtterOkt(okt({ drills: [drill({id:"f",pyramide:"FYS"})], existingLogs:[logg("f",10,"Kondisjon: 10 min i sone 4 — Syntetisk notat")] }));
  assert.equal(r.tom, false); assert.equal(r.antall, null);
  assert.equal(r.rader[0].enhet, null); assert.equal(r.rader[0].notat,"Syntetisk notat");
  assert.deepEqual(r.rader[0].detaljer,[{label:"Registrert varighet",verdi:"10 min"},{label:"Pulssone",verdi:"S4"}]);
});
test("blandet golf og styrke summerer ikke serier som golfrepetisjoner", () => {
  const r = byggEtterOkt(okt({drills:[drill({id:"g"}),drill({id:"f",pyramide:"FYS",fysSett:3})],existingLogs:[logg("g",20),logg("f",8,"Styrke: 60 kg × 8")]}));
  assert.equal(r.antall,20);assert.equal(r.rader[1].antall,1);assert.equal(r.rader[1].enhet,"serier");
});
