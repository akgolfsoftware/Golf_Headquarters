/**
 * Felles shot-format for TrackMan CSV og HTML.
 * Én sannhet: hastighet i mph, avstand i meter — det DB/TrackManShot lagrer.
 */

import type { TrackManShot as CsvShot } from "@/lib/trackman/parse-csv";
import type {
  TrackManDistanceUnit,
  TrackManSpeedUnit,
} from "@/lib/trackman/parse-csv";
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
 * Normaliser hastighet til mph. En eksplisitt kildeenhet vinner alltid.
 * Uten kildeenhet beholder vi den gamle terskelen av hensyn til lagrede
 * foto-/CSV-data: <= 60 tolkes som m/s, > 60 som mph. Det er tvetydig og
 * skal ikke brukes når kilden faktisk oppgir enhet.
 */
export function speedToMph(
  value: number | null,
  unit?: TrackManSpeedUnit,
): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  if (unit === "unknown") return null;
  if (unit === "mph") return round2(value);
  if (unit === "m/s") return round2(value * 2.23694);
  if (value > 60) return round2(value);
  return round2(value * 2.23694);
}

/**
 * Normaliser avstand til meter. En eksplisitt kildeenhet vinner alltid.
 * Uten kildeenhet beholdes den gamle terskelen: <= 320 tolkes som meter,
 * > 320 som yards. Reserveveien er tvetydig og finnes kun for eldre data.
 */
export function distanceToMeters(
  value: number | null,
  unit?: TrackManDistanceUnit,
): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  if (unit === "unknown") return null;
  if (unit === "m") return round2(value);
  if (unit === "yd") return round2(value * 0.9144);
  if (value > 320) return round2(value * 0.9144);
  return round2(value);
}

export function csvShotsToCanonical(shots: CsvShot[]): CanonicalShot[] {
  return shots.map((s) => ({
    club: s.club?.trim() || "Ukjent",
    clubSpeedMph: speedToMph(s.clubSpeedMps, s.sourceUnits?.clubSpeed),
    ballSpeedMph: speedToMph(s.ballSpeedMps, s.sourceUnits?.ballSpeed),
    smashFactor: s.smashFactor,
    carryMeters: distanceToMeters(s.carryMeters, s.sourceUnits?.carry),
    totalMeters: distanceToMeters(s.totalMeters, s.sourceUnits?.total),
    launchAngleDeg: s.launchAngleDeg,
    spinRateRpm: s.spinRateRpm,
    sideMeters: distanceToMeters(s.sideMeters, s.sourceUnits?.side),
    faceToPath: null,
    clubPath: null,
    faceAngle: null,
  }));
}

/**
 * HTML multi-group: per-kølle shot-rader → flate CanonicalShot[]. Rapporten
 * inneholder bare totaldistanse, så carry forblir ukjent.
 */
export function htmlReportToCanonical(report: TrackManHtmlReport): CanonicalShot[] {
  const out: CanonicalShot[] = [];
  for (const group of report.clubs) {
    const club = group.clubName?.trim() || group.clubId?.trim() || "Ukjent";
    for (const shot of group.shots) {
      const total = distanceToMeters(shot.totalDistance, report.sourceUnits?.totalDistance);
      out.push({
        club,
        clubSpeedMph: speedToMph(shot.clubSpeed, report.sourceUnits?.clubSpeed),
        ballSpeedMph: speedToMph(shot.ballSpeed, report.sourceUnits?.ballSpeed),
        smashFactor: Number.isFinite(shot.smashFactor) ? shot.smashFactor : null,
        carryMeters: null,
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
