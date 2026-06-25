import { P_POSITIONS } from "@/components/teknisk-plan/constants";
import type { PStabilityBar, TaskRow, TmGoalRow } from "./types";

type TaskInput = {
  id: string;
  tittel: string;
  beskrivelse: string | null;
  pyramide: string;
  omraade: string;
  koller: string[];
  status: string;
  repsMaalDry: number;
  repsMaalLav: number;
  repsMaalFull: number;
  repsGjortDry: number;
  repsGjortLav: number;
  repsGjortFull: number;
  tmGoals: {
    id: string;
    metric: string;
    klubb: string;
    baselineValue: number;
    targetValue: number;
    currentValue: number | null;
    progressPct: number | null;
    inTarget: boolean;
  }[];
};

type PositionInput = {
  pNummer: string;
  navn: string;
  hovedfokus: boolean;
  tasks: TaskInput[];
};

function stabilityColor(pct: number): string {
  if (pct >= 70) return "#D1F843";
  if (pct >= 50) return "#56C59A";
  if (pct >= 30) return "#E8A33D";
  return "#F2908C";
}

function mapTask(t: TaskInput): TaskRow {
  const repsTarget = t.repsMaalDry + t.repsMaalLav + t.repsMaalFull;
  const repsCurrent = t.repsGjortDry + t.repsGjortLav + t.repsGjortFull;
  const progressPct =
    repsTarget > 0 ? Math.min(100, Math.round((repsCurrent / repsTarget) * 100)) : 0;
  const tmGoals: TmGoalRow[] = t.tmGoals.map((g) => ({
    id: g.id,
    metric: g.metric,
    klubb: g.klubb,
    baselineValue: g.baselineValue,
    targetValue: g.targetValue,
    currentValue: g.currentValue,
    progressPct: g.progressPct,
    inTarget: g.inTarget,
  }));
  return {
    id: t.id,
    tittel: t.tittel,
    beskrivelse: t.beskrivelse,
    pyramide: t.pyramide,
    omraade: t.omraade,
    koller: t.koller,
    status: t.status,
    repsCurrent,
    repsTarget,
    progressPct,
    tmGoals,
  };
}

/** Aggregerer P1.0–P10.0-stabilitet fra rep-fremdrift per posisjon. */
export function computePStability(positions: PositionInput[]): PStabilityBar[] {
  const byNum = new Map(positions.map((p) => [p.pNummer, p]));

  return P_POSITIONS.map((pDef) => {
    const pos = byNum.get(pDef.num);
    const tasks = pos?.tasks ?? [];
    const mappedTasks = tasks.map(mapTask);

    if (tasks.length === 0) {
      return {
        label: pDef.num.replace(".0", ""),
        pNummer: pDef.num,
        navn: pDef.name,
        pct: 0,
        color: stabilityColor(0),
        taskCount: 0,
        hovedfokus: pos?.hovedfokus ?? false,
        tasks: mappedTasks,
      };
    }

    const pcts = mappedTasks.map((t) => t.progressPct);
    const pct = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length);

    return {
      label: pDef.num.replace(".0", ""),
      pNummer: pDef.num,
      navn: pos?.navn ?? pDef.name,
      pct,
      color: stabilityColor(pct),
      taskCount: tasks.length,
      hovedfokus: pos?.hovedfokus ?? false,
      tasks: mappedTasks,
    };
  });
}

export function findWeakestP(bars: PStabilityBar[]): PStabilityBar | null {
  const withTasks = bars.filter((b) => b.taskCount > 0);
  if (withTasks.length === 0) return null;
  return withTasks.reduce((min, b) => (b.pct < min.pct ? b : min), withTasks[0]);
}