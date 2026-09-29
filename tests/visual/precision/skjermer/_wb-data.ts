/** Syntetiske data for Workbench-prøvene (AG-11 m.fl.). Oppdiktede navn, ingen ekte spillere. */
import type { PlanningGoalSummary, SourceItem, WeekViewModel, WorkbenchSession } from "@/lib/domain/workbench/types";
import type { WorkbenchFysTurneringData } from "@/lib/workbench/fys-turnering-data";

export const SPILLER = "Ola Testesen";
export const ROSTER = [
  { id: "p1", navn: SPILLER },
  { id: "p2", navn: "Kari Prøvesen" },
  { id: "p3", navn: "Per Eksempelsen med et svært langt etternavn som må brytes" },
];
export const GRUPPER = [{ id: "g1", navn: "Testgruppe A" }, { id: "g2", navn: "Testgruppe B" }];

const UKE = "2026-09-28";
const dato = (i: number) => `2026-${i < 3 ? "09" : "10"}-${String(i < 3 ? 28 + i : i - 2).padStart(2, "0")}`;

type Rad = [dag: number, start: number, varighet: number, tittel: string, akse: WorkbenchSession["pyramid"], ekstra?: Partial<WorkbenchSession>];
const RADER: Rad[] = [
  [0, 7 * 60, 60, "Styrke underkropp", "FYS", { status: "PUBLISHED", seriesId: "s1", seriesIndex: 0 }],
  [0, 16 * 60, 90, "Innspill 50–100 m", "SLAG", { status: "DRAFT" }],
  [1, 16 * 60, 60, "Ballstart jern", "TEK", { sourceGroupSessionId: "gs1", origin: "GROUP", status: "PUBLISHED" }],
  [1, 17 * 60 + 30, 45, "Putting 3–5 fot med en lang tittel som må brytes over flere linjer", "SLAG", { sourceGroupSessionId: "gs2", localOverride: true, status: "PUBLISHED" }],
  [2, 15 * 60, 120, "Baneplan 9 hull", "SPILL", { status: "DRAFT", needsPlayerApproval: true }],
  [3, 16 * 60, 60, "Tempo og rytme", "TEK", { status: "COMPLETED", perceivedEffort: 6, actualMinutes: 55, load: 330 }],
  [5, 9 * 60, 240, "Klubbturnering", "TURN", { status: "PUBLISHED" }],
];

export const OKTER: WorkbenchSession[] = RADER.map(([d, start, min, title, pyramid, ekstra], i) => ({
  id: `o${i + 1}`, playerId: "p1", coachId: "c1", date: dato(d), startMinute: start, durationMinutes: min, title, pyramid,
  status: "DRAFT", blockType: "OEKT", drills: [], origin: "COACH", createdBy: "COACH",
  createdAt: "2026-09-20T00:00:00Z", updatedAt: "2026-09-20T00:00:00Z", ...ekstra,
}));
OKTER[1].drills = [
  { id: "d1", title: "Innspill 100 m · tre mål", durationMinutes: 30, order: 0, akFormel: { pyramid: "SLAG", area: "INNSPILL_100", label: "SLAG · 100 m", motorikk: "LAV_HAST", press: "OBSERVERT" } },
  { id: "d2", title: "Innspill 50 m · lengdekontroll", durationMinutes: 30, order: 1, akFormel: { pyramid: "SLAG", area: "INNSPILL_50", label: "SLAG · 50 m" } },
  { id: "d3", title: "Styrke kjerne", durationMinutes: 20, order: 2, akFormel: { pyramid: "FYS", area: "STYRKE", label: "FYS · Styrke" } },
];

export function uke(tom = false): WeekViewModel {
  return {
    weekStart: UKE,
    mode: { kind: "AGENCY", subjectId: "p1", sources: [] },
    budget: { plannedMinutes: 555, targetMinutes: 600, byPyramid: { FYS: 60, TEK: 120, SLAG: 135, SPILL: 120, TURN: 240 } },
    weekPlan: tom ? null : {
      id: "wp1", playerId: "p1", isoYear: 2026, weekNumber: 40, weekType: "UTVIKLING", notes: ["TEKNIKK_UKE"],
      plannedHoursFys: 2, plannedHoursTek: 3, plannedHoursSlag: 2.5, plannedHoursSpill: 2, plannedHoursTurn: null, customNotes: "Prøveuke før høstferien.",
    },
    days: Array.from({ length: 7 }, (_, i) => ({
      date: dato(i), weekday: i + 1,
      sessions: tom ? [] : OKTER.filter((s) => s.date === dato(i)),
      lockedBlocks: !tom && i === 2 ? [{ id: "l1", startMinute: 8 * 60, durationMinutes: 6 * 60, title: "Skole", kind: "SKOLE", dimmed: true }] : [],
    })),
  };
}

export const KILDER: SourceItem[] = [
  { id: "k1", kind: "DRILL", title: "Innspill 100 m · tre mål", pyramid: "SLAG", area: "INNSPILL_100", durationMinutes: 30 },
  { id: "k2", kind: "DRILL", title: "Lengdekontroll wedge", pyramid: "SLAG", area: "INNSPILL_50", durationMinutes: 20 },
  { id: "k3", kind: "DRILL", title: "Tempo og rytme", pyramid: "TEK", area: "TEE", durationMinutes: 25 },
  { id: "k4", kind: "DRILL", title: "Knebøy 5 × 5", pyramid: "FYS", area: "STYRKE", durationMinutes: 45 },
  { id: "k5", kind: "TEMPLATE", title: "Standard nærspilløkt", subtitle: "3 øvelser", pyramid: "SLAG", durationMinutes: 60 },
  { id: "k6", kind: "PREVIOUS_WEEK", title: "Man · Innspill 50–100 m", pyramid: "SLAG", durationMinutes: 90 },
  { id: "k7", kind: "TEK", title: "P4.0 · Toppen av baksvingen", subtitle: "Oppgave 2 av 4", pyramid: "TEK", area: "TEE" },
];

export const MAL: PlanningGoalSummary[] = [
  { id: "m1", title: "Putting 3–5 fot", category: "PROCESS", targetDate: "2026-11-30", typeLabel: "Øktfrekvens", planNivaa: "MANED", planNivaaKilde: "valgt",
    fremdrift: { pct: 62, hasData: true, status: "on-track", detail: "8 av 13 økter" }, spor: { planlagt: 13, gjennomfort: 8, uteblitt: 1, gjenstar: 4 }, nesteTiltak: "Legg inn to puttingøkter neste uke." },
  { id: "m2", title: "Handicap under 10", category: "OUTCOME", targetDate: null, typeLabel: "Handicap", planNivaa: "AAR", planNivaaKilde: "foreslatt",
    fremdrift: { pct: 0, hasData: false, status: "no-data", detail: "Ingen data ennå" }, spor: null, nesteTiltak: "Registrer runder." },
];

export const FYS: WorkbenchFysTurneringData = {
  physicalBlocks: [{
    id: "b1", title: "Styrke grunnperiode", status: "CHANGED_AFTER_PUBLISH", periodKind: "GRUNN", startDate: "2026-09-21", endDate: "2026-11-01",
    focus: "Maksstyrke underkropp", notes: null, publishedAt: "2026-09-20T10:00:00Z", changedAfterPublish: true,
    weeks: [0, 1, 2, 3, 4, 5].map((w) => {
      const start = new Date(Date.UTC(2026, 8, 21 + w * 7)).toISOString().slice(0, 10);
      return {
        id: `w${w}`, weekIndex: w, weekStart: start, label: `Uke ${39 + w}`, plannedMinutes: 120 + w * 10, targetTonnageKg: 4000 + w * 250, actualTonnageKg: w < 2 ? 3800 + w * 300 : null,
        sessions: w === 1 ? [
          { id: "f1", date: "2026-09-29", startMinute: 7 * 60, durationMinutes: 60, title: "Styrke underkropp", status: "PUBLISHED", type: "STYRKE", location: null, plannedLoad: 360, actualLoad: null, perceivedEffort: 7, readiness: 4, playerNote: "Tungt i siste serie.", calculatedLoad: 420, actualTonnageKg: 2150,
            exercises: [
              { id: "e1", title: "Knebøy", setsTarget: 5, repsMin: 5, repsMax: 5, weightKg: 70, rirTarget: 2, actualTonnageKg: 1750, logs: [] },
              { id: "e2", title: "Rumensk markløft", setsTarget: 3, repsMin: 8, repsMax: 10, weightKg: 50, rirTarget: null, actualTonnageKg: 400, logs: [] },
            ] },
          { id: "f2", date: "2026-10-01", startMinute: null, durationMinutes: 30, title: "Kondisjon intervaller", status: "DRAFT", type: "KONDISJON", location: null, plannedLoad: null, actualLoad: null, perceivedEffort: null, readiness: null, playerNote: null, calculatedLoad: null, actualTonnageKg: 0, exercises: [] },
        ] : [],
      };
    }),
    conflicts: [{ id: "c1", date: "2026-10-03", type: "TURNERING", severity: "WARN", title: "Turnering samme helg", details: "Tung styrke dagen før gir dårligere restitusjon.", resolutionStatus: "OPEN" }],
  }],
  tournamentPlans: [{
    id: "t1", tournamentEntryId: null, title: "Testturnering høst", status: "DRAFT", focus: "UTVIKLING", format: "Slagspill 36 hull", startDate: "2026-10-03", endDate: "2026-10-04",
    travelStartDate: "2026-10-02", travelEndDate: "2026-10-04", notes: "Fokus på ballstart fra tee.", publishedAt: null,
    preparations: [{ id: "pr1", date: "2026-10-01", title: "Treningsrunde", category: "Treningsrunde", completedAt: null, notes: null }],
    rounds: [
      { id: "r1", roundNumber: 1, date: "2026-10-03", teeTimeMinutes: 9 * 60 + 10, startHole: "1", routine: "Oppvarming 45 min", gamePlan: "Jern fra tee på 7 og 12", grossScore: null, strokesGained: null, source: null, sourceDate: null, notes: null },
      { id: "r2", roundNumber: 2, date: "2026-10-04", teeTimeMinutes: null, startHole: null, routine: null, gamePlan: null, grossScore: null, strokesGained: null, source: null, sourceDate: null, notes: null },
    ],
    goals: [{ id: "tg1", kind: "PROSESS", title: "Samme rutine før hvert slag", targetValue: null, unit: null }],
    latestEvaluation: null, conflicts: [],
  }],
  openConflicts: [],
};

export const TOM_FYS: WorkbenchFysTurneringData = { physicalBlocks: [], tournamentPlans: [], openConflicts: [] };
