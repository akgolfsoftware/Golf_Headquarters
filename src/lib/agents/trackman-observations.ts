export type FaceToPathShot = {
  club: string;
  faceToPath: number | null;
};

export type FaceToPathObservation = {
  club: string;
  shotCount: number;
  meanDegrees: number;
};

// Tre slag er kun grensen for å vise et beskrivende snitt, aldri en diagnose.
export function summarizeFaceToPath(
  shots: FaceToPathShot[],
): FaceToPathObservation[] {
  const byClub = new Map<string, number[]>();
  for (const shot of shots) {
    if (!shot.club.trim() || shot.faceToPath == null || !Number.isFinite(shot.faceToPath)) continue;
    byClub.set(shot.club, [...(byClub.get(shot.club) ?? []), shot.faceToPath]);
  }

  return Array.from(byClub, ([club, values]) => ({
    club,
    shotCount: values.length,
    meanDegrees: values.reduce((sum, value) => sum + value, 0) / values.length,
  })).filter((observation) => observation.shotCount >= 3);
}
