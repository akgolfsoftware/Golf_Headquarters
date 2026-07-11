import { PYR_REKKEFOLGE } from "@/lib/pyramide";
import type { PyramidArea, SessionStatus } from "@/generated/prisma/client";
import type { PhaseStatus } from "./_pyr-color";

type SessionWithRel = {
  id: string;
  scheduledAt: Date;
  durationMin: number;
  pyramidArea: PyramidArea;
  status: SessionStatus;
};

export type Fase = {
  key: string;
  ukeLabel: string;
  dateLabel: string;
  dateRangeLabel: string;
  status: PhaseStatus;
  totalSessions: number;
  done: number;
  totMin: number;
  pyrFordeling: Record<PyramidArea, number>;
  slagPct: number;
  spillPct: number;
  dominantArea: PyramidArea | null;
};

function getISOWeek(d: Date): { year: number; week: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: date.getUTCFullYear(), week };
}

function startOfISOWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - (day - 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

export function buildFaser(sessions: SessionWithRel[]): Fase[] {
  if (sessions.length === 0) return [];

  const groups = new Map<string, SessionWithRel[]>();
  for (const s of sessions) {
    const { year, week } = getISOWeek(s.scheduledAt);
    const key = `${year}-${String(week).padStart(2, "0")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(s);
  }

  const now = new Date();
  const { year: curYear, week: curWeek } = getISOWeek(now);
  const currentKey = `${curYear}-${String(curWeek).padStart(2, "0")}`;

  const result: Fase[] = [];
  const sortedKeys = Array.from(groups.keys()).sort();

  for (const key of sortedKeys) {
    const list = groups.get(key)!;
    const first = list[0].scheduledAt;
    const weekStart = startOfISOWeek(first);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const done = list.filter((s) => s.status === "COMPLETED").length;
    const totMin = list.reduce((sum, s) => sum + s.durationMin, 0);

    const minPerArea: Record<PyramidArea, number> = {
      FYS: 0,
      TEK: 0,
      SLAG: 0,
      SPILL: 0,
      TURN: 0,
    };
    for (const s of list) {
      minPerArea[s.pyramidArea] += s.durationMin;
    }
    const pyrFordeling: Record<PyramidArea, number> = {
      FYS: 0,
      TEK: 0,
      SLAG: 0,
      SPILL: 0,
      TURN: 0,
    };
    if (totMin > 0) {
      for (const area of PYR_REKKEFOLGE) {
        pyrFordeling[area] = Math.round((minPerArea[area] / totMin) * 100);
      }
    }

    let dominantArea: PyramidArea | null = null;
    let maxMin = 0;
    for (const area of PYR_REKKEFOLGE) {
      if (minPerArea[area] > maxMin) {
        maxMin = minPerArea[area];
        dominantArea = area;
      }
    }

    let status: PhaseStatus;
    if (key === currentKey) status = "current";
    else if (key < currentKey) status = "done";
    else status = "upcoming";

    const ukeLabel = `u${key.split("-")[1]}`;
    const dateLabel = weekStart.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
    });
    const dateRangeLabel = `${weekStart.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
    })} – ${weekEnd.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
    })} · ${list.length} økter`;

    result.push({
      key,
      ukeLabel,
      dateLabel,
      dateRangeLabel,
      status,
      totalSessions: list.length,
      done,
      totMin,
      pyrFordeling,
      slagPct: pyrFordeling.SLAG,
      spillPct: pyrFordeling.SPILL,
      dominantArea,
    });
  }

  return result;
}
