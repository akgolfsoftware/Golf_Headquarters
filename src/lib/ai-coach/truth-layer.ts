// Truth layer — dataprioritet for coaching-anbefalinger (uten ML).
// Portert fra kunnskap/truth-layer-prioritet.md (MORAD-014).

export type DataSourceKind =
  | "l-phase-readiness"
  | "junior-guard"
  | "periodization"
  | "sg-round"
  | "trackman"
  | "test-trend"
  | "video-analysis"
  | "plan-watcher";

const PRIORITY: Record<DataSourceKind, number> = {
  "l-phase-readiness": 8,
  "junior-guard": 7,
  "periodization": 6,
  "sg-round": 5,
  "trackman": 4,
  "test-trend": 3,
  "video-analysis": 2,
  "plan-watcher": 1,
};

export type CoachingClaim = {
  source: DataSourceKind;
  area?: string;
  confidence: number;
  summary: string;
};

export type ResolvedClaim = CoachingClaim & {
  cappedConfidence: number;
  overriddenBy?: DataSourceKind;
};

/** Høyere tall = høyere prioritet. */
export function sourcePriority(source: DataSourceKind): number {
  return PRIORITY[source];
}

/** Velger vinnende claim når flere kilder konflikter. */
export function resolveConflictingClaims(claims: CoachingClaim[]): ResolvedClaim | null {
  if (claims.length === 0) return null;

  const sorted = [...claims].sort(
    (a, b) => sourcePriority(b.source) - sourcePriority(a.source),
  );
  const winner = sorted[0]!;
  const runnerUp = sorted[1];

  let cappedConfidence = winner.confidence;
  if (winner.source === "l-phase-readiness" && runnerUp?.area === "APP") {
    cappedConfidence = Math.min(cappedConfidence, 0.65);
  }

  return {
    ...winner,
    cappedConfidence,
    overriddenBy: runnerUp && sourcePriority(runnerUp.source) < sourcePriority(winner.source)
      ? winner.source
      : undefined,
  };
}

/** TrackMan vinner over video når begge tolker samme sving. */
export function trackManBeatsVideo(
  trackMan: CoachingClaim,
  video: CoachingClaim,
): boolean {
  return sourcePriority(trackMan.source) > sourcePriority(video.source);
}