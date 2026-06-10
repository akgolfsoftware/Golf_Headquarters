/**
 * Benchmark-autosync — cron-agent "benchmark-sync" (mandager 08:00 norsk tid).
 *
 * Holder DataGolf-fasitene i NGF-testbatteriet ferske:
 *   1. Henter ferske skill ratings fra DataGolf (PGA + Korn Ferry).
 *   2. Regner ankere: PGA topp 40 (snitt av topp 40 på SG total), PGA-snitt,
 *      KFT-snitt — for metrikker DataGolf faktisk måler (driver-lengde, fairway-%).
 *   3. Drift = ny råverdi / kalibrert baseline. Nivåverdiene skaleres med
 *      driften fra baselineLevels (estimat-nivåer følger PGA-snitt-driften).
 *   4. Endring ≤ 3 % → skrives automatisk. Over 3 % (eller brutt stige) →
 *      holdes som benchmarks_pending til godkjenning i /admin/tester/benchmarks.
 *   5. Telegram-rapport til Anders hver kjøring.
 *
 * Første kjøring per test KALIBRERER kun (lagrer baseline, endrer ingenting).
 * PEI-/putt-testene har referanseverdier uten ukentlig DataGolf-kilde og
 * synkes IKKE — de rapporteres som stabile.
 */

import { prisma } from "@/lib/prisma";
import { getSkillRatings, type DGSkillRatingRow } from "@/lib/datagolf/client";
import type { Benchmarks } from "./test-benchmarks";
import {
  readSyncState,
  levelsAreMonotonic,
  roundTo,
  unitDecimals,
  type BenchmarksSync,
  type SyncAnchors,
} from "./benchmark-sync-schema";

const MAX_AUTO_CHANGE_PCT = 3;

type AutoMetric = "driving_dist" | "driving_acc";

/** Tester med egne DataGolf-ankere. Nøkkel = protocol.benchmarks_key. */
const AUTO_TESTS: Record<string, { metric: AutoMetric; label: string }> = {
  driver_basic: { metric: "driving_dist", label: "Driver Basic" },
  driver_gate: { metric: "driving_acc", label: "Driver Gate" },
};

/** Tester som skygger en annen tests drift (CHS følger driver-lengde ~1:1). */
const FOLLOW_TESTS: Record<string, { follows: string; metric: AutoMetric; label: string }> = {
  chs: { follows: "driver_basic", metric: "driving_dist", label: "Clubhead Speed (CHS)" },
};

/** Synk-modus for en test, brukt av fasit-siden i CoachHQ. */
export function syncModeFor(key: string): "auto" | "follow" | "static" {
  if (key in AUTO_TESTS) return "auto";
  if (key in FOLLOW_TESTS) return "follow";
  return "static";
}

export type TestSyncStatus =
  | "calibrated"
  | "unchanged"
  | "applied"
  | "pending"
  | "skipped"
  | "error";

export type TestSyncResult = {
  key: string;
  label: string;
  status: TestSyncStatus;
  maxChangePct?: number;
  detail?: string;
};

export type BenchmarkSyncSummary = {
  ranAt: string;
  results: TestSyncResult[];
  staticCount: number;
  telegram: "sent" | "skipped" | "failed";
};

// ---------------------------------------------------------------------------
// Ankere fra DataGolf
// ---------------------------------------------------------------------------

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** PGA topp 40 (etter SG total) + PGA-snitt + KFT-snitt for én metrikk. */
function computeAnchors(
  pga: DGSkillRatingRow[],
  kft: DGSkillRatingRow[],
  metric: AutoMetric,
): SyncAnchors | null {
  const withMetric = pga.filter((r) => typeof r[metric] === "number");
  const pgaAvg = mean(withMetric.map((r) => r[metric] as number));
  if (pgaAvg == null) return null;

  const top40 = withMetric
    .filter((r) => typeof r.sg_total === "number")
    .sort((a, b) => (b.sg_total as number) - (a.sg_total as number))
    .slice(0, 40);
  const top40Avg = mean(top40.map((r) => r[metric] as number));

  const kftAvg = mean(
    kft.filter((r) => typeof r[metric] === "number").map((r) => r[metric] as number),
  );

  return {
    pga_avg: pgaAvg,
    ...(top40Avg != null ? { pga_top40: top40Avg } : {}),
    ...(kftAvg != null ? { dpw_kft: kftAvg } : {}),
  };
}

// ---------------------------------------------------------------------------
// Drift → forslag til nye nivåverdier
// ---------------------------------------------------------------------------

/** Skalerer baseline-nivåene med anker-drift. Estimat-nivåer følger PGA-snittet. */
function proposeLevels(
  benchmarks: Benchmarks,
  sync: BenchmarksSync,
  raw: SyncAnchors,
): Record<string, number> {
  const decimals = unitDecimals(benchmarks.unit);
  const ratioFor = (levelId: string): number => {
    const base = sync.baseline;
    if (levelId === "pga_top40" && raw.pga_top40 != null && base.pga_top40 != null) {
      return raw.pga_top40 / base.pga_top40;
    }
    if (levelId === "dpw_kft" && raw.dpw_kft != null && base.dpw_kft != null) {
      return raw.dpw_kft / base.dpw_kft;
    }
    return raw.pga_avg / base.pga_avg;
  };

  const out: Record<string, number> = {};
  for (const level of benchmarks.levels) {
    const baseValue = sync.baselineLevels[level.id] ?? level.value;
    out[level.id] = roundTo(baseValue * ratioFor(level.id), decimals);
  }
  return out;
}

function maxChangePct(benchmarks: Benchmarks, proposed: Record<string, number>): number {
  let max = 0;
  for (const level of benchmarks.levels) {
    const next = proposed[level.id];
    if (next == null || level.value === 0) continue;
    max = Math.max(max, (Math.abs(next - level.value) / Math.abs(level.value)) * 100);
  }
  return max;
}

// ---------------------------------------------------------------------------
// Telegram
// ---------------------------------------------------------------------------

async function notifyTelegram(text: string): Promise<"sent" | "skipped" | "failed"> {
  const token = process.env.MEG_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.MEG_TELEGRAM_ALLOWED_CHAT_ID;
  if (!token || !chatId) return "skipped";
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
    return res.ok ? "sent" : "failed";
  } catch {
    return "failed";
  }
}

function statusLine(r: TestSyncResult): string {
  const pct =
    r.maxChangePct != null ? ` (${r.maxChangePct.toFixed(1).replace(".", ",")} %)` : "";
  switch (r.status) {
    case "calibrated":
      return `· ${r.label}: kalibrert — baseline lagret, ingen endring`;
    case "unchanged":
      return `· ${r.label}: uendret`;
    case "applied":
      return `· ${r.label}: oppdatert automatisk${pct}`;
    case "pending":
      return `· ${r.label}: VENTER GODKJENNING${pct} — godkjenn i CoachHQ → Tester → Fasiter`;
    case "skipped":
      return `· ${r.label}: hoppet over — ${r.detail ?? "mangler data"}`;
    case "error":
      return `· ${r.label}: FEIL — ${r.detail ?? "ukjent"}`;
  }
}

// ---------------------------------------------------------------------------
// Hovedkjøring
// ---------------------------------------------------------------------------

async function syncOneTest(
  def: { id: string; protocol: unknown },
  label: string,
  raw: SyncAnchors,
  now: Date,
): Promise<TestSyncResult> {
  const state = readSyncState(def.protocol);
  const key = state.key ?? "?";
  if (!state.benchmarks) return { key, label, status: "skipped", detail: "mangler benchmarks" };
  const protocol = def.protocol as Record<string, unknown>;
  const iso = now.toISOString();

  // Første kjøring: kalibrer baseline, endre ingenting.
  if (!state.sync) {
    const sync: BenchmarksSync = {
      mode: key in FOLLOW_TESTS ? "follow" : "auto",
      metric: (AUTO_TESTS[key] ?? FOLLOW_TESTS[key])?.metric ?? "driving_dist",
      baseline: raw,
      baselineLevels: Object.fromEntries(state.benchmarks.levels.map((l) => [l.id, l.value])),
      calibratedAt: iso,
      lastRunAt: iso,
      lastRaw: raw,
    };
    await prisma.testDefinition.update({
      where: { id: def.id },
      data: { protocol: { ...protocol, benchmarks_sync: sync } as object },
    });
    return { key, label, status: "calibrated" };
  }

  const proposed = proposeLevels(state.benchmarks, state.sync, raw);
  const changePct = maxChangePct(state.benchmarks, proposed);
  const sync: BenchmarksSync = { ...state.sync, lastRunAt: iso, lastRaw: raw };
  const unchanged = state.benchmarks.levels.every((l) => proposed[l.id] === l.value);

  if (unchanged) {
    await prisma.testDefinition.update({
      where: { id: def.id },
      data: { protocol: { ...protocol, benchmarks_sync: sync } as object },
    });
    return { key, label, status: "unchanged" };
  }

  const monotonic = levelsAreMonotonic(state.benchmarks, proposed);
  if (changePct <= MAX_AUTO_CHANGE_PCT && monotonic) {
    const benchmarks: Benchmarks = {
      ...state.benchmarks,
      source: `datagolf-auto-${iso.slice(0, 10)}`,
      levels: state.benchmarks.levels.map((l) => ({ ...l, value: proposed[l.id] ?? l.value })),
    };
    await prisma.testDefinition.update({
      where: { id: def.id },
      data: {
        protocol: {
          ...protocol,
          benchmarks,
          benchmarks_sync: sync,
          benchmarks_pending: null,
        } as object,
      },
    });
    return { key, label, status: "applied", maxChangePct: changePct };
  }

  // Over grensen (eller brutt stige) → hold tilbake til godkjenning.
  await prisma.testDefinition.update({
    where: { id: def.id },
    data: {
      protocol: {
        ...protocol,
        benchmarks_sync: sync,
        benchmarks_pending: {
          proposedLevels: proposed,
          raw,
          maxChangePct: changePct,
          createdAt: iso,
          reason: monotonic
            ? `Endring over ${MAX_AUTO_CHANGE_PCT} %-grensen`
            : "Justeringen brøt nivåstigens rekkefølge",
        },
      } as object,
    },
  });
  return { key, label, status: "pending", maxChangePct: changePct };
}

export async function runBenchmarkSync(): Promise<BenchmarkSyncSummary> {
  const now = new Date();
  const [pga, kft] = await Promise.all([getSkillRatings("pga"), getSkillRatings("kft")]);

  const anchorsByMetric = new Map<AutoMetric, SyncAnchors | null>();
  for (const metric of ["driving_dist", "driving_acc"] as AutoMetric[]) {
    anchorsByMetric.set(metric, computeAnchors(pga, kft, metric));
  }

  const defs = await prisma.testDefinition.findMany({
    select: { id: true, name: true, protocol: true },
  });
  const byKey = new Map<string, { id: string; name: string; protocol: unknown }>();
  let staticCount = 0;
  for (const d of defs) {
    const state = readSyncState(d.protocol);
    if (!state.key || !state.benchmarks) continue;
    byKey.set(state.key, d);
    if (!(state.key in AUTO_TESTS) && !(state.key in FOLLOW_TESTS)) staticCount += 1;
  }

  const results: TestSyncResult[] = [];
  for (const [key, cfg] of [...Object.entries(AUTO_TESTS), ...Object.entries(FOLLOW_TESTS)]) {
    const def = byKey.get(key);
    if (!def) {
      results.push({ key, label: cfg.label, status: "skipped", detail: "ikke i databasen" });
      continue;
    }
    const raw = anchorsByMetric.get(cfg.metric) ?? null;
    if (!raw) {
      results.push({ key, label: cfg.label, status: "skipped", detail: "DataGolf ga ingen tall" });
      continue;
    }
    try {
      results.push(await syncOneTest(def, cfg.label, raw, now));
    } catch (err) {
      results.push({
        key,
        label: cfg.label,
        status: "error",
        detail: err instanceof Error ? err.message : "ukjent feil",
      });
    }
  }

  const dato = now.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit" });
  const text = [
    `NGF-fasiter — DataGolf-synk (${dato})`,
    ...results.map(statusLine),
    `· ${staticCount} tester med referanseverdier: stabile (ingen ukentlig kilde)`,
  ].join("\n");
  const telegram = await notifyTelegram(text);

  return { ranAt: now.toISOString(), results, staticCount, telegram };
}
