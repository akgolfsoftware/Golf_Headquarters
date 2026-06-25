/**
 * Workbench uke-/tidslinje-typer — delt mellom load-workbench, hybrid og plan.
 * Demo-literals ligger fortsatt i `components/workbench/data.ts`.
 */

export type Axis = "fys" | "tek" | "slag" | "spill" | "turn";

export type WeekEvent = {
  /** DB-id (TrainingPlanSession) når eventen kommer fra ekte data. */
  id?: string;
  h: number;
  m?: number;
  durMin: number;
  ax: Axis;
  eb: string;
  ttl: string;
  meta: [icon: string, text: string][];
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