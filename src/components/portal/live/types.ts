import type { PyramidArea, SessionStatusV2 } from "@/generated/prisma/client";

/** Status for TrainingSessionV2-basert live-økt. */
export type LiveV2Status = SessionStatusV2;

/** Drill-view for live-økt (TrainingDrillV2). */
export type LiveV2Drill = {
  id: string;
  /** 1-basert rekkefølge for visning. */
  index: number;
  name: string;
  description: string | null;
  /** Planlagt varighet i minutter. */
  durationMinutes: number;
  /** Planlagt antall reps (repetitions). */
  plannedReps: number;
  pyramide: PyramidArea;
  lFase: string | null;
  notes: string | null;
};

/** Rep-fordeling logget for en drill (DrillLogV2). */
export type LiveV2DrillLog = {
  drillId: string;
  repsTotal: number;
  repsWithoutBall: number;
  repsLowSpeed: number;
  repsAutomatic: number;
  repsHit: number;
  successRate: number;
  notes: string | null;
  loggedAt: string;
};

/** Sesjons-view for live-økt (TrainingSessionV2). */
export type LiveV2Session = {
  sessionId: string;
  title: string;
  coachComment: string | null;
  focus: string | null;
  status: LiveV2Status;
  scheduledAtISO: string;
  completed: boolean;
  studentName: string | null;
  pyramide: PyramidArea;
  drills: LiveV2Drill[];
  existingLogs: LiveV2DrillLog[];
  /** Rå completedSummary JSON fra DB (brukes av summary). */
  completedSummary: unknown;
};

/** Rep-tilstand for én drill under aktiv økt. */
export type DrillRepState = {
  repsTotal: number;
  repsWithoutBall: number;
  repsLowSpeed: number;
  repsAutomatic: number;
  repsHit: number;
};

/** Sammendragsdata for fullført økt. */
export type LiveV2Summary = LiveV2Session & {
  durationSec: number;
  totalReps: number;
  drillsCompleted: number;
  pyramidSummary: Record<PyramidArea, number>;
};
