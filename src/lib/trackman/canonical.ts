/**
 * Felles shot-format for TrackMan CSV og HTML.
 * Én sannhet: hastighet i mph, avstand i meter — det DB/TrackManShot lagrer.
 */

import type { TrackManShot as CsvShot } from "@/lib/trackman/parse-csv";
import type { TrackManHtmlReport } from "@/lib/trackman/parse-html-report";

export type CanonicalShot = {
  club: string;
  clubSpeedMph: number | null;
  ballSpeedMph: number | null;
  smashFactor: number | null;
  carryMeters: number | null;
  totalMeters: number | null;
  launchAngleDeg: number | null;
  spinRateRpm: number | null;
  sideMeters: number | null;
  faceToPath: number | null;
  clubPath: number | null;
  faceAngle: number | null;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Normaliser hastighet til mph.
 * TrackMan CSV er ofte m/s (~35–55 for driver); UI/DB lagrer mph.
 * Verdier > 60 er nesten alltid allerede mph (jern/driver).
 */
export function speedToMph(value: number | null): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  if (value > 60) return round2(value);
  return round2(value * 2.23694);
}

/**
 * Normaliser avstand til meter.
 * HTML multi-group bruker ofte yards for total; CSV meter.
 * Svært høye tall (> 320) tolkes som yards.
 */
export function distanceToMeters(value: number | null): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  if (value > 320) return round2(value * 0.9144);
  return round2(value);
}

export function csvShotsToCanonical(shots: CsvShot[]): CanonicalShot[] {
  return shots.map((s) => ({
    club: s.club?.trim() || "Ukjent",
    clubSpeedMph: speedToMph(s.clubSpeedMps),
    ballSpeedMph: speedToMph(s.ballSpeedMps),
    smashFactor: s.smashFactor,
    carryMeters: distanceToMeters(s.carryMeters),
    totalMeters: distanceToMeters(s.totalMeters),
    launchAngleDeg: s.launchAngleDeg,
    spinRateRpm: s.spinRateRpm,
    sideMeters: s.sideMeters != null ? round2(s.sideMeters) : null,
    faceToPath: null,
    clubPath: null,
    faceAngle: null,
  }));
}

/**
 * HTML multi-group: per-kølle shot-rader → flate CanonicalShot[].
 * Speeds antas mph (typisk TrackMan web); totalDistance → total/carry.
 */
export function htmlReportToCanonical(report: TrackManHtmlReport): CanonicalShot[] {
  const out: CanonicalShot[] = [];
  for (const group of report.clubs) {
    const club = group.clubName?.trim() || group.clubId?.trim() || "Ukjent";
    for (const shot of group.shots) {
      const total = distanceToMeters(shot.totalDistance);
      out.push({
        club,
        clubSpeedMph: speedToMph(shot.clubSpeed),
        ballSpeedMph: speedToMph(shot.ballSpeed),
        smashFactor: Number.isFinite(shot.smashFactor) ? shot.smashFactor : null,
        carryMeters: total,
        totalMeters: total,
        launchAngleDeg: null,
        spinRateRpm: null,
        sideMeters: null,
        faceToPath: Number.isFinite(shot.faceToPath) ? shot.faceToPath : null,
        clubPath: Number.isFinite(shot.clubPath) ? shot.clubPath : null,
        faceAngle: Number.isFinite(shot.faceAngle) ? shot.faceAngle : null,
      });
    }
  }
  return out;
}
