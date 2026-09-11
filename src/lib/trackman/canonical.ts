/**
 * Felles shot-format for TrackMan CSV, HTML og AI-bildeavlesning.
 * Én sannhet: hastighet i mph, avstand i meter — det DB/TrackManShot lagrer.
 *
 * R-D (2026-09-11): kildeenheten følger målingen gjennom hele importen —
 * `speedToMph`/`distanceToMeters` GJETTER ALDRI enhet fra tallstørrelse
 * lenger. Hver kilde (CSV, HTML-rapport, AI-bilde) erklærer sin kjente enhet
 * eksplisitt ved kallet. Regresjon rettet: et CSV-tall på 70 (m/s, ballspeed)
 * ble tidligere feiltolket som "allerede mph" fordi 70 > 60-terskelen; et
 * CSV-tall på 330 (meter, carry) ble feiltolket som yards fordi 330 > 320.
 * Se `canonical.test.ts` for eksplisitte regresjonstester på nøyaktig disse
 * to verdiene. AI-bildeavlesningen (`parse-photo.ts`) ba modellen om mph —
 * men ble tidligere kjørt gjennom samme csvShotsToCanonical som CSV (mps),
 * så et wedge-slag på f.eks. 48 mph (< 60-terskelen) ble feilaktig
 * "konvertert" til ~107 mph. Fikset ved at kalleren nå oppgir kildeenheten
 * eksplisitt (se `src/app/portal/mal/trackman/actions.ts`).
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

/** Kjent kildeenhet for hastighet — aldri gjettet, alltid erklært av kalleren. */
export type SpeedUnit = "mph" | "mps";
/** Kjent kildeenhet for avstand — aldri gjettet, alltid erklært av kalleren. */
export type DistanceUnit = "meters" | "yards";

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Normaliser hastighet til mph. Krever en EKSPLISITT kildeenhet — gjetter
 * aldri fra verdiens størrelse. Ukjent/manglende verdi gir `null`, aldri et
 * anslag.
 */
export function speedToMph(value: number | null, unit: SpeedUnit): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  if (unit === "mph") return round2(value);
  return round2(value * 2.23694);
}

/**
 * Normaliser avstand til meter. Krever en EKSPLISITT kildeenhet — gjetter
 * aldri fra verdiens størrelse. Ukjent/manglende verdi gir `null`, aldri et
 * anslag.
 */
export function distanceToMeters(value: number | null, unit: DistanceUnit): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  if (unit === "meters") return round2(value);
  return round2(value * 0.9144);
}

/** Kildeenheter for én shot-liste — hva slags tall parseren faktisk produserte. */
export type ShotSourceUnits = {
  speed: SpeedUnit;
  distance: DistanceUnit;
};

/** CSV-parserens faste format-konvensjon: m/s og meter (kolonnenavnene sier det). */
export const CSV_SOURCE_UNITS: ShotSourceUnits = { speed: "mps", distance: "meters" };

/**
 * AI-bildeavlesningens faste konvensjon (se `parse-photo.ts` system-prompt):
 * modellen bes eksplisitt om mph og meter — ALDRI m/s, selv om resultatet
 * gjenbruker samme `TrackManShot`-form som CSV-parseren.
 */
export const PHOTO_SOURCE_UNITS: ShotSourceUnits = { speed: "mph", distance: "meters" };

/**
 * Mapper CSV- eller bilde-shots (samme `TrackManShot`-form) til kanonisk
 * format. `sourceUnits` er PÅKREVD — ingen implisitt default — nettopp for å
 * hindre at en bilde-shot ved en feil sendes gjennom med CSV-ens mps-antakelse.
 */
export function csvShotsToCanonical(
  shots: CsvShot[],
  sourceUnits: ShotSourceUnits,
): CanonicalShot[] {
  return shots.map((s) => ({
    club: s.club?.trim() || "Ukjent",
    clubSpeedMph: speedToMph(s.clubSpeedMps, sourceUnits.speed),
    ballSpeedMph: speedToMph(s.ballSpeedMps, sourceUnits.speed),
    smashFactor: s.smashFactor,
    carryMeters: distanceToMeters(s.carryMeters, sourceUnits.distance),
    totalMeters: distanceToMeters(s.totalMeters, sourceUnits.distance),
    launchAngleDeg: s.launchAngleDeg,
    spinRateRpm: s.spinRateRpm,
    sideMeters: s.sideMeters != null ? round2(s.sideMeters) : null,
    faceToPath: null,
    clubPath: null,
    faceAngle: null,
  }));
}

/**
 * HTML multi-group-rapportens faste format-konvensjon: hastigheter er mph
 * (TrackMan web-rapportens standardvisning). Total-distanse er DEKLARERT
 * yards som fast konvensjon for dette rapportformatet — IKKE gjettet per
 * verdi fra størrelse (den forrige koden konverterte alt over 320 til yards,
 * som feiltolket en ekte 330 meter-måling). Rapporten skiller ikke selv
 * mellom Imperial/Metric-visning i teksten vi parser, så dette er en kjent,
 * dokumentert begrensning — ikke en per-verdi gjetning.
 */
export const HTML_REPORT_SOURCE_UNITS: ShotSourceUnits = { speed: "mph", distance: "yards" };

/**
 * HTML multi-group: per-kølle shot-rader → flate CanonicalShot[].
 * Rapporten oppgir kun total-distanse, ALDRI carry — carryMeters settes derfor
 * eksplisitt til `null` i stedet for å bli erstattet av total (R-D-krav: en
 * manglende carry skal aldri fylles med en annen måling).
 */
export function htmlReportToCanonical(
  report: TrackManHtmlReport,
  sourceUnits: ShotSourceUnits = HTML_REPORT_SOURCE_UNITS,
): CanonicalShot[] {
  const out: CanonicalShot[] = [];
  for (const group of report.clubs) {
    const club = group.clubName?.trim() || group.clubId?.trim() || "Ukjent";
    for (const shot of group.shots) {
      out.push({
        club,
        clubSpeedMph: speedToMph(
          Number.isFinite(shot.clubSpeed) ? shot.clubSpeed : null,
          sourceUnits.speed,
        ),
        ballSpeedMph: speedToMph(
          Number.isFinite(shot.ballSpeed) ? shot.ballSpeed : null,
          sourceUnits.speed,
        ),
        smashFactor: Number.isFinite(shot.smashFactor) ? shot.smashFactor : null,
        carryMeters: null,
        totalMeters: distanceToMeters(
          Number.isFinite(shot.totalDistance) ? shot.totalDistance : null,
          sourceUnits.distance,
        ),
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
