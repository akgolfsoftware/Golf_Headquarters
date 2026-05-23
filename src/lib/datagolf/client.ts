/**
 * DataGolf API-klient.
 *
 * Docs: https://datagolf.com/api-access
 * Krav: DATAGOLF_API_KEY i .env
 *
 * Endpoints brukt:
 * - /get-schedule       — turneringskalender per tur
 * - /preds/live-tournament-stats — live leaderboard (under aktiv turnering)
 * - /preds/pre-tournament — pre-turnering odds + felt (vi bruker for deltakerliste)
 * - /player-list        — alle spillere i DataGolf-systemet (for å mappe nordmenn)
 *
 * Anti-pattern: Aldri cache disse svarene utenfor cron-jobben.
 * Bruk LeaderboardSnapshot-tabellen som DB-cache, og les fra DB i UI.
 */

const BASE = "https://feeds.datagolf.com";

export type DGTour = "pga" | "euro" | "kft" | "alt" | "champ" | "liv";

function key(): string {
  const k = process.env.DATAGOLF_API_KEY;
  if (!k) throw new Error("DATAGOLF_API_KEY ikke satt i .env");
  return k;
}

async function fetchJson<T>(path: string): Promise<T> {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${BASE}${path}${sep}key=${key()}&file_format=json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `[datagolf] ${path} → ${res.status}: ${body.slice(0, 200)}`,
    );
  }
  return (await res.json()) as T;
}

// ---------------------------------------------------------------------------
// Schedule
// ---------------------------------------------------------------------------

export type DGScheduleEvent = {
  event_id: number;
  event_name: string;
  start_date: string;
  course: string;
  course_key?: string;
  location: string;
  country: string;
  latitude?: number;
  longitude?: number;
  // "completed" | "in-progress" | "upcoming" | etc.
  status: string;
  tour: string;
  winner?: string;
};

export type DGScheduleResponse = {
  schedule: DGScheduleEvent[];
};

export async function getSchedule(tour: DGTour): Promise<DGScheduleEvent[]> {
  const data = await fetchJson<DGScheduleResponse>(`/get-schedule?tour=${tour}`);
  return data.schedule ?? [];
}

// ---------------------------------------------------------------------------
// Player list — for å finne norske spillere
// ---------------------------------------------------------------------------

export type DGPlayer = {
  dg_id: number;
  player_name: string; // "Hovland, Viktor"
  country: string; // Fullt navn, e.g. "Norway"
  country_code: string; // ISO 3-letter, e.g. "NOR"
  amateur?: 0 | 1;
};

// DataGolf returnerer player-list som direkte array (ikke wrapped).
export async function getAllPlayers(): Promise<DGPlayer[]> {
  return fetchJson<DGPlayer[]>(`/get-player-list`);
}

// Finn norske spillere ved å filtrere på country_code (NOR).
export async function getNorwegianPlayers(): Promise<DGPlayer[]> {
  const all = await getAllPlayers();
  return all.filter((p) => p.country_code === "NOR");
}

// ---------------------------------------------------------------------------
// Live tournament stats
// ---------------------------------------------------------------------------

export type DGLiveStatsRow = {
  dg_id: number;
  player_name: string;
  position?: string; // "T5", "CUT", "WD", "—"
  total?: number; // score-to-par
  thru?: number | string;
  round?: number;
  // ... mange flere felter avhengig av display_param
};

export type DGLiveStatsResponse = {
  event_name?: string;
  last_updated?: string;
  tour?: string;
  course?: string;
  live_stats?: DGLiveStatsRow[];
};

export async function getLiveTournamentStats(
  tour: DGTour = "pga",
): Promise<DGLiveStatsResponse> {
  return fetchJson<DGLiveStatsResponse>(
    `/preds/live-tournament-stats?tour=${tour}&stats=sg_total,sg_ott,sg_app,sg_arg,sg_putt,distance,accuracy`,
  );
}

// ---------------------------------------------------------------------------
// Pre-tournament — feltliste
// ---------------------------------------------------------------------------

export type DGPreTournamentRow = {
  dg_id: number;
  player_name: string;
  country?: string;
  // Mer felter avhengig av endpoint
};

export type DGPreTournamentResponse = {
  event_name?: string;
  field?: DGPreTournamentRow[];
};

export async function getTournamentField(
  tour: DGTour = "pga",
): Promise<DGPreTournamentRow[]> {
  const data = await fetchJson<DGPreTournamentResponse>(
    `/preds/pre-tournament?tour=${tour}&dead_heat=no&odds_format=decimal`,
  );
  return data.field ?? [];
}
