/**
 * Workbench uke-/tidslinje-typer — delt mellom load-workbench, hybrid og plan.
 */

import type { OktCompliance } from "./compliance";

export type Axis = "fys" | "tek" | "slag" | "spill" | "turn";

export type WeekEvent = {
  /** DB-id (TrainingPlanSession eller TrainingSessionV2) når eventen kommer fra ekte data. */
  id?: string;
  /** Kilde-tabell — "plan" kan flyttes/slettes/startes; "v2" er egen live-økt. */
  source?: "plan" | "v2";
  /** SessionStatus (V1-vokabular) — styrer Start/Se økt i valgt-panelet. */
  status?: string;
  h: number;
  m?: number;
  durMin: number;
  ax: Axis;
  eb: string;
  ttl: string;
  meta: [icon: string, text: string][];
  /** Plan vs. gjennomført — settes av loaderen for ekte økter. */
  compliance?: OktCompliance;
  chips?: [label: string, cls: string][];
  selected?: boolean;
  group?: boolean;
  tournament?: boolean;
};

export type WeekDay = {
  dow: string;
  date: string;
  today: boolean;
  sub: string;
  nowLine?: { h: number; m: number };
  events: WeekEvent[];
};

export type DirBRowData = {
  time: string;
  ax: Axis;
  axt: string;
  ttl: string;
  meta?: [icon: string, text: string][];
  pills?: [label: string, cls: string][];
  dur: string;
  selected?: boolean;
};

export type DirBDayData = {
  dow: string;
  dt: string;
  mn: string;
  tag?: string;
  tagCls?: string;
  isToday?: boolean;
  summary: { ct: string; dur: string };
  rows: DirBRowData[];
};