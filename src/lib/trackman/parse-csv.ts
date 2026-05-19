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
  clubSpeedMps: number | null;
  ballSpeedMps: number | null;
  smashFactor: number | null;
  carryMeters: number | null;
  totalMeters: number | null;
  launchAngleDeg: number | null;
  spinRateRpm: number | null;
  sideMeters: number | null;
  notes: string | null;
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

const COLUMN_ALIASES: Record<keyof TrackManShot | "date", string[]> = {
  date: ["date", "dato", "session date", "shot date", "timestamp"],
  club: ["club", "klubbe", "kølle", "club type"],
  clubSpeedMps: ["club speed", "club speed (m/s)", "club speed mps", "klubbhastighet"],
  ballSpeedMps: ["ball speed", "ball speed (m/s)", "ball speed mps", "ballhastighet"],
  smashFactor: ["smash", "smash factor", "smash-factor"],
  carryMeters: ["carry", "carry distance", "carry (m)", "carry meters"],
  totalMeters: ["total", "total distance", "total (m)", "total meters"],
  launchAngleDeg: ["launch", "launch angle", "launch angle (deg)"],
  spinRateRpm: ["spin", "spin rate", "spin rate (rpm)"],
  sideMeters: ["side", "side (m)", "side total"],
  notes: ["note", "notes", "comment", "kommentar"],
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildHeaderMap(headers: string[]): Partial<Record<keyof typeof COLUMN_ALIASES, number>> {
  const map: Partial<Record<keyof typeof COLUMN_ALIASES, number>> = {};
  headers.forEach((raw, idx) => {
    const h = normalizeHeader(raw);
    for (const [field, aliases] of Object.entries(COLUMN_ALIASES) as [
      keyof typeof COLUMN_ALIASES,
      string[],
    ][]) {
      if (aliases.includes(h) && map[field] === undefined) {
        map[field] = idx;
      }
    }
  });
  return map;
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

  const shotsByDay = new Map<string, { date: Date; shots: TrackManShot[] }>();
  const fallbackDate = new Date();

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.every((c) => !c || c.trim() === "")) continue;

    const dateRaw = headerMap.date !== undefined ? row[headerMap.date] : undefined;
    const recordedAt = parseDate(dateRaw) ?? fallbackDate;
    const key = dayKey(recordedAt);

    const shot: TrackManShot = {
      club: headerMap.club !== undefined ? row[headerMap.club]?.trim() || null : null,
      clubSpeedMps:
        headerMap.clubSpeedMps !== undefined ? parseNumber(row[headerMap.clubSpeedMps]) : null,
      ballSpeedMps:
        headerMap.ballSpeedMps !== undefined ? parseNumber(row[headerMap.ballSpeedMps]) : null,
      smashFactor:
        headerMap.smashFactor !== undefined ? parseNumber(row[headerMap.smashFactor]) : null,
      carryMeters:
        headerMap.carryMeters !== undefined ? parseNumber(row[headerMap.carryMeters]) : null,
      totalMeters:
        headerMap.totalMeters !== undefined ? parseNumber(row[headerMap.totalMeters]) : null,
      launchAngleDeg:
        headerMap.launchAngleDeg !== undefined ? parseNumber(row[headerMap.launchAngleDeg]) : null,
      spinRateRpm:
        headerMap.spinRateRpm !== undefined ? parseNumber(row[headerMap.spinRateRpm]) : null,
      sideMeters:
        headerMap.sideMeters !== undefined ? parseNumber(row[headerMap.sideMeters]) : null,
      notes: headerMap.notes !== undefined ? row[headerMap.notes]?.trim() || null : null,
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
