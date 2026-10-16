/** Syntetisk teknisk plan for skjermprøvene PH-TP-01, AG-10 og AG-TP-01. Ingen ekte spillere. */
import { planVisning, type TpOppgaveInn, type TpPlanInn, type TpTmInn } from "@/lib/teknisk-plan/tp-visning";

const d = (s: string) => new Date(`${s}T10:00:00Z`);

const tm = (p: Partial<TpTmInn>): TpTmInn => ({
  id: "g", metric: "attack_angle_mean", klubb: "7-jern", baselineValue: -1.2, baselineFrom: "auto-30d", baselineDate: d("2026-08-12"),
  baselineN: 50, targetValue: -5, targetType: "CAUSAL", comparison: "RANGE", rangeMax: -3, currentValue: -2.1, inTarget: false,
  lastUpdated: d("2026-09-24"), protocol: null, windowSize: null, requiredHits: null, corridorMin: null, corridorMax: null,
  currentHits: null, currentBatchSize: null, bestHits: null, currentStreak: null, ...p,
});

const oppgave = (p: Partial<TpOppgaveInn>): TpOppgaveInn => ({
  id: "t", tittel: "", slagNavn: null, pyramide: "TEK", omraade: "", omraadeKode: null, koller: [], motorikk: null, belastning: null,
  press: null, dimensjon: null, sandTrinn: null, maaleutstyr: null, status: "ACTIVE", repsMaalDry: 0, repsMaalLav: 0, repsMaalFull: 0,
  repsGjortDry: 0, repsGjortLav: 0, repsGjortFull: 0, logs: [], maalMatrise: [], tmGoals: [], ...p,
});

export const t1 = oppgave({
  id: "t1", tittel: "Hendene foran ballen i treff", slagNavn: "7-jern lav fade", omraadeKode: "INNSPILL_150", koller: ["7-jern"],
  motorikk: "LAV_HAST", belastning: "TRENINGSOMRAADE", press: "ALENE", dimensjon: "TREFFPUNKT", maaleutstyr: "TRACKMAN",
  repsMaalDry: 60, repsMaalLav: 200, repsMaalFull: 140, repsGjortDry: 60, repsGjortLav: 144, repsGjortFull: 0,
  maalMatrise: [
    { motorikk: "LAV_HAST", belastning: "INNENDORS", maalReps: 140 },
    { motorikk: "LAV_HAST", belastning: "TRENINGSOMRAADE", maalReps: 260 },
    { motorikk: "LAV_HAST", belastning: "BANE", maalReps: 80 },
  ],
  logs: [
    { id: "l1", reps: 40, hastighet: "LAV", belastning: "TRENINGSOMRAADE", notater: "Kjentes riktig i lav fart. Mistet det mot slutten av serien.", sessionV2Id: "s1", trackmanShotId: null, loggedAt: d("2026-09-26") },
    { id: "l4", reps: 24, hastighet: "LAV", belastning: "INNENDORS", notater: null, sessionV2Id: null, trackmanShotId: "shot1", loggedAt: d("2026-09-24") },
  ],
  tmGoals: [
    tm({ id: "g1" }),
    tm({ id: "g2", metric: "face_to_path_mean", baselineValue: 0.4, targetValue: -2.5, rangeMax: -1, currentValue: -1.4, inTarget: true }),
    tm({ id: "h1", targetType: "HIT_RATE", protocol: "ROLLING_WINDOW", windowSize: 20, requiredHits: 16, currentHits: 12, currentBatchSize: 20 }),
  ],
});

const t2 = oppgave({
  id: "t2", tittel: "Køllen inn fra innsiden", slagNavn: "Driver høy draw", omraadeKode: "TEE_TOTAL", koller: ["Driver"],
  motorikk: "UTEN_BALL", belastning: "INNENDORS", press: "ALENE", dimensjon: "STARTRETNING", maaleutstyr: "TRACKMAN",
  repsMaalDry: 60, repsMaalLav: 80, repsGjortDry: 48,
  logs: [{ id: "l3", reps: 48, hastighet: "DRY", belastning: "INNENDORS", notater: "Speilet hjalp. Usikker på skaftvinkel.", sessionV2Id: null, trackmanShotId: null, loggedAt: d("2026-09-25") }],
  tmGoals: [tm({ id: "g3", metric: "club_path_mean", klubb: "Driver", baselineValue: -3.4, targetValue: 1, rangeMax: 3, currentValue: null, lastUpdated: null }),
    tm({ id: "h2", targetType: "HIT_RATE", protocol: "STREAK", requiredHits: 5, currentStreak: 2 })],
});

const t3 = oppgave({
  id: "t3", tittel: "Stabilt treff på pitch 30–50 m med et langt navn som må brytes pent over flere linjer", slagNavn: "54° pitch lav",
  omraadeKode: "PITCH", koller: ["54°"], belastning: "TRENINGSOMRAADE", press: "OBSERVERT", dimensjon: "LENGDEKONTROLL", maaleutstyr: "UTEN",
  repsMaalFull: 150, repsGjortFull: 90,
  logs: [{ id: "l2", reps: 30, hastighet: "FULL", belastning: "TRENINGSOMRAADE", notater: null, sessionV2Id: "s2", trackmanShotId: null, loggedAt: d("2026-09-26") }],
});

const t4 = oppgave({ id: "t4", tittel: "Kortere baksving", omraadeKode: null, omraade: "", koller: [] });

export const tpPlanInn: TpPlanInn = {
  id: "plan1", navn: "Teknisk plan høst 2026", status: "ACTIVE", userId: "u1", opprettetAv: { name: "Testcoach" },
  positions: [
    { id: "p7", pNummer: "P7.0", sortOrder: 0, hovedfokus: true, tasks: [t1, t3] },
    { id: "p6", pNummer: "P6.0", sortOrder: 1, hovedfokus: true, tasks: [t2] },
    { id: "p41", pNummer: "P4.1", sortOrder: 2, hovedfokus: false, tasks: [t4] },
  ],
};

export const tpPlan = planVisning(tpPlanInn);
export const tpTom = planVisning({ ...tpPlanInn, positions: [] });
