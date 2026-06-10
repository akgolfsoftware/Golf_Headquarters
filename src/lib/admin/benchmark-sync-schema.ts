/**
 * Zod-skjemaer og protocol-lesing for benchmark-autosync (DataGolf, mandager).
 *
 * Synk-tilstanden lever i TestDefinition.protocol (JSON) ved siden av
 * `benchmarks` — ingen skjemaendring:
 *   - `benchmarks_key`  — stabil id (seedet), kobler DB-rad til synk-konfig
 *   - `benchmarks_sync` — kalibrert baseline (råverdier + nivåverdier)
 *   - `benchmarks_pending` — foreslått oppdatering som venter på godkjenning
 *
 * Alt leses med safeParse — aldri blind cast av JSON-blobs.
 */

import { z } from "zod";
import { benchmarksSchema, type Benchmarks } from "./test-benchmarks";

/** Råverdier (i metrikkens egen enhet) for ankerne i nivåstigen. */
export const syncAnchorsSchema = z.object({
  pga_top40: z.number().optional(),
  pga_avg: z.number(),
  dpw_kft: z.number().optional(),
});
export type SyncAnchors = z.infer<typeof syncAnchorsSchema>;

export const benchmarksSyncSchema = z.object({
  /** "auto" = egne ankere fra DataGolf · "follow" = skygger en annen tests drift. */
  mode: z.enum(["auto", "follow"]),
  /** DataGolf-metrikk baseline er målt mot, f.eks. "driving_dist". */
  metric: z.string(),
  baseline: syncAnchorsSchema,
  /** Nivåverdiene slik de var ved kalibrering — drift regnes alltid herfra. */
  baselineLevels: z.record(z.string(), z.number()),
  calibratedAt: z.string(),
  lastRunAt: z.string().optional(),
  lastRaw: syncAnchorsSchema.optional(),
});
export type BenchmarksSync = z.infer<typeof benchmarksSyncSchema>;

export const benchmarksPendingSchema = z.object({
  proposedLevels: z.record(z.string(), z.number()),
  raw: syncAnchorsSchema,
  /** Største foreslåtte endring i prosent — grunnen til at den holdes tilbake. */
  maxChangePct: z.number(),
  createdAt: z.string(),
  reason: z.string(),
});
export type BenchmarksPending = z.infer<typeof benchmarksPendingSchema>;

export type ProtocolSyncState = {
  key: string | null;
  benchmarks: Benchmarks | null;
  sync: BenchmarksSync | null;
  pending: BenchmarksPending | null;
};

/** Trygg lesing av hele synk-tilstanden fra en protocol-JSON. */
export function readSyncState(protocol: unknown): ProtocolSyncState {
  const empty: ProtocolSyncState = { key: null, benchmarks: null, sync: null, pending: null };
  if (!protocol || typeof protocol !== "object") return empty;
  const p = protocol as Record<string, unknown>;

  const key = typeof p.benchmarks_key === "string" ? p.benchmarks_key : null;

  const bm = p.benchmarks != null ? benchmarksSchema.safeParse(p.benchmarks) : null;
  const sync = p.benchmarks_sync != null ? benchmarksSyncSchema.safeParse(p.benchmarks_sync) : null;
  const pending =
    p.benchmarks_pending != null ? benchmarksPendingSchema.safeParse(p.benchmarks_pending) : null;

  return {
    key,
    benchmarks: bm?.success ? bm.data : null,
    sync: sync?.success ? sync.data : null,
    pending: pending?.success ? pending.data : null,
  };
}

/** Antall desimaler per benchmark-enhet ved avrunding av nye nivåverdier. */
export function unitDecimals(unit: Benchmarks["unit"]): number {
  return unit === "pei_percent" ? 1 : 0;
}

export function roundTo(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/** Nivåstigen må forbli riktig ordnet (beste → svakeste) etter justering. */
export function levelsAreMonotonic(
  benchmarks: Benchmarks,
  values: Record<string, number>,
): boolean {
  for (let i = 1; i < benchmarks.levels.length; i += 1) {
    const prev = values[benchmarks.levels[i - 1].id];
    const curr = values[benchmarks.levels[i].id];
    if (prev == null || curr == null) return false;
    const ok = benchmarks.direction === "higher" ? curr <= prev : curr >= prev;
    if (!ok) return false;
  }
  return true;
}
