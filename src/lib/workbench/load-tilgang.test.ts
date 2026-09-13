import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import type { WorkbenchMode } from "@/lib/domain/workbench/types";

let tilgang = false;
let sessionLookups = 0;
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => ({ id: "coach-1", role: "COACH" }) },
});
mock.module("@/lib/auth/coached", {
  namedExports: { harCoachTilgangTilSpiller: async () => tilgang },
});
mock.module("@/lib/admin/stallen-data", { namedExports: { loadStallen: async () => [] } });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      workbenchSession: {
        findMany: async () => {
          sessionLookups += 1;
          return [];
        },
      },
      exerciseDefinition: { findMany: async () => { sessionLookups += 1; return []; } },
      trainingPlan: { findMany: async () => { sessionLookups += 1; return []; } },
    },
  },
});

let loadWeek: typeof import("./wb-actions").loadWeek;
let loadSources: typeof import("./wb-actions").loadSources;
before(async () => {
  ({ loadWeek, loadSources } = await import("./wb-actions"));
});

const mode: WorkbenchMode = { kind: "AGENCY", subjectId: "spiller-fremmed", sources: ["OEKTER"] };

test("Workbench uke lastes ikke uten stalltilgang", async () => {
  tilgang = false;
  sessionLookups = 0;
  const uke = await loadWeek({ weekStart: "2026-09-14", mode, playerId: "spiller-fremmed" });
  assert.equal(uke.ok, false);
  if (!uke.ok) assert.match(uke.error, /tilgang/i);
  assert.equal(sessionLookups, 0);
});

test("Workbench-kilder lastes ikke uten stalltilgang", async () => {
  tilgang = false;
  sessionLookups = 0;
  const kilder = await loadSources({ playerId: "spiller-fremmed", weekStart: "2026-09-14" });
  assert.equal(kilder.ok, false);
  if (!kilder.ok) assert.match(kilder.error, /tilgang/i);
  assert.equal(sessionLookups, 0);
});
