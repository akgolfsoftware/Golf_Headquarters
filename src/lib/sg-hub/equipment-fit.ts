// Equipment Fit Indicators (feature #11)
// Sjekker per-kølle launch/spin/smash mot target-vinduer for kølletypen.
//
// Targets fra spec (seksjon 6, #11):
// - Driver: launch 11-14°, spin 2200-2800 rpm, smash 1.45-1.50
// - Jern: launch per nummer (4i 12-14°, 7i 17-19°, 9i 22-25°), smash 1.38-1.42
// - Wedges: smash 1.20-1.28
//
// MERK: launch- og spinRate-felter er ikke garantert i TrackMan HTML-rapport
// (kun launchDirection er parset). Funksjonen leser felter best-effort fra
// rawJson og rapporterer "missing" når data ikke er tilgjengelig — i stedet
// for å feile.

import type { ShotData } from "./extract-shots";

export type FitStatus = "ok" | "warn" | "critical" | "missing";

export type MetricTarget = {
  min: number;
  max: number;
};

export type FitMetric = {
  label: string;
  unit: string;
  target: MetricTarget | null;
  value: number | null;
  status: FitStatus;
  note: string;
};

export type ClubFitReport = {
  clubId: string;
  category: "driver" | "iron" | "wedge" | "wood" | "putter" | "other";
  shotCount: number;
  metrics: FitMetric[];
  overall: FitStatus;
};

// ---------------------------------------------------------------------------
// Targets per kølle-kategori
// ---------------------------------------------------------------------------

const DRIVER_TARGETS = {
  launch: { min: 11, max: 14 },
  spin: { min: 2200, max: 2800 },
  smash: { min: 1.45, max: 1.5 },
};

const IRON_SMASH: MetricTarget = { min: 1.38, max: 1.42 };

// Launch-target per jern-nummer.
const IRON_LAUNCH: Record<string, MetricTarget> = {
  "3i": { min: 10, max: 12 },
  "4i": { min: 12, max: 14 },
  "5i": { min: 13, max: 15 },
  "6i": { min: 15, max: 17 },
  "7i": { min: 17, max: 19 },
  "8i": { min: 19, max: 22 },
  "9i": { min: 22, max: 25 },
};

const WEDGE_TARGETS: Record<string, MetricTarget> = {
  PW: { min: 1.3, max: 1.36 },
  AW: { min: 1.26, max: 1.32 },
  GW: { min: 1.24, max: 1.3 },
  SW: { min: 1.22, max: 1.28 },
  LW: { min: 1.2, max: 1.26 },
};

// ---------------------------------------------------------------------------
// Kategorisering
// ---------------------------------------------------------------------------

export function categorizeClub(clubId: string): ClubFitReport["category"] {
  const id = clubId.toLowerCase();
  if (id === "driver" || id === "1w") return "driver";
  if (/^[2-9]w$/.test(id)) return "wood";
  if (/^[1-9]i$/.test(id)) return "iron";
  if (["pw", "aw", "gw", "sw", "lw"].includes(id)) return "wedge";
  if (id === "pt" || id === "putter") return "putter";
  return "other";
}

// ---------------------------------------------------------------------------
// Status-klassifisering
// ---------------------------------------------------------------------------

// Et avvik er "kritisk" om det er > 15% utenfor target-bandet.
// "Utenfor target" hvis utenfor men innenfor 15% margin.
function classifyValue(value: number, target: MetricTarget): FitStatus {
  if (value >= target.min && value <= target.max) return "ok";

  const range = target.max - target.min;
  const margin = Math.max(range * 0.5, target.min * 0.05);

  if (value < target.min - margin) return "critical";
  if (value > target.max + margin) return "critical";
  return "warn";
}

function worstStatus(...statuses: FitStatus[]): FitStatus {
  if (statuses.includes("critical")) return "critical";
  if (statuses.includes("warn")) return "warn";
  if (statuses.includes("ok")) return "ok";
  return "missing";
}

// ---------------------------------------------------------------------------
// Snitt-beregning for valgfrie felter (launch, spin)
// ---------------------------------------------------------------------------

// rawJson kan inneholde launch/spin per slag — vi leser best-effort.
// HTML-parser eksponerer ikke disse i ShotData, men CSV-import kan ha dem.
function readOptionalAverage(
  rawShots: unknown,
  clubId: string,
  keys: string[],
): number | null {
  if (!Array.isArray(rawShots)) return null;
  const id = clubId.toLowerCase();
  const values: number[] = [];

  for (const row of rawShots as Record<string, unknown>[]) {
    const club = String(
      row["Club"] ?? row["club"] ?? row["ClubId"] ?? "",
    ).toLowerCase();
    if (club !== id) continue;
    for (const k of keys) {
      const raw = row[k];
      if (raw === undefined || raw === null) continue;
      const num =
        typeof raw === "number" ? raw : parseFloat(String(raw));
      if (!isNaN(num) && num !== 0) {
        values.push(num);
        break;
      }
    }
  }

  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// ---------------------------------------------------------------------------
// Hovedfunksjon
// ---------------------------------------------------------------------------

export function computeClubFit(
  clubId: string,
  shots: ShotData[],
  rawJson: unknown,
): ClubFitReport {
  const category = categorizeClub(clubId);
  const metrics: FitMetric[] = [];

  if (shots.length === 0) {
    return {
      clubId,
      category,
      shotCount: 0,
      metrics: [],
      overall: "missing",
    };
  }

  const avgSmash = avg(shots.map((s) => s.smashFactor));

  // launch/spin er best-effort — leses fra rawJson via CSV-felt-navn.
  const avgLaunch = readOptionalAverage(rawJson, clubId, [
    "Launch Angle",
    "LaunchAngle",
    "launchAngle",
    "Launch",
  ]);
  const avgSpin = readOptionalAverage(rawJson, clubId, [
    "Spin Rate",
    "SpinRate",
    "spinRate",
    "Spin",
    "Total Spin",
    "TotalSpin",
  ]);

  if (category === "driver") {
    metrics.push(makeMetric("Launch", "°", DRIVER_TARGETS.launch, avgLaunch));
    metrics.push(makeMetric("Spin", "rpm", DRIVER_TARGETS.spin, avgSpin));
    metrics.push(makeMetric("Smash", "", DRIVER_TARGETS.smash, avgSmash));
  } else if (category === "iron") {
    const launchTarget = IRON_LAUNCH[clubId.toLowerCase()] ?? null;
    metrics.push(makeMetric("Launch", "°", launchTarget, avgLaunch));
    metrics.push(makeMetric("Smash", "", IRON_SMASH, avgSmash));
  } else if (category === "wedge") {
    const target = WEDGE_TARGETS[clubId.toUpperCase()] ?? null;
    metrics.push(makeMetric("Smash", "", target, avgSmash));
  } else if (category === "wood") {
    // Trefelger har ikke definert target — vis bare snitt-smash som info.
    metrics.push({
      label: "Smash",
      unit: "",
      target: null,
      value: round2(avgSmash),
      status: "missing",
      note: "Ingen target definert for trefelger",
    });
  }

  const overall = worstStatus(...metrics.map((m) => m.status));

  return {
    clubId,
    category,
    shotCount: shots.length,
    metrics,
    overall,
  };
}

function makeMetric(
  label: string,
  unit: string,
  target: MetricTarget | null,
  value: number | null,
): FitMetric {
  if (target === null) {
    return {
      label,
      unit,
      target: null,
      value: value !== null ? round2(value) : null,
      status: "missing",
      note: "Ingen target for denne køllen",
    };
  }
  if (value === null) {
    return {
      label,
      unit,
      target,
      value: null,
      status: "missing",
      note: `Data mangler i TrackMan-eksport`,
    };
  }
  const status = classifyValue(value, target);
  return {
    label,
    unit,
    target,
    value: round2(value),
    status,
    note: noteFor(status, label, value, target, unit),
  };
}

function noteFor(
  status: FitStatus,
  label: string,
  value: number,
  target: MetricTarget,
  unit: string,
): string {
  const v = unit === "rpm" ? Math.round(value) : round2(value);
  const range = `${target.min}-${target.max}${unit}`;
  if (status === "ok") return `${label} ${v}${unit} i target (${range})`;
  if (status === "warn")
    return `${label} ${v}${unit} utenfor target ${range}`;
  if (status === "critical")
    return `${label} ${v}${unit} — kritisk avvik fra target ${range}`;
  return `${label}: data mangler`;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
