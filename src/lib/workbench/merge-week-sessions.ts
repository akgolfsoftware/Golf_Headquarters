import type { PyramidArea, SessionStatus, SessionStatusV2 } from "@/generated/prisma/client";

/** Felles uke-rad — TrainingPlanSession og V2 mappes hit før merge. */
export type WeekSessionRow = {
  id: string;
  scheduledAt: Date;
  durationMin: number;
  title: string;
  pyramidArea: PyramidArea;
  environment: "RANGE" | "BANE" | "STUDIO" | "HJEM" | "SIMULATOR" | "GYM" | null;
  status: SessionStatus;
  /** AK-formel på økt-nivå (plan-økter). Null for v2-rader uten speil. */
  lFase?: string | null;
  miljo?: string | null;
  _count: { drills: number };
  /** Hvilken tabell raden kommer fra — styrer hvilke handlinger som er gyldige
   *  (flytt/slett virker kun på TrainingPlanSession; v2-id-er er egne cuid-er). */
  source: "plan" | "v2";
};

/** V1-rader slik loaderen henter dem (uten source — mergeren stempler "plan"). */
export type PlanWeekSessionInput = Omit<WeekSessionRow, "source">;

export type V2WeekSessionInput = {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  generertFraId: string | null;
  drills: { pyramide: string | null }[];
  practiceType: "BLOKK" | "RANDOM" | "KONKURRANSE" | "SPILL_TEST";
  status: SessionStatusV2;
};

/** SessionStatusV2 → SessionStatus, så compliance-regelen kan bo ett sted. */
const V2_STATUS_TO_V1: Record<SessionStatusV2, SessionStatus> = {
  PLANNED: "PLANNED",
  IN_PROGRESS: "ACTIVE",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  SKIPPED: "SKIPPED",
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
    status: V2_STATUS_TO_V1[v.status],
    _count: { drills: v.drills.length },
    source: "v2",
  };
}

/**
 * Slår sammen V1 (TrainingPlanSession) og V2 (TrainingSessionV2) for inneværende uke.
 * V2 har alltid sin egen uavhengige id (cuid) — aldri lik V1-øktens id. Koblingen til en
 * V1-økt den speiler går via `generertFraId`, så dedup MÅ sjekke det feltet, ikke `id`.
 */
export function mergeWeekSessions(
  v1Sessions: PlanWeekSessionInput[],
  v2Sessions: V2WeekSessionInput[],
): WeekSessionRow[] {
  const v1Ids = new Set(v1Sessions.map((s) => s.id));
  const v1Rows: WeekSessionRow[] = v1Sessions.map((s) => ({ ...s, source: "plan" }));
  const v2Rows = v2Sessions
    .filter((v) => !(v.generertFraId && v1Ids.has(v.generertFraId)))
    .map(v2ToWeekRow);
  return [...v1Rows, ...v2Rows].sort(
    (a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime(),
  );
}