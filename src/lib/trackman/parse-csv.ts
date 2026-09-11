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
// Begge kan ha en egen enhetsrad mellom overskriften og første slag.
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

type ParsedCsvRows = {
  headers: string[];
  unitRow: string[] | null;
  shotRows: string[][];
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

function speedUnitFromToken(value: string | undefined): TrackManSpeedUnit | undefined {
  const token = normalizeHeader(value ?? "");
  if (!token) return undefined;
  if (token === "mph") return "mph";
  if (token === "m/s" || token === "mps") return "m/s";
  return "unknown";
}

function distanceUnitFromToken(value: string | undefined): TrackManDistanceUnit | undefined {
  const token = normalizeHeader(value ?? "");
  if (!token) return undefined;
  if (/^(?:m|meters?|metres?)$/.test(token)) return "m";
  if (/^(?:yds?|yards?)$/.test(token)) return "yd";
  return "unknown";
}

function erTillattEnhetsverdi(field: CsvField, value: string): boolean {
  const token = normalizeHeader(value);
  if (!token) return true;
  if (field === "clubSpeedMps" || field === "ballSpeedMps") {
    return /^(?:mph|m\/s|mps|km\/?h|kmh|kph)$/.test(token);
  }
  if (field === "carryMeters" || field === "totalMeters" || field === "sideMeters") {
    return /^(?:m|meters?|metres?|yds?|yards?|ft|feet|cm)$/.test(token);
  }
  if (field === "launchAngleDeg") {
    return /^(?:deg|degrees?|grader?|°)$/.test(token);
  }
  if (field === "spinRateRpm") return token === "rpm";
  if (field === "smashFactor") return /^(?:-|ratio|x)$/.test(token);
  return false;
}

/**
 * TrackMan kan legge en egen enhetsrad mellom overskrift og første slag.
 * Ukjente eksportkolonner ignoreres; bare feltene vi faktisk bruker avgjør om
 * raden er en enhetsrad. Dermed tåles blant annet `deg` og `rpm` ved siden av
 * hastighet og avstand.
 */
function erEnhetsrad(row: string[], headerMap: HeaderMap): boolean {
  let antallEnheter = 0;
  for (const [field, binding] of Object.entries(headerMap) as [CsvField, HeaderBinding][]) {
    const value = row[binding.index]?.trim() ?? "";
    if (!value) continue;
    if (!erTillattEnhetsverdi(field, value)) return false;
    antallEnheter += 1;
  }
  return antallEnheter > 0;
}

function sourceUnitsFromHeaders(
  headerMap: HeaderMap,
  unitRow: string[] | null,
): TrackManSourceUnits | undefined {
  const sourceUnits: TrackManSourceUnits = {};
  const clubSpeed = headerMap.clubSpeedMps;
  const ballSpeed = headerMap.ballSpeedMps;
  const carry = headerMap.carryMeters;
  const total = headerMap.totalMeters;
  const side = headerMap.sideMeters;
  if (clubSpeed) {
    sourceUnits.clubSpeed = clubSpeed.speedUnit ?? speedUnitFromToken(unitRow?.[clubSpeed.index]);
  }
  if (ballSpeed) {
    sourceUnits.ballSpeed = ballSpeed.speedUnit ?? speedUnitFromToken(unitRow?.[ballSpeed.index]);
  }
  if (carry) {
    sourceUnits.carry = carry.distanceUnit ?? distanceUnitFromToken(unitRow?.[carry.index]);
  }
  if (total) {
    sourceUnits.total = total.distanceUnit ?? distanceUnitFromToken(unitRow?.[total.index]);
  }
  if (side) {
    sourceUnits.side = side.distanceUnit ?? distanceUnitFromToken(unitRow?.[side.index]);
  }
  for (const key of Object.keys(sourceUnits) as (keyof TrackManSourceUnits)[]) {
    if (sourceUnits[key] === undefined) delete sourceUnits[key];
  }
  return Object.keys(sourceUnits).length > 0 ? sourceUnits : undefined;
}

function delOppCsvRader(rows: string[][]): ParsedCsvRows | null {
  const headers = rows[0];
  if (!headers) return null;
  const headerMap = buildHeaderMap(headers);
  const dataRows = rows.slice(1).filter((row) => row.some((cell) => cell?.trim()));
  const unitRow = dataRows[0] && erEnhetsrad(dataRows[0], headerMap) ? dataRows[0] : null;
  return {
    headers,
    unitRow,
    shotRows: unitRow ? dataRows.slice(1) : dataRows,
  };
}

/**
 * Beholder overskrift og eventuell enhetsrad, men filtrerer faktiske slagrader
 * etter indeksene brukeren valgte i forhåndsvisningen.
 */
export function byggTrackManCsvMedValgteSlag(
  csv: string,
  selectedIndices: ReadonlySet<number>,
): string {
  const parsed = Papa.parse<string[]>(csv.trim(), {
    skipEmptyLines: true,
    delimiter: "",
  });
  if (parsed.errors.length > 0) return csv;
  const parts = delOppCsvRader(parsed.data);
  if (!parts) return csv;
  const selectedRows = parts.shotRows.filter((_, index) => selectedIndices.has(index));
  return Papa.unparse([
    parts.headers,
    ...(parts.unitRow ? [parts.unitRow] : []),
    ...selectedRows,
  ]);
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

  const parts = delOppCsvRader(rows);
  if (!parts) {
    return { ok: false, error: "Mangler header-rad" };
  }
  const headerMap = buildHeaderMap(parts.headers);
  const sourceUnits = sourceUnitsFromHeaders(headerMap, parts.unitRow);

  const shotsByDay = new Map<string, { date: Date; shots: TrackManShot[] }>();
  const fallbackDate = new Date();

  for (const row of parts.shotRows) {
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
