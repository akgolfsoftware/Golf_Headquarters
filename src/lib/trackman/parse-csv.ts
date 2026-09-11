// Sprint 3 — TrackMan CSV-parser.
//
// Parser TrackMan-eksportert CSV/tekst til strukturerte sessions med metrics.
// TrackMan eksporterer typisk per-slag-rader. Vi aggregerer per dato (recordedAt)
// og bygger rawJson med shots-array + sammendrag (snitt, max, antall).
//
// Støtter to format-varianter vi har sett i praksis:
//   1. "Standard"-eksport med kolonner: Date, Club, Club Speed, Ball Speed,
//      Smash Factor, Carry, Total, Launch Angle, Spin Rate, Side, ...
//   2. Mer kompakte rapporter med samme felter under norske/engelske synonymer.
//
// Hele rad-mappingen er forsiktig — ukjente kolonner ignoreres uten å feile.

import Papa from "papaparse";

export type TrackManShot = {
  club: string | null;
  /** Råverdi fra kilden. `sourceUnits` eier den faktiske enheten. */
  clubSpeedMps: number | null;
  /** Råverdi fra kilden. `sourceUnits` eier den faktiske enheten. */
  ballSpeedMps: number | null;
  smashFactor: number | null;
  carryMeters: number | null;
  totalMeters: number | null;
  launchAngleDeg: number | null;
  spinRateRpm: number | null;
  sideMeters: number | null;
  notes: string | null;
  /**
   * Enheter som sto eksplisitt i kildeoverskriften. Manglende felt betyr at
   * kilden ikke oppga enhet; `unknown` betyr at den oppga en enhet vi ikke
   * støtter og derfor ikke skal gjette oss fram til.
   */
  sourceUnits?: TrackManSourceUnits;
};

export type TrackManSpeedUnit = "mph" | "m/s" | "unknown";
export type TrackManDistanceUnit = "m" | "yd" | "unknown";

export type TrackManSourceUnits = {
  clubSpeed?: TrackManSpeedUnit;
  ballSpeed?: TrackManSpeedUnit;
  carry?: TrackManDistanceUnit;
  total?: TrackManDistanceUnit;
  side?: TrackManDistanceUnit;
};

export type TrackManAggregatedSession = {
  recordedAt: Date;
  shotCount: number;
  rawJson: {
    summary: {
      avgClubSpeed: number | null;
      avgBallSpeed: number | null;
      avgSmash: number | null;
      avgCarry: number | null;
      maxCarry: number | null;
      clubs: string[];
    };
    shots: TrackManShot[];
  };
};

export type TrackManParseResult = {
  ok: true;
  sessions: TrackManAggregatedSession[];
} | {
  ok: false;
  error: string;
};

type CsvField = Exclude<keyof TrackManShot, "sourceUnits"> | "date";

const COLUMN_ALIASES: Record<CsvField, string[]> = {
  date: ["date", "dato", "session date", "shot date", "timestamp"],
  club: ["club", "klubbe", "kølle", "club type"],
  clubSpeedMps: ["club speed", "klubbhastighet"],
  ballSpeedMps: ["ball speed", "ballhastighet"],
  smashFactor: ["smash", "smash factor", "smash-factor"],
  carryMeters: ["carry", "carry distance"],
  totalMeters: ["total", "total distance"],
  launchAngleDeg: ["launch", "launch angle", "launch angle (deg)"],
  spinRateRpm: ["spin", "spin rate", "spin rate (rpm)"],
  sideMeters: ["side", "side total"],
  notes: ["note", "notes", "comment", "kommentar"],
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, " ");
}

type HeaderBinding = {
  index: number;
  speedUnit?: TrackManSpeedUnit;
  distanceUnit?: TrackManDistanceUnit;
};

type HeaderMap = Partial<Record<CsvField, HeaderBinding>>;

function headerBase(header: string): string {
  return normalizeHeader(header)
    .replace(/\s*\([^)]*\)\s*/g, " ")
    .replace(/\s*\[[^\]]*\]\s*/g, " ")
    .replace(/\s+(?:mph|mps|m\/s|met(?:er|re)s?|m|yds?|yards?)$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function explicitUnitToken(header: string): string | null {
  const normalized = normalizeHeader(header);
  const parenthesized = /\(\s*([^)]+?)\s*\)/.exec(normalized);
  if (parenthesized) return parenthesized[1]?.trim() ?? null;
  const bracketed = /\[\s*([^\]]+?)\s*\]/.exec(normalized);
  if (bracketed) return bracketed[1]?.trim() ?? null;
  const suffix = /\s+(mph|mps|m\/s|met(?:er|re)s?|m|yds?|yards?)$/i.exec(normalized);
  return suffix?.[1]?.trim() ?? null;
}

function speedUnitFromHeader(header: string): TrackManSpeedUnit | undefined {
  const token = explicitUnitToken(header);
  if (token == null) return undefined;
  if (token === "mph") return "mph";
  if (token === "m/s" || token === "mps") return "m/s";
  return "unknown";
}

function distanceUnitFromHeader(header: string): TrackManDistanceUnit | undefined {
  const token = explicitUnitToken(header);
  if (token == null) return undefined;
  if (/^(?:m|meters?|metres?)$/.test(token)) return "m";
  if (/^(?:yds?|yards?)$/.test(token)) return "yd";
  return "unknown";
}

function buildHeaderMap(headers: string[]): HeaderMap {
  const map: HeaderMap = {};
  headers.forEach((raw, idx) => {
    const h = headerBase(raw);
    for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as [
      CsvField,
      string[],
    ][]) {
      if (aliases.includes(h) && map[field] === undefined) {
        const binding: HeaderBinding = { index: idx };
        if (field === "clubSpeedMps" || field === "ballSpeedMps") {
          binding.speedUnit = speedUnitFromHeader(raw);
        }
        if (field === "carryMeters" || field === "totalMeters" || field === "sideMeters") {
          binding.distanceUnit = distanceUnitFromHeader(raw);
        }
        map[field] = binding;
      }
    }
  });
  return map;
}

function sourceUnitsFromHeaders(headerMap: HeaderMap): TrackManSourceUnits | undefined {
  const sourceUnits: TrackManSourceUnits = {};
  if (headerMap.clubSpeedMps?.speedUnit) sourceUnits.clubSpeed = headerMap.clubSpeedMps.speedUnit;
  if (headerMap.ballSpeedMps?.speedUnit) sourceUnits.ballSpeed = headerMap.ballSpeedMps.speedUnit;
  if (headerMap.carryMeters?.distanceUnit) sourceUnits.carry = headerMap.carryMeters.distanceUnit;
  if (headerMap.totalMeters?.distanceUnit) sourceUnits.total = headerMap.totalMeters.distanceUnit;
  if (headerMap.sideMeters?.distanceUnit) sourceUnits.side = headerMap.sideMeters.distanceUnit;
  return Object.keys(sourceUnits).length > 0 ? sourceUnits : undefined;
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const trimmed = value.replace(/\s/g, "").replace(",", ".");
  if (trimmed === "" || trimmed === "-") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function parseDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (typeof value !== "string" || value.trim() === "") return null;
  const trimmed = value.trim();
  // Prøv ISO først.
  let d = new Date(trimmed);
  if (!Number.isNaN(d.getTime())) return d;
  // Prøv DD.MM.YYYY eller DD/MM/YYYY.
  const norMatch = trimmed.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})/);
  if (norMatch) {
    const day = Number(norMatch[1]);
    const month = Number(norMatch[2]);
    let year = Number(norMatch[3]);
    if (year < 100) year += 2000;
    d = new Date(Date.UTC(year, month - 1, day));
    if (!Number.isNaN(d.getTime())) return d;
  }
  return null;
}

function dayKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function avg(arr: (number | null)[]): number | null {
  const nums = arr.filter((n): n is number => typeof n === "number");
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100) / 100;
}

function max(arr: (number | null)[]): number | null {
  const nums = arr.filter((n): n is number => typeof n === "number");
  if (nums.length === 0) return null;
  return Math.round(Math.max(...nums) * 100) / 100;
}

/**
 * Parser TrackMan-CSV (rådata eller eksport-streng) til aggregerte sessions.
 *
 * Returnerer en session per kalenderdag i input. Tomme rader/kolonner ignoreres.
 * Hvis ingen Date-kolonne finnes brukes "i dag" som fallback.
 */
export function parseTrackManCsv(csv: string): TrackManParseResult {
  const trimmed = csv.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: "Tom CSV-input" };
  }

  const parsed = Papa.parse<string[]>(trimmed, {
    skipEmptyLines: true,
    delimiter: "", // auto-detekter , ; eller tab
  });
  if (parsed.errors.length > 0) {
    const first = parsed.errors[0];
    return { ok: false, error: `CSV-feil: ${first?.message ?? "ukjent"}` };
  }
  const rows = parsed.data;
  if (rows.length < 2) {
    return { ok: false, error: "CSV må ha header + minst én rad" };
  }

  const headers = rows[0];
  if (!headers) {
    return { ok: false, error: "Mangler header-rad" };
  }
  const headerMap = buildHeaderMap(headers);
  const sourceUnits = sourceUnitsFromHeaders(headerMap);

  const shotsByDay = new Map<string, { date: Date; shots: TrackManShot[] }>();
  const fallbackDate = new Date();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => !c || c.trim() === "")) continue;

    const dateRaw = headerMap.date ? row[headerMap.date.index] : undefined;
    const recordedAt = parseDate(dateRaw) ?? fallbackDate;
    const key = dayKey(recordedAt);

    const shot: TrackManShot = {
      club: headerMap.club ? row[headerMap.club.index]?.trim() || null : null,
      clubSpeedMps:
        headerMap.clubSpeedMps ? parseNumber(row[headerMap.clubSpeedMps.index]) : null,
      ballSpeedMps:
        headerMap.ballSpeedMps ? parseNumber(row[headerMap.ballSpeedMps.index]) : null,
      smashFactor:
        headerMap.smashFactor ? parseNumber(row[headerMap.smashFactor.index]) : null,
      carryMeters:
        headerMap.carryMeters ? parseNumber(row[headerMap.carryMeters.index]) : null,
      totalMeters:
        headerMap.totalMeters ? parseNumber(row[headerMap.totalMeters.index]) : null,
      launchAngleDeg:
        headerMap.launchAngleDeg ? parseNumber(row[headerMap.launchAngleDeg.index]) : null,
      spinRateRpm:
        headerMap.spinRateRpm ? parseNumber(row[headerMap.spinRateRpm.index]) : null,
      sideMeters:
        headerMap.sideMeters ? parseNumber(row[headerMap.sideMeters.index]) : null,
      notes: headerMap.notes ? row[headerMap.notes.index]?.trim() || null : null,
      ...(sourceUnits ? { sourceUnits } : {}),
    };

    const existing = shotsByDay.get(key);
    if (existing) {
      existing.shots.push(shot);
    } else {
      shotsByDay.set(key, { date: recordedAt, shots: [shot] });
    }
  }

  const sessions: TrackManAggregatedSession[] = Array.from(shotsByDay.values()).map((entry) => {
    const shots = entry.shots;
    const clubs = Array.from(
      new Set(shots.map((s) => s.club).filter((c): c is string => c !== null)),
    );
    return {
      recordedAt: entry.date,
      shotCount: shots.length,
      rawJson: {
        summary: {
          avgClubSpeed: avg(shots.map((s) => s.clubSpeedMps)),
          avgBallSpeed: avg(shots.map((s) => s.ballSpeedMps)),
          avgSmash: avg(shots.map((s) => s.smashFactor)),
          avgCarry: avg(shots.map((s) => s.carryMeters)),
          maxCarry: max(shots.map((s) => s.carryMeters)),
          clubs,
        },
        shots,
      },
    };
  });

  if (sessions.length === 0) {
    return { ok: false, error: "Ingen gyldige rader funnet i CSV" };
  }

  return { ok: true, sessions };
}
