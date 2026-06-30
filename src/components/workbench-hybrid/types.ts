/**
 * Interne Workbench-typer (fasitens session-modell). Egen til denne komponenten —
 * IKKE knyttet til Prisma. Formelen lever i komponent-state, ikke i DB.
 */

import type { Cat } from "./theme";

/** Gjentakelse (Google-kalender-stil). Lever kun i komponent-state. */
export type RecurFreq = "none" | "daily" | "weekly" | "monthly";
export type RecurEnd = "never" | "count" | "date";
export type Recur = {
  freq: RecurFreq;
  /** "hver N." */
  interval: number;
  /** ukedager (kun weekly) */
  days: WeekKey[];
  endType: RecurEnd;
  endCount: number;
  /** "31.08.2026" */
  endDate: string;
};

/** En økt slik fasiten modellerer den (mer detaljert enn WorkbenchData). */
export type WbSession = {
  id: string;
  title: string;
  /** varighet i minutter */
  dur: number;
  cat: Cat;
  /** "16:00" eller "—" for ikke-tidssatt */
  time: string;
  // AK-formel-dimensjoner (alle valgfrie; defaults i buildDimensions)
  omr?: string | string[];
  /** P-posisjoner (P1–P10, multi-valg). */
  ppos?: string[];
  m?: string;
  pr?: string;
  cs?: string;
  lfase?: string;
  praksis?: string;
  fysType?: string;
  sone?: string;
  /** Gjentakelse — null/undefined = kun denne uka. */
  recur?: Recur | null;
};

/** Ukens 7 dager (man..son). */
export type WeekKey = "man" | "tir" | "ons" | "tor" | "fre" | "lor" | "son";

export type WeekState = Record<WeekKey, WbSession[]>;

/** Palette-mal (standardøkt). */
export type PaletteItem = {
  pid: string;
  title: string;
  dur: number;
  cat: Cat;
  omr?: string;
  ppos?: string[];
  m?: string;
  pr?: string;
  cs?: string;
  lfase?: string;
  praksis?: string;
  fysType?: string;
  sone?: string;
};

export type ZoomLevel = "arsplan" | "ar" | "maned" | "uke" | "dag";

export type WorkbenchRole = "player" | "coach";

/** Turnering (header-banner + sidebar). */
export type WbTournament = {
  title: string;
  /** "29.06.2026" */
  date?: string;
  /** dager til (avledet fra ekte data) */
  days?: number;
  /** ferdigformatert "12 dg" fra ekte data */
  dateLabel?: string;
  type?: keyof typeof import("./theme").TOUR_TYPES;
};

/** Sesongmål (sidebar + sesongmål-fane). */
export type WbGoal = {
  gn: string;
  gm: string;
  ax: Cat;
  targetValue?: number | null;
  progressPct?: number | null;
};

/** Treningssamling i en periode (fasit `samlinger`). */
export type WbSamling = { title: string; date: string; time: string; org: string };

/** Periodetype (fasit `seasonPhases.type`). */
export type SeasonPhaseType = "GRUNN" | "SPESIALISERING" | "TURNERING" | "EVALUERING" | "FERIE";

/**
 * En sesong-periode i Årsplan/periodisering (fasit `seasonPhases`). `months` er
 * antall måneder periodens band spenner over; `weekly` er ukentlige økter per akse.
 */
export type SeasonPhase = {
  type: SeasonPhaseType;
  months: number;
  /** "Jan–Feb" */
  span: string;
  weekly: Record<Cat, number>;
  samlinger: WbSamling[];
};
