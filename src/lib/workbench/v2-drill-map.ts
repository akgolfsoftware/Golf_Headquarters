import type {
  CSNivaa,
  LFase,
  MMiljo,
  PRPress,
  PyramidArea,
  RepType,
  SkillArea,
} from "@/generated/prisma/client";
import { parsePlannedReps } from "@/lib/portal-live/data";

export type SessionDrillForV2Sync = {
  orderIndex: number;
  reps: number | null;
  sets: number | null;
  repsSets: string;
  csTarget: number | null;
  notes: string | null;
  lFase: LFase | null;
  miljo: MMiljo | null;
  csNivaa: CSNivaa | null;
  prPress: PRPress | null;
  pPosisjoner: string[];
  repType: RepType | null;
  repAntall: number | null;
  repMinutter: number | null;
  repSett: number | null;
  repReps: number | null;
  pyramidArea: PyramidArea | null;
  skillArea: SkillArea | null;
  exercise: {
    name: string;
    description: string | null;
    durationMin: number | null;
    pyramidArea: PyramidArea;
    skillArea: SkillArea | null;
  };
};

export type V2DrillCreateInput = {
  sortOrder: number;
  name: string;
  description: string | null;
  durationMinutes: number;
  repetitions: number | null;
  pyramide: PyramidArea;
  omraade: string | null;
  lFase: SessionDrillForV2Sync["lFase"];
  csNivaa: SessionDrillForV2Sync["csNivaa"];
  miljo: SessionDrillForV2Sync["miljo"];
  prPress: SessionDrillForV2Sync["prPress"];
  pPosisjoner: string[];
  repType: RepType | null;
  repAntall: number | null;
  repMinutter: number | null;
  repSett: number | null;
  repReps: number | null;
};

/** Fordel øktvarighet jevnt når øvelsen mangler egen varighet. */
export function defaultDrillDurationMinutes(
  sessionDurationMin: number,
  drillCount: number,
  exerciseDurationMin: number | null,
): number {
  if (exerciseDurationMin != null && exerciseDurationMin > 0) {
    return Math.min(480, exerciseDurationMin);
  }
  const perDrill = Math.round(sessionDurationMin / Math.max(1, drillCount));
  return Math.max(5, Math.min(480, perDrill));
}

/** Map SessionDrill (+ exercise) til TrainingDrillV2 create-payload. */
export function mapSessionDrillToV2Drill(
  drill: SessionDrillForV2Sync,
  ctx: { sessionDurationMin: number; drillCount: number; sessionPyramid: PyramidArea },
): V2DrillCreateInput {
  const pyramide = drill.pyramidArea ?? drill.exercise.pyramidArea ?? ctx.sessionPyramid;
  const skill = drill.skillArea ?? drill.exercise.skillArea;
  const repetitions = (() => {
    const parsed = parsePlannedReps(drill);
    if (parsed > 0) return parsed;
    if (drill.repAntall != null && drill.repAntall > 0) return drill.repAntall;
    return null;
  })();

  return {
    sortOrder: drill.orderIndex,
    name: drill.exercise.name,
    description: drill.notes ?? drill.exercise.description,
    durationMinutes: defaultDrillDurationMinutes(
      ctx.sessionDurationMin,
      ctx.drillCount,
      drill.exercise.durationMin,
    ),
    repetitions,
    pyramide,
    omraade: skill ?? null,
    lFase: drill.lFase,
    csNivaa: drill.csNivaa,
    miljo: drill.miljo,
    prPress: drill.prPress,
    pPosisjoner: drill.pPosisjoner,
    repType: drill.repType,
    repAntall: drill.repAntall,
    repMinutter: drill.repMinutter,
    repSett: drill.repSett,
    repReps: drill.repReps,
  };
}