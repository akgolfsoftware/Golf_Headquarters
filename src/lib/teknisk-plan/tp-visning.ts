/**
 * Teknisk plan i Precision Athletics — fra databasen til skjermen.
 *
 * Felles for PH-TP-01 (spiller), AG-10 og AG-TP-01 (coach). Tegningene ligger i
 * Claude Design 7d7c2994 (ui_kits/_shared/tp-parts.jsx, data-tp.js). Designets
 * begreper er oversatt til de ekte modellene etter porteringsplanen §9
 * (docs/planer/portering-skjermer-2026-09-27.md):
 *
 *   læringssteg      → PositionTask.repsMaal/Gjort Dry · Lav · Full (motorikk)
 *   miljø            → PositionTaskMaal.belastning (mål) og PositionTaskLog.belastning (gjort)
 *   TrackMan-mål     → PositionTaskTmGoal (alle unntatt HIT_RATE)
 *   treffprotokoll   → første PositionTaskTmGoal med targetType HIT_RATE
 *   registreringer   → PositionTaskLog
 *
 * Det som ikke finnes i basen (publiseringsdato, kvalitetssjekk, coachens svar,
 * før og nå-bilder, posisjonsstatus) er null her og vises som «—» eller tom
 * tilstand. Ingenting diktes opp, og ingenting her sperrer neste steg.
 *
 * Ren modul uten database — testet i tp-visning.test.ts.
 */

import {
  BELASTNING_KODER,
  BELASTNING_LABEL,
  DIMENSJON_LABEL,
  MAALEUTSTYR_LABEL,
  MOTORIKK_KODER,
  MOTORIKK_LABEL,
  SAND_TRINN_LABEL,
  erOmraadeKode,
  formelStreng,
  omraadeDef,
  omraadeFamilie,
  type BelastningKode,
  type DimensjonKode,
  type MaaleutstyrKode,
  type MotorikkKode,
  type OmraadeKode,
  type PressKode,
  type PyramideKode,
  type SandTrinnKode,
} from "@/lib/domain/ak-formel-v2";
import { vaskMotRelevans } from "@/lib/domain/omrade-relevans";
import { P_POSITIONS, hovedP, omraadeTilKode, pNavn } from "@/components/teknisk-plan/constants";
import { sorterPosisjoner } from "@/lib/teknisk-plan/sorter-posisjoner";

// ---------------------------------------------------------------------------
// Faste lister
// ---------------------------------------------------------------------------

/** Faser over posisjonslinjen (tegningen: Baksving P1–P4 · Nedsving P5–P7 · Gjennomsving P8–P10). */
export const TP_FASER = [
  { navn: "Baksving", fra: "P1–P4", antall: 4 },
  { navn: "Nedsving", fra: "P5–P7", antall: 3 },
  { navn: "Gjennomsving", fra: "P8–P10", antall: 3 },
] as const;

export const TP_POSISJONER: readonly { pNummer: string; navn: string }[] = P_POSITIONS.map((p) => ({
  pNummer: p.num,
  navn: p.name,
}));

/** Utstyr som gir TrackMan-mål (designet: RADAR). */
export const RADAR_UTSTYR: readonly MaaleutstyrKode[] = ["TRACKMAN", "FLIGHTSCOPE", "GARMIN_R10", "MEVO_PLUS"];

/**
 * TrackMan-parametre som faktisk regnes ut ved import (update-tm-goals.ts ›
 * seriesForMetric). Et mål på en annen parameter ville aldri fått «nå»-verdi.
 */
export const TM_PARAMETRE: readonly { metric: string; navn: string; enhet: string; desimaler: number }[] = [
  { metric: "attack_angle_mean", navn: "Attack Angle", enhet: "°", desimaler: 1 },
  { metric: "club_path_mean", navn: "Club Path", enhet: "°", desimaler: 1 },
  { metric: "face_angle_mean", navn: "Face Angle", enhet: "°", desimaler: 1 },
  { metric: "face_to_path_mean", navn: "Face to Path", enhet: "°", desimaler: 1 },
  { metric: "launch_angle_mean", navn: "Launch Angle", enhet: "°", desimaler: 1 },
  { metric: "smash_factor_mean", navn: "Smash Factor", enhet: "", desimaler: 2 },
  { metric: "club_speed_mean", navn: "Club Speed", enhet: "mph", desimaler: 1 },
  { metric: "ball_speed_mean", navn: "Ball Speed", enhet: "mph", desimaler: 1 },
  { metric: "carry_mean", navn: "Carry", enhet: "m", desimaler: 1 },
  { metric: "spin_rate_mean", navn: "Spin Rate", enhet: "rpm", desimaler: 0 },
  { metric: "side_std", navn: "Sidespredning", enhet: "m", desimaler: 1 },
  { metric: "attack_angle_std", navn: "Attack Angle, spredning", enhet: "°", desimaler: 1 },
  { metric: "club_path_std", navn: "Club Path, spredning", enhet: "°", desimaler: 1 },
  { metric: "face_angle_std", navn: "Face Angle, spredning", enhet: "°", desimaler: 1 },
  { metric: "face_to_path_std", navn: "Face to Path, spredning", enhet: "°", desimaler: 1 },
  { metric: "launch_angle_std", navn: "Launch Angle, spredning", enhet: "°", desimaler: 1 },
  { metric: "smash_factor_std", navn: "Smash Factor, spredning", enhet: "", desimaler: 2 },
  { metric: "spin_rate_std", navn: "Spin Rate, spredning", enhet: "rpm", desimaler: 0 },
];

export function tmParameter(metric: string) {
  return TM_PARAMETRE.find((p) => p.metric === metric) ?? { metric, navn: metric.replace(/_/g, " "), enhet: "", desimaler: 1 };
}

export type Protokolltype = "ROLLING_WINDOW" | "BEST_OF_N" | "STREAK" | "SESSION_GATE";

export const PROTOKOLL_NAVN: Record<Protokolltype, string> = {
  ROLLING_WINDOW: "Rullende vindu",
  BEST_OF_N: "Beste av N",
  STREAK: "Streak",
  SESSION_GATE: "Økt-gate",
};

/** Protokollen i én setning (tegningen: data-tp.js › protoText). */
export function protokollTekst(type: Protokolltype, antall: number | null, treff: number | null): string {
  const n = antall ?? "—";
  const t = treff ?? "—";
  switch (type) {
    case "ROLLING_WINDOW":
      return `${t} av de siste ${n} slagene innenfor målboksen`;
    case "BEST_OF_N":
      return `Minst ${t} av ${n} slag innenfor målboksen i én serie`;
    case "STREAK":
      return `${t} slag på rad innenfor målboksen`;
    case "SESSION_GATE":
      return `Innenfor målboksen i ${t} av ${n} økter`;
  }
}

const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" });
/** «27.09.2026». Tegningen skriver dato slik overalt. */
export function dato(d: Date | null | undefined): string {
  return d ? OSLO_DATO.format(d) : "—";
}

// ---------------------------------------------------------------------------
// Inndata — formen Prisma-spørringen i tp-last.ts gir
// ---------------------------------------------------------------------------

export type TpLoggInn = {
  id: string;
  reps: number;
  hastighet: "DRY" | "LAV" | "FULL";
  belastning: BelastningKode | null;
  notater: string | null;
  sessionV2Id: string | null;
  trackmanShotId: string | null;
  loggedAt: Date;
};

export type TpMaalInn = { motorikk: MotorikkKode; belastning: BelastningKode; maalReps: number };

export type TpTmInn = {
  id: string;
  metric: string;
  klubb: string;
  baselineValue: number;
  baselineFrom: string;
  baselineDate: Date;
  baselineN: number | null;
  targetValue: number;
  targetType: "PRIMARY" | "SECONDARY" | "CAUSAL" | "HIT_RATE";
  comparison: "LESS_THAN" | "GREATER_THAN" | "RANGE" | "EQUAL";
  rangeMax: number | null;
  currentValue: number | null;
  inTarget: boolean;
  lastUpdated: Date | null;
  protocol: Protokolltype | null;
  windowSize: number | null;
  requiredHits: number | null;
  corridorMin: number | null;
  corridorMax: number | null;
  currentHits: number | null;
  currentBatchSize: number | null;
  bestHits: number | null;
  currentStreak: number | null;
};

export type TpOppgaveInn = {
  id: string;
  tittel: string;
  slagNavn: string | null;
  pyramide: PyramideKode;
  omraade: string;
  omraadeKode: OmraadeKode | null;
  koller: string[];
  motorikk: MotorikkKode | null;
  belastning: BelastningKode | null;
  press: PressKode | null;
  dimensjon: DimensjonKode | null;
  sandTrinn: SandTrinnKode | null;
  maaleutstyr: MaaleutstyrKode | null;
  status: "PENDING" | "ACTIVE" | "DONE" | "ARCHIVED";
  repsMaalDry: number;
  repsMaalLav: number;
  repsMaalFull: number;
  repsGjortDry: number;
  repsGjortLav: number;
  repsGjortFull: number;
  logs: TpLoggInn[];
  maalMatrise: TpMaalInn[];
  tmGoals: TpTmInn[];
};

export type TpPosisjonInn = {
  id: string;
  pNummer: string;
  sortOrder: number;
  hovedfokus: boolean;
  tasks: TpOppgaveInn[];
};

export type TpPlanInn = {
  id: string;
  navn: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  userId: string;
  opprettetAv: { name: string | null } | null;
  positions: TpPosisjonInn[];
};

// ---------------------------------------------------------------------------
// Utdata — det skjermene tegner
// ---------------------------------------------------------------------------

export type TpSteg = { navn: string; gjort: number; maal: number | null };
export type TpMiljo = { kode: BelastningKode; navn: string; gjort: number; maal: number | null };

export type TpTmRad = {
  id: string;
  navn: string;
  enhet: string;
  desimaler: number;
  utgangspunkt: number | null;
  /** Målboksen. null i én ende = åpen boks («under 3,0»). */
  fra: number | null;
  til: number | null;
  naa: number | null;
  innenfor: boolean | null;
  klubb: string;
  utgangspunktDato: string;
  sistMaalt: string;
};

export type TpProtokoll = { type: Protokolltype; navn: string; tekst: string; naa: string };

export type TpOppgave = {
  id: string;
  pNummer: string;
  hovedP: string;
  posisjonNavn: string;
  tittel: string;
  slag: string;
  omraade: string;
  fokus: string;
  status: string;
  formel: string | null;
  familie: "FULLSVING" | "BUNKER" | "ANNET";
  steg: TpSteg[];
  miljo: TpMiljo[];
  gjort: number;
  maal: number;
  kilde: string;
  utstyr: string | null;
  harRadar: boolean;
  tm: TpTmRad[];
  protokoll: TpProtokoll | null;
};

export type TpLogg = {
  id: string;
  dato: string;
  oppgaveId: string;
  oppgave: string;
  pNummer: string;
  reps: number;
  steg: string | null;
  miljo: string | null;
  kilde: string;
  kommentar: string | null;
};

export type TpPlan = {
  id: string;
  navn: string;
  status: string;
  statusTone: "ok" | "neutral" | "warn";
  /** Publiseringsdato finnes ikke i basen (tillegg D4). */
  publisert: null;
  hovedfokus: string[];
  coach: string | null;
  gjort: number;
  maal: number;
  kilde: string;
  sistRegistrert: string;
  oppgaver: TpOppgave[];
  logg: TpLogg[];
};

const PLANSTATUS: Record<TpPlanInn["status"], [string, TpPlan["statusTone"]]> = {
  DRAFT: ["Utkast", "neutral"],
  ACTIVE: ["Aktiv", "ok"],
  ARCHIVED: ["Arkivert", "warn"],
};

const OPPGAVESTATUS: Record<TpOppgaveInn["status"], string> = {
  PENDING: "Ikke startet",
  ACTIVE: "Aktiv",
  DONE: "Fullført",
  ARCHIVED: "Arkivert",
};

/** RepHastighet (v1-loggen) → læringssteg. */
export const HASTIGHET_TIL_MOTORIKK: Record<TpLoggInn["hastighet"], MotorikkKode> = {
  DRY: "UTEN_BALL",
  LAV: "LAV_HAST",
  FULL: "AUTO",
};

function kildeFor(l: Pick<TpLoggInn, "sessionV2Id" | "trackmanShotId">): string {
  if (l.trackmanShotId) return "TrackMan";
  if (l.sessionV2Id) return "Live-økt";
  return "Manuelt";
}

/** «LIVE-ØKT · MANUELT · 26.09.2026», eller null uten registreringer. */
function kildelinje(logs: readonly TpLoggInn[]): string | null {
  if (logs.length === 0) return null;
  const rekke = ["Live-økt", "TrackMan", "Manuelt"];
  const kilder = new Set(logs.map(kildeFor));
  const siste = logs.reduce((a, l) => (l.loggedAt > a ? l.loggedAt : a), logs[0].loggedAt);
  return [...rekke.filter((k) => kilder.has(k)), dato(siste)].join(" · ").toUpperCase();
}

function omraadeKodeFor(t: Pick<TpOppgaveInn, "omraadeKode" | "omraade">): OmraadeKode | null {
  if (t.omraadeKode) return t.omraadeKode;
  const k = omraadeTilKode(t.omraade);
  return k && erOmraadeKode(k) ? k : null;
}

export function familieFor(kode: OmraadeKode | null): TpOppgave["familie"] {
  if (!kode) return "ANNET";
  if (kode === "BUNKER") return "BUNKER";
  return omraadeFamilie(kode) === "FULLSVING" ? "FULLSVING" : "ANNET";
}

/** AK-formelen. Ledd som ikke gjelder området utelates (vaskes mot relevansmatrisen). */
export function formelFor(t: {
  pyramide: PyramideKode;
  omraadeKode: OmraadeKode | null;
  motorikk: MotorikkKode | null;
  belastning: BelastningKode | null;
  press: PressKode | null;
}): string | null {
  if (!t.omraadeKode) return null;
  const v = vaskMotRelevans({
    omraade: t.omraadeKode,
    motorikk: t.motorikk,
    belastning: t.belastning,
    press: t.press,
    dimensjon: null,
    sandTrinn: null,
  });
  return formelStreng({ pyramide: t.pyramide, omraade: t.omraadeKode, motorikk: v.motorikk, belastning: v.belastning, press: v.press });
}

function stegFor(t: TpOppgaveInn, familie: TpOppgave["familie"]): TpSteg[] {
  const par: Record<MotorikkKode, [number, number]> = {
    UTEN_BALL: [t.repsGjortDry, t.repsMaalDry],
    LAV_HAST: [t.repsGjortLav, t.repsMaalLav],
    AUTO: [t.repsGjortFull, t.repsMaalFull],
  };
  if (familie === "FULLSVING") {
    return MOTORIKK_KODER.map((m) => ({ navn: MOTORIKK_LABEL[m], gjort: par[m][0], maal: par[m][1] > 0 ? par[m][1] : null }));
  }
  const gjort = t.repsGjortDry + t.repsGjortLav + t.repsGjortFull;
  const maal = t.repsMaalDry + t.repsMaalLav + t.repsMaalFull;
  const navn = familie === "BUNKER" && t.sandTrinn ? `Repetisjoner · ${SAND_TRINN_LABEL[t.sandTrinn]}` : "Repetisjoner";
  return [{ navn, gjort, maal: maal > 0 ? maal : null }];
}

function miljoFor(t: TpOppgaveInn): TpMiljo[] {
  return BELASTNING_KODER.map((b) => {
    const celler = t.maalMatrise.filter((c) => c.belastning === b);
    const maal = celler.reduce((s, c) => s + c.maalReps, 0);
    const gjort = t.logs.filter((l) => l.belastning === b).reduce((s, l) => s + l.reps, 0);
    return { kode: b, navn: BELASTNING_LABEL[b], gjort, maal: maal > 0 ? maal : null };
  });
}

function tmRadFor(g: TpTmInn): TpTmRad {
  const p = tmParameter(g.metric);
  let fra: number | null = g.targetValue;
  let til: number | null = g.targetValue;
  if (g.comparison === "RANGE") til = g.rangeMax ?? null;
  else if (g.comparison === "LESS_THAN") fra = null;
  else if (g.comparison === "GREATER_THAN") til = null;
  // «ingen» = målet ble laget uten TrackMan-økt å hente utgangspunkt fra.
  const harUtgangspunkt = g.baselineFrom !== "ingen";
  return {
    id: g.id,
    navn: p.navn,
    enhet: p.enhet,
    desimaler: p.desimaler,
    utgangspunkt: harUtgangspunkt ? g.baselineValue : null,
    fra,
    til,
    naa: g.currentValue,
    innenfor: g.currentValue == null ? null : g.inTarget,
    klubb: g.klubb,
    utgangspunktDato: harUtgangspunkt ? dato(g.baselineDate) : "—",
    sistMaalt: dato(g.lastUpdated),
  };
}

function protokollFor(goals: readonly TpTmInn[]): TpProtokoll | null {
  const g = goals.find((x) => x.targetType === "HIT_RATE" && x.protocol);
  if (!g || !g.protocol) return null;
  const type = g.protocol;
  let naa = "—";
  if (type === "BEST_OF_N") naa = g.bestHits != null ? `beste serie ${g.bestHits} av ${g.windowSize ?? "—"}` : "—";
  else if (type === "STREAK") naa = g.currentStreak != null ? `rekke ${g.currentStreak}` : "—";
  else if (g.currentHits != null && g.currentBatchSize != null) naa = `${g.currentHits} av ${g.currentBatchSize}`;
  return { type, navn: PROTOKOLL_NAVN[type], tekst: protokollTekst(type, g.windowSize, g.requiredHits), naa };
}

export function oppgaveVisning(t: TpOppgaveInn, pNummer: string): TpOppgave {
  const kode = omraadeKodeFor(t);
  const familie = familieFor(kode);
  const steg = stegFor(t, familie);
  return {
    id: t.id,
    pNummer,
    hovedP: hovedP(pNummer),
    posisjonNavn: pNavn(pNummer),
    tittel: t.tittel,
    slag: t.slagNavn?.trim() || "—",
    omraade: kode ? omraadeDef(kode).label : t.omraade || "—",
    fokus: t.dimensjon ? DIMENSJON_LABEL[t.dimensjon] : "—",
    status: OPPGAVESTATUS[t.status],
    formel: formelFor({ pyramide: t.pyramide, omraadeKode: kode, motorikk: t.motorikk, belastning: t.belastning, press: t.press }),
    familie,
    steg,
    miljo: miljoFor(t),
    gjort: steg.reduce((s, x) => s + x.gjort, 0),
    maal: steg.reduce((s, x) => s + (x.maal ?? 0), 0),
    kilde: kildelinje(t.logs) ?? "INGEN REGISTRERINGER ENNÅ",
    utstyr: t.maaleutstyr ? MAALEUTSTYR_LABEL[t.maaleutstyr] : null,
    harRadar: t.maaleutstyr ? RADAR_UTSTYR.includes(t.maaleutstyr) : false,
    tm: t.tmGoals.filter((g) => g.targetType !== "HIT_RATE").map(tmRadFor),
    protokoll: protokollFor(t.tmGoals),
  };
}

export function planVisning(plan: TpPlanInn, opts: { loggAntall?: number } = {}): TpPlan {
  const posisjoner = sorterPosisjoner(plan.positions);
  const oppgaver: TpOppgave[] = [];
  const logg: TpLogg[] = [];
  const alleLogger: TpLoggInn[] = [];
  for (const pos of posisjoner) {
    for (const t of pos.tasks) {
      if (t.status === "ARCHIVED") continue;
      const v = oppgaveVisning(t, pos.pNummer);
      oppgaver.push(v);
      alleLogger.push(...t.logs);
      for (const l of t.logs) {
        logg.push({
          id: l.id,
          dato: dato(l.loggedAt),
          oppgaveId: t.id,
          oppgave: t.tittel,
          pNummer: pos.pNummer,
          reps: l.reps,
          steg: v.familie === "FULLSVING" ? MOTORIKK_LABEL[HASTIGHET_TIL_MOTORIKK[l.hastighet]] : null,
          miljo: l.belastning ? BELASTNING_LABEL[l.belastning] : null,
          kilde: kildeFor(l),
          kommentar: l.notater?.trim() || null,
        });
      }
    }
  }
  const tidspunkt = new Map(alleLogger.map((l) => [l.id, l.loggedAt.getTime()]));
  logg.sort((a, b) => (tidspunkt.get(b.id) ?? 0) - (tidspunkt.get(a.id) ?? 0));
  const siste = alleLogger.length ? alleLogger.reduce((a, l) => (l.loggedAt > a ? l.loggedAt : a), alleLogger[0].loggedAt) : null;
  const [status, statusTone] = PLANSTATUS[plan.status];
  return {
    id: plan.id,
    navn: plan.navn,
    status,
    statusTone,
    publisert: null,
    hovedfokus: [...new Set(posisjoner.filter((p) => p.hovedfokus).map((p) => hovedP(p.pNummer)))],
    coach: plan.opprettetAv?.name ?? null,
    gjort: oppgaver.reduce((s, o) => s + o.gjort, 0),
    maal: oppgaver.reduce((s, o) => s + o.maal, 0),
    kilde: kildelinje(alleLogger)?.replace(/ · \d{2}\.\d{2}\.\d{4}$/, "") ?? "INGEN REGISTRERINGER ENNÅ",
    sistRegistrert: dato(siste),
    oppgaver,
    logg: logg.slice(0, opts.loggAntall ?? 12),
  };
}

// ---------------------------------------------------------------------------
// Oppgaveskjemaet (AG-TP-01)
// ---------------------------------------------------------------------------

export type TpSkjemaTm = { id: string | null; metric: string; fra: number; til: number };

export type TpSkjema = {
  id: string | null;
  pNummer: string | null;
  tittel: string;
  slagNavn: string;
  omraadeKode: OmraadeKode | null;
  motorikk: MotorikkKode | null;
  sandTrinn: SandTrinnKode | null;
  dimensjon: DimensjonKode | null;
  kolle: string | null;
  belastning: BelastningKode | null;
  press: PressKode | null;
  maaleutstyr: MaaleutstyrKode | null;
  tm: TpSkjemaTm[];
  /** Rep-mål per læringssteg (fullsving). */
  repSteg: Record<MotorikkKode, number>;
  /** Ett rep-mål når området ikke har læringssteg. */
  rep: number;
  /** Rep-mål per miljø. */
  repMiljo: Partial<Record<BelastningKode, number>>;
  protokoll: { type: Protokolltype; antall: number; treff: number } | null;
};

export const TOMT_SKJEMA: TpSkjema = {
  id: null,
  pNummer: null,
  tittel: "",
  slagNavn: "",
  omraadeKode: null,
  motorikk: null,
  sandTrinn: null,
  dimensjon: null,
  kolle: null,
  belastning: null,
  press: null,
  maaleutstyr: null,
  tm: [],
  repSteg: { UTEN_BALL: 0, LAV_HAST: 0, AUTO: 0 },
  rep: 0,
  repMiljo: {},
  protokoll: null,
};

export function skjemaFraOppgave(t: TpOppgaveInn, pNummer: string): TpSkjema {
  const kode = omraadeKodeFor(t);
  const fullsving = familieFor(kode) === "FULLSVING";
  const repMiljo: Partial<Record<BelastningKode, number>> = {};
  for (const c of t.maalMatrise) repMiljo[c.belastning] = (repMiljo[c.belastning] ?? 0) + c.maalReps;
  const hr = t.tmGoals.find((g) => g.targetType === "HIT_RATE" && g.protocol);
  return {
    id: t.id,
    pNummer,
    tittel: t.tittel,
    slagNavn: t.slagNavn ?? "",
    omraadeKode: kode,
    motorikk: t.motorikk,
    sandTrinn: t.sandTrinn,
    dimensjon: t.dimensjon,
    kolle: t.koller[0] ?? null,
    belastning: t.belastning,
    press: t.press,
    maaleutstyr: t.maaleutstyr,
    tm: t.tmGoals
      .filter((g) => g.targetType !== "HIT_RATE")
      .map((g) => {
        const r = tmRadFor(g);
        return { id: g.id, metric: g.metric, fra: r.fra ?? g.targetValue, til: r.til ?? g.targetValue };
      }),
    repSteg: { UTEN_BALL: t.repsMaalDry, LAV_HAST: t.repsMaalLav, AUTO: t.repsMaalFull },
    rep: fullsving ? 0 : t.repsMaalDry + t.repsMaalLav + t.repsMaalFull,
    repMiljo,
    protokoll: hr?.protocol
      ? { type: hr.protocol, antall: hr.windowSize ?? 20, treff: hr.requiredHits ?? 16 }
      : null,
  };
}
