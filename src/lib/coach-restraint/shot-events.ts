// Slag-hendelser for restraint-motoren — idretts-agnostisk grensesnitt.
//
// Fase A har ingen live slag-strøm: eneste kilde er post-hoc TrackMan-import.
// `ShotEvent` er plugg-punktet — en fremtidig live-kilde (launch monitor-API,
// sensor) produserer samme struktur og resten av motoren er uendret.

import type { ParamKey } from "@/lib/trackman/stabilitet";

export type ShotSource = "trackman-import" | "manual" | "live";

export type RestraintMetric = ParamKey; // carry | side | ballSpeed | launchAngle | spinRate | smash

export type ShotEvent = {
  source: ShotSource;
  club: string | null;
  at: Date;
  /** Metrikker i kanoniske enheter (meter/grader/rpm — samme som TrackManShot). */
  metrics: Partial<Record<RestraintMetric, number>>;
};

/** Feltene adapteren trenger fra en prisma TrackManShot-rad. */
export type TrackManShotRow = {
  club?: string | null;
  createdAt?: Date | null;
  carryDistance: number | null;
  side: number | null;
  ballSpeed: number | null;
  launchAngle: number | null;
  spinRate: number | null;
  smashFactor: number | null;
};

export function fromTrackManShot(
  shot: TrackManShotRow,
  recordedAt: Date,
): ShotEvent {
  const metrics: Partial<Record<RestraintMetric, number>> = {};
  if (shot.carryDistance !== null) metrics.carry = shot.carryDistance;
  if (shot.side !== null) metrics.side = shot.side;
  if (shot.ballSpeed !== null) metrics.ballSpeed = shot.ballSpeed;
  if (shot.launchAngle !== null) metrics.launchAngle = shot.launchAngle;
  if (shot.spinRate !== null) metrics.spinRate = shot.spinRate;
  if (shot.smashFactor !== null) metrics.smash = shot.smashFactor;

  return {
    source: "trackman-import",
    club: shot.club ?? null,
    at: shot.createdAt ?? recordedAt,
    metrics,
  };
}
