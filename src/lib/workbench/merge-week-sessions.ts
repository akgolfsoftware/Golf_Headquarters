import type { PyramidArea } from "@/generated/prisma/client";

/** Felles uke-rad — TrainingPlanSession og V2 mappes hit før merge. */
export type WeekSessionRow = {
  id: string;
  scheduledAt: Date;
  durationMin: number;
  title: string;
  pyramidArea: PyramidArea;
  environment: "RANGE" | "BANE" | "STUDIO" | "HJEM" | "SIMULATOR" | "GYM" | null;
  _count: { drills: number };
};

export type V2WeekSessionInput = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  generertFraId: string | null;
  drills: { pyramide: string | null }[];
  practiceType: "BLOKK" | "RANDOM" | "KONKURRANSE" | "SPILL_TEST";
};

function v2ToWeekRow(v: V2WeekSessionInput): WeekSessionRow {
  const durMin = Math.max(5, Math.round((v.endTime.getTime() - v.startTime.getTime()) / 60_000));
  const topDrill = v.drills[0]?.pyramide;
  const pyramidArea = (
    topDrill && ["FYS", "TEK", "SLAG", "SPILL", "TURN"].includes(topDrill)
      ? topDrill
      : v.practiceType === "KONKURRANSE"
        ? "TURN"
        : v.practiceType === "SPILL_TEST"
          ? "SPILL"
          : v.practiceType === "RANDOM"
            ? "SLAG"
            : "TEK"
  ) as PyramidArea;
  return {
    id: v.id,
    scheduledAt: v.startTime,
    durationMin: durMin,
    title: v.title,
    pyramidArea,
    environment: null,
    _count: { drills: v.drills.length },
  };
}

/**
 * Slår sammen V1 (TrainingPlanSession) og V2 (TrainingSessionV2) for inneværende uke.
 * Alle V2-rader inkluderes; V1 deduper kun på id (V2 med samme id som eksisterende V1 hoppes over).
 */
export function mergeWeekSessions(
  v1Sessions: WeekSessionRow[],
  v2Sessions: V2WeekSessionInput[],
): WeekSessionRow[] {
  const v1Ids = new Set(v1Sessions.map((s) => s.id));
  const v2Rows = v2Sessions.map(v2ToWeekRow).filter((row) => !v1Ids.has(row.id));
  return [...v1Sessions, ...v2Rows].sort(
    (a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime(),
  );
}