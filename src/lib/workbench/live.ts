import { z } from "zod";

import type { WorkbenchSession } from "@/lib/domain/workbench/types";

const LiveDrillSchema = z.object({
  drillId: z.string().min(1),
  reps: z.number().int().min(0).max(5000),
  elapsedSec: z.number().int().min(0).max(86400),
  status: z.enum(["done", "active", "queued"]),
});

const WorkbenchLiveSnapshotSchema = z.object({
  startedAtISO: z.string(),
  totalSec: z.number().int().min(0).max(604800),
  updatedAtISO: z.string(),
  drills: z.array(LiveDrillSchema).max(100),
  seriesTargets: z.record(z.string(), z.number().int().min(1).max(12)).optional(),
});

export type WorkbenchLiveDrill = z.infer<typeof LiveDrillSchema>;
export type WorkbenchLiveSnapshot = z.infer<typeof WorkbenchLiveSnapshotSchema> & {
  seriesTargets: Record<string, number>;
};

export type WorkbenchLiveData = {
  current: WorkbenchSession | null;
  next: WorkbenchSession | null;
  snapshot: WorkbenchLiveSnapshot | null;
  from: string;
  to: string;
};

export function initialWorkbenchLiveSnapshot(
  drillIds: string[],
  startedAtISO = new Date().toISOString(),
): WorkbenchLiveSnapshot {
  return {
    startedAtISO,
    totalSec: 0,
    updatedAtISO: startedAtISO,
    drills: drillIds.map((drillId, index) => ({
      drillId,
      reps: 0,
      elapsedSec: 0,
      status: index === 0 ? "active" : "queued",
    })),
    seriesTargets: Object.fromEntries(drillIds.map((drillId) => [drillId, 3])),
  };
}

export function parseWorkbenchLiveSnapshot(
  value: unknown,
  drillIds: string[],
  fallbackStartedAtISO: string,
): WorkbenchLiveSnapshot {
  const parsed = WorkbenchLiveSnapshotSchema.safeParse(value);
  if (!parsed.success) {
    return initialWorkbenchLiveSnapshot(drillIds, fallbackStartedAtISO);
  }

  const saved = new Map(parsed.data.drills.map((drill) => [drill.drillId, drill]));
  const drills = drillIds.map((drillId, index) => saved.get(drillId) ?? {
    drillId,
    reps: 0,
    elapsedSec: 0,
    status: index === 0 ? "active" as const : "queued" as const,
  });
  if (drills.length > 0 && !drills.some((drill) => drill.status === "active") && drills.some((drill) => drill.status !== "done")) {
    const firstQueued = drills.find((drill) => drill.status === "queued");
    if (firstQueued) firstQueued.status = "active";
  }

  return {
    ...parsed.data,
    drills,
    seriesTargets: Object.fromEntries(
      drillIds.map((drillId) => [drillId, parsed.data.seriesTargets?.[drillId] ?? 3]),
    ),
  };
}
