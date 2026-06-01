/**
 * GolfBox livescoring-klient.
 *
 * GolfBox eksponerer offentlige JSON-handlere på scores.golfbox.dk (samme data
 * som livescoring-widgetene bruker). Ingen innlogging, ingen robots-restriksjon
 * på scores.golfbox.dk. Vi henter terminliste + leaderboard for norske kunder.
 *
 * Verifisert 2026-06-01 — se docs/turnering-datakilder.md (§ VERIFISERT).
 *
 * Hver klubb OG hver tour er en numerisk CustomerId. Enumerering:
 *   GetCustomer → (filtrer NO/NGF) → GetSchedule → competition-IDer → GetLeaderboard.
 *
 * VIKTIG: responsene bruker JS-literaler (!0/!1) i stedet for true/false.
 * parseGolfBox() normaliserer dette før JSON.parse.
 */

import { z } from "zod";

const BASE = "https://scores.golfbox.dk";
const USER_AGENT = "AKGolfBot/1.0 (+akgolf.no)";

// Språk-koder GolfBox bruker (LCID). 1044 = norsk, 2057 = engelsk (UK).
export const LANG_NO = 1044;
export const LANG_EN = 2057;

// Snill mot kilden: minimum pause mellom kall.
const MIN_DELAY_MS = 400;
let lastCall = 0;

async function throttle(): Promise<void> {
  const wait = MIN_DELAY_MS - (Date.now() - lastCall);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastCall = Date.now();
}

/**
 * GolfBox returnerer minifisert JS-aktig JSON: `!0`/`!1` i stedet for true/false.
 * Normaliser før parsing. Tokenene opptrer kun som verdier (`:!0`, `,!0`, `[!0`).
 */
export function parseGolfBox<T = unknown>(text: string): T {
  const normalized = text
    .replace(/:!0([,}\]])/g, ":true$1")
    .replace(/:!1([,}\]])/g, ":false$1")
    .replace(/([,[])!0([,}\]])/g, "$1true$2")
    .replace(/([,[])!1([,}\]])/g, "$1false$2");
  return JSON.parse(normalized) as T;
}

async function fetchHandler<T>(path: string): Promise<T> {
  await throttle();
  const url = `${BASE}${path}`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`[golfbox] ${path} → HTTP ${res.status}`);
  }
  const text = await res.text();
  const data = parseGolfBox<{ IsError?: boolean; ErrorMessage?: string }>(text);
  if (data && typeof data === "object" && data.IsError) {
    throw new Error(`[golfbox] ${path} → ${data.ErrorMessage ?? "remote error"}`);
  }
  return data as T;
}

// ---------------------------------------------------------------------------
// GetCustomer — kundeinfo (klubb eller tour)
// ---------------------------------------------------------------------------

// GetCustomer pakker info under "Customer" (GetSchedule bruker "CustomerData").
const CustomerSchema = z.object({
  Customer: z.object({
    CustomerID: z.number(),
    Name: z.string(),
    GolfUnion: z.string().nullable().optional(),
    Nationality: z.string().nullable().optional(),
  }),
});

export type GolfBoxCustomer = {
  id: number;
  name: string;
  golfUnion: string | null;
  nationality: string | null;
};

export async function getCustomer(
  customerId: number,
): Promise<GolfBoxCustomer | null> {
  try {
    const raw = await fetchHandler<unknown>(
      `/Handlers/CustomersHandler/GetCustomer/CustomerId/${customerId}/language/${LANG_NO}`,
    );
    const parsed = CustomerSchema.safeParse(raw);
    if (!parsed.success) return null;
    const c = parsed.data.Customer;
    return {
      id: c.CustomerID,
      name: c.Name,
      golfUnion: c.GolfUnion ?? null,
      nationality: c.Nationality ?? null,
    };
  } catch {
    return null; // CUSTOMER_NOT_FOUND m.m. → hopp over
  }
}

// ---------------------------------------------------------------------------
// GetSchedule — terminliste per kunde (sesong → måned → events)
// ---------------------------------------------------------------------------

const ScheduleEntrySchema = z.object({
  ID: z.number(),
  Name: z.string(),
  Type: z.string().optional(),
  StartDate: z.string().optional(),
  EndDate: z.string().optional(),
  VenueName: z.string().nullable().optional(),
});

export type GolfBoxScheduleEvent = {
  competitionId: number;
  name: string;
  type: string | null;
  startDate: Date | null;
  endDate: Date | null;
  venue: string | null;
};

// GolfBox-datoformat: "20260214T000000"
export function parseGolfBoxDate(s: string | undefined | null): Date | null {
  if (!s || s.length < 8) return null;
  const y = +s.slice(0, 4);
  const m = +s.slice(4, 6);
  const d = +s.slice(6, 8);
  if (!y || !m || !d) return null;
  const date = new Date(Date.UTC(y, m - 1, d));
  return isNaN(date.getTime()) ? null : date;
}

export async function getSchedule(
  customerId: number,
): Promise<GolfBoxScheduleEvent[]> {
  const raw = await fetchHandler<{ CompetitionData?: unknown }>(
    `/Handlers/ScheduleHandler/GetSchedule/CustomerId/${customerId}/language/${LANG_NO}`,
  );

  const events: GolfBoxScheduleEvent[] = [];
  const seasons = (raw?.CompetitionData ?? {}) as Record<string, unknown>;

  // Struktur: CompetitionData → S{år} → Months → M{n} → Entries → E{id}
  for (const season of Object.values(seasons)) {
    const months = (season as { Months?: Record<string, unknown> })?.Months;
    if (!months) continue;
    for (const month of Object.values(months)) {
      const entries = (month as { Entries?: Record<string, unknown> })?.Entries;
      if (!entries) continue;
      for (const entry of Object.values(entries)) {
        const parsed = ScheduleEntrySchema.safeParse(entry);
        if (!parsed.success) continue;
        const e = parsed.data;
        events.push({
          competitionId: e.ID,
          name: e.Name,
          type: e.Type ?? null,
          startDate: parseGolfBoxDate(e.StartDate),
          endDate: parseGolfBoxDate(e.EndDate),
          venue: e.VenueName ?? null,
        });
      }
    }
  }
  return events;
}

// ---------------------------------------------------------------------------
// GetLeaderboard — full leaderboard (per spiller: posisjon, to-par, runder)
// ---------------------------------------------------------------------------

const ScoringToParSchema = z
  .object({
    ToParText: z.string().nullable().optional(),
    ToParValue: z.number().nullable().optional(),
    TodayText: z.string().nullable().optional(),
    HoleText: z.string().nullable().optional(),
    HoleValue: z.number().nullable().optional(),
  })
  .nullable()
  .optional();

const PositionSchema = z
  .object({
    Actual: z.number().nullable().optional(),
    Calculated: z.string().nullable().optional(),
  })
  .nullable()
  .optional();

const LeaderboardEntrySchema = z.object({
  Position: PositionSchema,
  ScoringToPar: ScoringToParSchema,
  FirstName: z.string().nullable().optional(),
  LastName: z.string().nullable().optional(),
  Nationality: z.string().nullable().optional(),
  BirthYear: z.number().nullable().optional(),
  ClubName: z.string().nullable().optional(),
  Wagr: z.unknown().optional(),
  // Rounds kan være dict (keyed) eller array — hold løst, normaliser i mapping.
  Rounds: z.unknown().optional(),
});

export type GolfBoxLeaderboardEntry = {
  position: number | null;
  positionText: string | null;
  toParText: string | null;
  toParValue: number | null;
  todayText: string | null;
  thru: number | null;
  thruText: string | null;
  firstName: string;
  lastName: string;
  nationality: string | null;
  birthYear: number | null;
  clubName: string | null;
  /** Brutto-score per runde (R1, R2, …). null der ikke spilt. */
  roundScores: (number | null)[];
};

export type GolfBoxLeaderboard = {
  competitionId: number;
  roundNames: string[];
  activeRound: number | null;
  isScoringOpen: boolean;
  entries: GolfBoxLeaderboardEntry[];
};

// ToParValue er skalert ×10000 i feeden (-230000 = -23). Foretrekk teksten.
function toParToNumber(
  text: string | null | undefined,
  value: number | null | undefined,
): number | null {
  if (text != null && text !== "") {
    if (/^E$/i.test(text)) return 0;
    const n = parseInt(text.replace(/[^0-9+-]/g, ""), 10);
    if (!isNaN(n)) return n;
  }
  if (typeof value === "number") return Math.round(value / 10000);
  return null;
}

function extractRoundScore(round: unknown): number | null {
  if (!round || typeof round !== "object") return null;
  const r = round as Record<string, unknown>;
  // Brutto-score for runden ligger i ResultSum.ActualText ("64") /
  // ActualValue (640000 = 64×10000).
  const sum = r.ResultSum as Record<string, unknown> | undefined;
  if (sum) {
    if (typeof sum.ActualText === "string" && sum.ActualText !== "") {
      const n = parseInt(sum.ActualText, 10);
      if (!isNaN(n)) return n;
    }
    if (typeof sum.ActualValue === "number") return Math.round(sum.ActualValue / 10000);
  }
  return null;
}

// Rounds kommer som dict (keyed pr. runde) eller array. Normaliser til ordnet liste.
function normalizeRounds(rounds: unknown): (number | null)[] {
  if (Array.isArray(rounds)) return rounds.map(extractRoundScore);
  if (rounds && typeof rounds === "object")
    return Object.values(rounds as Record<string, unknown>).map(extractRoundScore);
  return [];
}

type RawLeaderboard = {
  IsScoringOpen?: boolean;
  RoundNames?: string[];
  ActiveRoundNumber?: number | null;
  Entries?: Record<string, unknown>;
};

export async function getLeaderboard(
  competitionId: number,
): Promise<GolfBoxLeaderboard | null> {
  const raw = await fetchHandler<{ Classes?: Record<string, unknown> }>(
    `/Handlers/LeaderboardHandler/GetLeaderboard/CompetitionId/${competitionId}/language/${LANG_EN}`,
  );
  const classes = raw?.Classes;
  if (!classes) return null;

  let roundNames: string[] = [];
  let activeRound: number | null = null;
  let isScoringOpen = false;
  const entries: GolfBoxLeaderboardEntry[] = [];

  for (const cls of Object.values(classes)) {
    const lb = (cls as { Leaderboard?: RawLeaderboard } | null)?.Leaderboard;
    if (!lb) continue;
    if (Array.isArray(lb.RoundNames) && lb.RoundNames.length > roundNames.length)
      roundNames = lb.RoundNames;
    if (typeof lb.ActiveRoundNumber === "number") activeRound = lb.ActiveRoundNumber;
    if (lb.IsScoringOpen) isScoringOpen = true;

    const rawEntries =
      lb.Entries && typeof lb.Entries === "object"
        ? Object.values(lb.Entries)
        : [];
    for (const rawEntry of rawEntries) {
      const parsed = LeaderboardEntrySchema.safeParse(rawEntry);
      if (!parsed.success) continue;
      const e = parsed.data;
      const stp = e.ScoringToPar ?? {};
      entries.push({
        position: e.Position?.Actual ?? null,
        positionText: e.Position?.Calculated ?? null,
        toParText: stp.ToParText ?? null,
        toParValue: toParToNumber(stp.ToParText, stp.ToParValue),
        todayText: stp.TodayText ?? null,
        thru: typeof stp.HoleValue === "number" ? stp.HoleValue : null,
        thruText: stp.HoleText ?? null,
        firstName: (e.FirstName ?? "").trim(),
        lastName: (e.LastName ?? "").trim(),
        nationality: e.Nationality ?? null,
        birthYear: e.BirthYear ?? null,
        clubName: e.ClubName ?? null,
        roundScores: normalizeRounds(e.Rounds),
      });
    }
  }

  return {
    competitionId,
    roundNames,
    activeRound,
    isScoringOpen,
    entries,
  };
}
