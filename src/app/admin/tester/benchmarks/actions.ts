"use server";

/**
 * Server actions for fasit-siden (/admin/tester/benchmarks):
 *  - godkjenn/avvis ventende DataGolf-justeringer (benchmarks_pending)
 *  - kjør synk manuelt (samme motor som mandags-cronen)
 *
 * Godkjenn: skriver de foreslåtte nivåene og RE-KALIBRERER baseline
 * (nye råverdier + nye nivåer blir nytt nullpunkt for drift).
 * Avvis: beholder dagens nivåer, men re-kalibrerer mot de nye råverdiene —
 * ellers ville samme forslag kommet tilbake hver mandag.
 */

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { runBenchmarkSync } from "@/lib/admin/benchmark-sync";
import {
  readSyncState,
  levelsAreMonotonic,
  type BenchmarksSync,
} from "@/lib/admin/benchmark-sync-schema";
import type { Benchmarks } from "@/lib/admin/test-benchmarks";

const PAGE = "/admin/tester/benchmarks";

async function loadPendingTest(testId: string) {
  const def = await prisma.testDefinition.findUnique({
    where: { id: testId },
    select: { id: true, protocol: true },
  });
  if (!def) return null;
  const state = readSyncState(def.protocol);
  if (!state.benchmarks || !state.pending) return null;
  return { def, state };
}

export async function approveBenchmarkPending(testId: string): Promise<void> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const loaded = await loadPendingTest(testId);
  if (!loaded) return;
  const { def, state } = loaded;
  const { benchmarks, pending, sync } = state;
  if (!benchmarks || !pending) return;

  if (!levelsAreMonotonic(benchmarks, pending.proposedLevels)) return;

  const now = new Date().toISOString();
  const nextBenchmarks: Benchmarks = {
    ...benchmarks,
    source: `datagolf-godkjent-${now.slice(0, 10)}`,
    levels: benchmarks.levels.map((l) => ({
      ...l,
      value: pending.proposedLevels[l.id] ?? l.value,
    })),
  };
  const nextSync: BenchmarksSync = {
    mode: sync?.mode ?? "auto",
    metric: sync?.metric ?? "driving_dist",
    baseline: pending.raw,
    baselineLevels: pending.proposedLevels,
    calibratedAt: now,
    lastRunAt: now,
    lastRaw: pending.raw,
  };

  const protocol = def.protocol as Record<string, unknown>;
  await prisma.testDefinition.update({
    where: { id: def.id },
    data: {
      protocol: {
        ...protocol,
        benchmarks: nextBenchmarks,
        benchmarks_sync: nextSync,
        benchmarks_pending: null,
      } as object,
    },
  });
  revalidatePath(PAGE);
  revalidatePath("/admin/tester");
}

export async function rejectBenchmarkPending(testId: string): Promise<void> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const loaded = await loadPendingTest(testId);
  if (!loaded) return;
  const { def, state } = loaded;
  const { benchmarks, pending, sync } = state;
  if (!benchmarks || !pending) return;

  const now = new Date().toISOString();
  // Dagens nivåer beholdes som fasit, men måles heretter mot de nye råverdiene.
  const nextSync: BenchmarksSync = {
    mode: sync?.mode ?? "auto",
    metric: sync?.metric ?? "driving_dist",
    baseline: pending.raw,
    baselineLevels: Object.fromEntries(benchmarks.levels.map((l) => [l.id, l.value])),
    calibratedAt: now,
    lastRunAt: now,
    lastRaw: pending.raw,
  };

  const protocol = def.protocol as Record<string, unknown>;
  await prisma.testDefinition.update({
    where: { id: def.id },
    data: {
      protocol: { ...protocol, benchmarks_sync: nextSync, benchmarks_pending: null } as object,
    },
  });
  revalidatePath(PAGE);
}

export async function runBenchmarkSyncNow(): Promise<void> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await runBenchmarkSync();
  revalidatePath(PAGE);
  revalidatePath("/admin/tester");
}
