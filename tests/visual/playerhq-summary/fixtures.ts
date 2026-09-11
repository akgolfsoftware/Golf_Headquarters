/**
 * Syntetiske LiveV2Summary-tilstander for PH-06-riggen. Ingen ekte spillerdata —
 * kun oppdiktede, tydelig syntetiske verdier til visuell/funksjonell kontroll.
 * completedDrillIds følger samme fasit-logikk som src/lib/portal-live/live-summary.ts:
 * eksplisitt satt for nye økter, fravær = eldre økt (fallback testes i egen rad).
 */
import type { LiveV2Summary } from "@/components/portal/live/types";

const NA: LiveV2Summary["pyramidSummary"] = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };

function drill(overstyr: Partial<LiveV2Summary["drills"][number]> & { id: string; name: string }) {
  return {
    index: 1,
    description: null,
    durationMinutes: 15,
    actualDurationSec: null,
    plannedReps: 20,
    pyramide: "TEK" as const,
    lFase: null,
    notes: null,
    repType: null,
    repAntall: null,
    repMinutter: null,
    repSett: null,
    repReps: null,
    fysTreningstype: null,
    fysMuskelgruppe: null,
    fysSett: null,
    fysReps: null,
    fysVektKg: null,
    fysTempo: null,
    fysPauseSek: null,
    fysVarighetMin: null,
    fysIntensitetsSone: null,
    fysDistanseM: null,
    fysAktivitet: null,
    fysBevegelighetType: null,
    fysHoldSek: null,
    ...overstyr,
  };
}

function base(overstyr: Partial<LiveV2Summary> = {}): LiveV2Summary {
  return {
    sessionId: "test-sesjon-1",
    title: "Innspill 50–80 m",
    coachComment: null,
    focus: null,
    status: "COMPLETED",
    scheduledAtISO: "2026-09-11T09:00:00.000Z",
    endTimeISO: "2026-09-11T09:50:00.000Z",
    location: "Fredrikstad Golfklubb",
    maalsetning: null,
    coachName: "Anders Kristiansen",
    publishedAtISO: "2026-09-10T18:00:00.000Z",
    completed: true,
    studentName: "Test Spiller",
    pyramide: "TEK",
    drills: [],
    existingLogs: [],
    completedSummary: null,
    durationSec: 0,
    totalReps: 0,
    drillsCompleted: 0,
    pyramidSummary: NA,
    ...overstyr,
  };
}

/** Tom økt — ingen drills, ingen logger, ingen tall. Ærlig tomtilstand, ingen oppdiktede tall. */
export const TOM_OKT: LiveV2Summary = base({
  title: "Fri økt",
  durationSec: 0,
  drills: [],
  existingLogs: [],
  completedDrillIds: [],
});

/** Delvis gjennomført — én av tre drills ferdig, én delvis logget, én urørt. */
export const DELVIS_OKT: LiveV2Summary = base({
  durationSec: 32 * 60,
  drills: [
    drill({ id: "d1", name: "Gate 20 m", plannedReps: 20 }),
    drill({ id: "d2", name: "Innspill 50 m", plannedReps: 15 }),
    drill({ id: "d3", name: "Innspill 80 m", plannedReps: 15 }),
  ],
  existingLogs: [
    { drillId: "d1", repsTotal: 20, repsWithoutBall: 0, repsLowSpeed: 0, repsAutomatic: 0, repsHit: 14, successRate: 0.7, notes: null, loggedAt: "2026-09-11T09:10:00.000Z" },
    { drillId: "d2", repsTotal: 6, repsWithoutBall: 0, repsLowSpeed: 0, repsAutomatic: 0, repsHit: 3, successRate: 0.5, notes: null, loggedAt: "2026-09-11T09:25:00.000Z" },
  ],
  totalReps: 26,
  drillsCompleted: 1,
  completedDrillIds: ["d1"],
});

/** Fullført — alle drills ferdig, høyt treffvindu. */
export const FULLFORT_OKT: LiveV2Summary = base({
  durationSec: 48 * 60,
  drills: [
    drill({ id: "d1", name: "Gate 20 m", plannedReps: 20 }),
    drill({ id: "d2", name: "Innspill 50 m", plannedReps: 15 }),
  ],
  existingLogs: [
    { drillId: "d1", repsTotal: 22, repsWithoutBall: 0, repsLowSpeed: 0, repsAutomatic: 0, repsHit: 18, successRate: 0.82, notes: null, loggedAt: "2026-09-11T09:20:00.000Z" },
    { drillId: "d2", repsTotal: 15, repsWithoutBall: 0, repsLowSpeed: 0, repsAutomatic: 0, repsHit: 11, successRate: 0.73, notes: null, loggedAt: "2026-09-11T09:45:00.000Z" },
  ],
  totalReps: 37,
  drillsCompleted: 2,
  completedDrillIds: ["d1", "d2"],
});

/** Langt innhold — lang tittel, mange drills, lang coach-kommentar, lange navn. */
export const LANGT_INNHOLD_OKT: LiveV2Summary = base({
  title: "Innspill fra 50 til 80 meter med fokus på treffvindu og distansekontroll under press",
  coachName: "Kristoffer Andreas Johannesen-Bergstrøm",
  durationSec: 71 * 60,
  drills: Array.from({ length: 6 }, (_, i) =>
    drill({
      id: `d${i + 1}`,
      name: `Drill ${i + 1} — svært langt øvelsesnavn som bør brytes pent på smal skjerm uten å sprenge kolonnen`,
      plannedReps: 15,
    }),
  ),
  existingLogs: Array.from({ length: 5 }, (_, i) => ({
    drillId: `d${i + 1}`,
    repsTotal: 15,
    repsWithoutBall: 0,
    repsLowSpeed: 0,
    repsAutomatic: 0,
    repsHit: 10,
    successRate: 0.66,
    notes: null,
    loggedAt: "2026-09-11T09:30:00.000Z",
  })),
  totalReps: 75,
  drillsCompleted: 5,
  completedDrillIds: ["d1", "d2", "d3", "d4", "d5"],
});

/** Eldre sammendrag (før completedDrillIds fantes) — completedSummary uten liveSummary-feltet. */
export const ELDRE_OKT_UTEN_COMPLETED_IDS: LiveV2Summary = base({
  durationSec: 40 * 60,
  drills: [drill({ id: "d1", name: "Gate 20 m", plannedReps: 20 })],
  existingLogs: [
    { drillId: "d1", repsTotal: 18, repsWithoutBall: 0, repsLowSpeed: 0, repsAutomatic: 0, repsHit: 12, successRate: 0.66, notes: null, loggedAt: "2026-09-11T09:15:00.000Z" },
  ],
  totalReps: 18,
  drillsCompleted: 1,
  completedDrillIds: undefined,
  completedSummary: null,
});

/** Allerede lagret spiller-vurdering — for lesemodus i SpillerVurderingForm. */
export const EKSISTERENDE_VURDERING = {
  kvalitet: 4,
  nesteFokus: "Jobbe mer med korte innspill under 30 meter, spesielt fra tett rough.",
  folelse: "fokusert",
  rpe: 6,
};

export const NESTE_OKT = { tekst: "I morgen 09:00 · Puttegrønn", href: "/portal/planlegge" };
