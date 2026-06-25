/** Serialiserbar kontekst for Teknisk plan-fanen i Workbench. */

export type TmGoalRow = {
  id: string;
  metric: string;
  klubb: string;
  baselineValue: number;
  targetValue: number;
  currentValue: number | null;
  progressPct: number | null;
  inTarget: boolean;
};

export type TaskRow = {
  id: string;
  tittel: string;
  beskrivelse: string | null;
  pyramide: string;
  omraade: string;
  koller: string[];
  status: string;
  repsCurrent: number;
  repsTarget: number;
  progressPct: number;
  tmGoals: TmGoalRow[];
};

export type PStabilityBar = {
  /** Kort etikett, f.eks. «P1» */
  label: string;
  pNummer: string;
  navn: string;
  pct: number;
  color: string;
  taskCount: number;
  hovedfokus: boolean;
  tasks: TaskRow[];
};

export type TekniskPlanWorkbenchContext = {
  planId: string;
  navn: string;
  status: string;
  coachName: string | null;
  coachNote: string | null;
  coachNoteDate: string | null;
  repsCurrent: number;
  repsTarget: number;
  progressPct: number;
  pStability: PStabilityBar[];
  /** Svakeste P (lavest stabilitet med oppgaver) — for innsiktslinje */
  weakestP: PStabilityBar | null;
  focusTasks: TaskRow[];
};