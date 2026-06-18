/**
 * Interne Workbench-typer (fasitens session-modell). Egen til denne komponenten —
 * IKKE knyttet til Prisma. Formelen lever i komponent-state, ikke i DB.
 */

import type { Cat } from "./theme";

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
  m?: string;
  pr?: string;
  cs?: string;
  lfase?: string;
  praksis?: string;
  fysType?: string;
  sone?: string;
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

/** Sesongmål (sidebar). */
export type WbGoal = { gn: string; gm: string; ax: Cat };
