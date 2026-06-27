import "server-only";

/**
 * Klient mot AK Golf Intelligence sin delbare lese-API (`/api/v1`).
 *
 * AK Golf Intelligence er master for referanse-/proff-data (DataGolf, WAGR,
 * SG-benchmarks, turneringer, kohort, college). HQ henter herfra i stedet for
 * å vedlikeholde sine egne kopier.
 *
 * Konfig (server-side, aldri i klient):
 *   INTELLIGENCE_API_URL — base-URL til Intelligence (uten /api/v1), f.eks.
 *     https://ak-golf-intelligence.vercel.app  (lokalt: http://localhost:<port>)
 *   INTELLIGENCE_API_KEY — delt API-nøkkel (Bearer).
 *
 * Kontrakt: ak-golf-intelligence/docs/public-api.md.
 */

const BASE = process.env.INTELLIGENCE_API_URL?.replace(/\/$/, "") ?? "";
const KEY = process.env.INTELLIGENCE_API_KEY ?? "";

export type IntelOptions = {
  /** Cache-levetid i sekunder (Next.js fetch revalidate). Default 1 t. 0 = ingen cache. */
  revalidateSeconds?: number;
  /** AbortSignal for timeout/avbrudd. */
  signal?: AbortSignal;
};

export class IntelligenceApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
  ) {
    super(message);
    this.name = "IntelligenceApiError";
  }
}

/** Er API-et konfigurert? Bruk for å falle tilbake til HQ-lokal data i overgangsfasen. */
export function intelligenceConfigured(): boolean {
  return BASE.length > 0 && KEY.length > 0;
}

function buildUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(`${BASE}/api/v1${path.startsWith("/") ? path : `/${path}`}`);
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

/**
 * Generisk GET mot Intelligence-API-et. Pakker ut `{ data }`-konvolutten.
 * Kaster IntelligenceApiError ved ikke-2xx eller manglende konfig.
 */
export async function intelGet<T>(
  path: string,
  params?: Record<string, string | number | undefined>,
  opts: IntelOptions = {},
): Promise<T> {
  if (!intelligenceConfigured()) {
    throw new IntelligenceApiError(
      "Intelligence-API ikke konfigurert (mangler INTELLIGENCE_API_URL/KEY)",
      0,
      path,
    );
  }
  const res = await fetch(buildUrl(path, params), {
    headers: { authorization: `Bearer ${KEY}`, accept: "application/json" },
    signal: opts.signal,
    next: { revalidate: opts.revalidateSeconds ?? 3600 },
  });
  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { error?: string };
      detail = body?.error ? ` — ${body.error}` : "";
    } catch {
      /* ignore */
    }
    throw new IntelligenceApiError(`GET ${path} → ${res.status}${detail}`, res.status, path);
  }
  const body = (await res.json()) as { data: T };
  return body.data;
}

/* ── Typede endepunkt-wrappere ──────────────────────────────────────── */
// Formene speiler dashboard-tabellene i Intelligence (Drizzle). Holdt løse
// (Record/partial) der HQ ikke trenger streng typing — valider med zod på
// forbrukssiden hvis en verdi er forretningskritisk.

export type SgBenchmark = {
  handicapLevel: number;
  category: string;
  otAvg: number | null;
  appAvg: number | null;
  argAvg: number | null;
  puttAvg: number | null;
  t2gAvg: number | null;
  confidence: string | null;
};

export type WagrPlayer = {
  id: number;
  wagrId: string;
  name: string;
  gender: string | null;
  rank: number | null;
  lastUpdated: string | null;
};

export type DgPlayer = {
  dgId: number;
  name: string;
  countryIso3: string | null;
  birthYear: number | null;
  amateur: boolean | null;
};

/** SG-benchmarks. Uten `handicapLevel` → alle nivåer. */
export function getSgBenchmarks(handicapLevel?: number, opts?: IntelOptions) {
  return intelGet<SgBenchmark[]>("/sg/benchmarks", { handicapLevel }, opts);
}

export function getWagrPlayers(
  params?: { nationality?: string; search?: string; limit?: number; cursor?: number },
  opts?: IntelOptions,
) {
  return intelGet<WagrPlayer[]>("/wagr/players", params, opts);
}

export function getWagrPlayer(id: number, opts?: IntelOptions) {
  return intelGet<{ player: WagrPlayer; events: unknown[] }>(`/wagr/players/${id}`, undefined, opts);
}

export function getDatagolfPlayers(
  params?: { tour?: string; country?: string; search?: string; limit?: number; cursor?: number },
  opts?: IntelOptions,
) {
  return intelGet<DgPlayer[]>("/datagolf/players", params, opts);
}

export function getDatagolfPlayer(dgId: number, opts?: IntelOptions) {
  return intelGet<{ player: DgPlayer; summary: unknown; latestSkill: unknown; proHistory: unknown }>(
    `/datagolf/players/${dgId}`,
    undefined,
    opts,
  );
}

export function getDatagolfRounds(
  params: { dgId: number; tour?: string; fromYear?: number; toYear?: number; limit?: number; cursor?: number },
  opts?: IntelOptions,
) {
  return intelGet<unknown[]>("/datagolf/rounds", params, opts);
}

export function getDatagolfSkillRatingsTop(limit?: number, opts?: IntelOptions) {
  return intelGet<unknown[]>("/datagolf/skill-ratings/top", { limit }, opts);
}

export function getTournaments(
  params?: { source?: string; year?: number; search?: string; limit?: number; cursor?: number },
  opts?: IntelOptions,
) {
  return intelGet<{ items: unknown[]; nextCursor: number | null }>("/tournaments", params, opts);
}

export function getTournament(id: number, opts?: IntelOptions) {
  return intelGet<{ tournament: unknown; results: unknown[] }>(`/tournaments/${id}`, undefined, opts);
}

export function getCohortProgression(birthYear: number, opts?: IntelOptions) {
  return intelGet<unknown[]>("/cohort/progression", { birthYear }, opts);
}

export function getCollegePipeline(years?: number[], opts?: IntelOptions) {
  return intelGet<unknown[]>(
    "/college/pipeline",
    { years: years && years.length > 0 ? years.join(",") : undefined },
    opts,
  );
}
