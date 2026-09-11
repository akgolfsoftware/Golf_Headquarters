/**
 * Felles shot-format for TrackMan CSV, HTML og foto.
 * Én sannhet: hastighet i mph, avstand i meter — det DB/TrackManShot lagrer.
 * Enhet kommer fra kilden. Tallstørrelse brukes aldri til å gjette.
 */

import type { TrackManShot as CsvShot } from "@/lib/trackman/parse-csv";
import type { TrackManHtmlReport } from "@/lib/trackman/parse-html-report";
import type { DistanceUnit, SpeedUnit } from "@/lib/trackman/enheter";

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

/** 1 m/s = 2.23694 mph. Ukjent enhet eller manglende tall → null, aldri gjetning. */
export function speedToMph(value: number | null, unit: SpeedUnit): number | null {
  if (value == null || !Number.isFinite(value) || unit === "unknown") return null;
  if (unit === "mph") return round2(value);
  return round2(value * 2.23694);
}

/** 1 yard = 0.9144 m. Ukjent enhet eller manglende tall → null. */
export function distanceToMeters(value: number | null, unit: DistanceUnit): number | null {
  if (value == null || !Number.isFinite(value) || unit === "unknown") return null;
  if (unit === "m") return round2(value);
  return round2(value * 0.9144);
}

export function csvShotsToCanonical(shots: CsvShot[]): CanonicalShot[] {
  return shots.map((s) => {
    const speedUnit = s.speedUnit ?? "unknown";
    const distanceUnit = s.distanceUnit ?? "unknown";
    return {
      club: s.club?.trim() || "Ukjent",
      clubSpeedMph: speedToMph(s.clubSpeedMps, speedUnit),
      ballSpeedMph: speedToMph(s.ballSpeedMps, speedUnit),
      smashFactor: s.smashFactor,
      carryMeters: distanceToMeters(s.carryMeters, distanceUnit),
      totalMeters: distanceToMeters(s.totalMeters, distanceUnit),
      launchAngleDeg: s.launchAngleDeg,
      spinRateRpm: s.spinRateRpm,
      sideMeters: s.sideMeters != null ? round2(s.sideMeters) : null,
      faceToPath: null,
      clubPath: null,
      faceAngle: null,
    };
  });
}

/**
 * HTML multi-group: per-kølle shot-rader → flate CanonicalShot[].
 * Carry kopieres aldri fra total — mangler carry-feltet, blir det null.
 */
export function htmlReportToCanonical(report: TrackManHtmlReport): CanonicalShot[] {
  const speedUnit = report.speedUnit ?? "unknown";
  const distanceUnit = report.distanceUnit ?? "unknown";
  const out: CanonicalShot[] = [];
  for (const group of report.clubs) {
    const club = group.clubName?.trim() || group.clubId?.trim() || "Ukjent";
    for (const shot of group.shots) {
      const carryRaw = shot.carryDistance ?? null;
      out.push({
        club,
        clubSpeedMph: speedToMph(shot.clubSpeed, speedUnit),
        ballSpeedMph: speedToMph(shot.ballSpeed, speedUnit),
        smashFactor: Number.isFinite(shot.smashFactor) ? shot.smashFactor : null,
        carryMeters: distanceToMeters(carryRaw, distanceUnit),
        totalMeters: distanceToMeters(shot.totalDistance, distanceUnit),
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
