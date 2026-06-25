import type { WorkbenchData } from "@/lib/workbench/load-workbench";
import type { PlanStatus } from "@/generated/prisma/client";
import { mapPalette, mapWeek } from "./map-data";
import type { PaletteItem, WeekState } from "./types";

const EMPTY_WEEK: WeekState = { man: [], tir: [], ons: [], tor: [], fre: [], lor: [], son: [] };

export type WorkbenchSeedInput = {
  data?: WorkbenchData;
  planStatus?: PlanStatus | null;
};

export type WorkbenchSeed = {
  week: WeekState;
  palette: PaletteItem[];
  planStatusDisplay: PlanStatus | null;
};

/** Synkron klient-seed fra server-data — brukes som useReducer-init. */
export function buildWorkbenchSeed(input: WorkbenchSeedInput): WorkbenchSeed {
  return {
    week: mapWeek(input.data) ?? EMPTY_WEEK,
    palette: mapPalette(input.data),
    planStatusDisplay: input.planStatus ?? null,
  };
}