/**
 * Domain unit tests for Stall · dag (Loop 6 / C2). Pure — no DB, no React.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildStallDagViewModel } from "./stall-dag";
import type { WorkbenchSession } from "./types";

function okt(overrides: Partial<WorkbenchSession> & Pick<WorkbenchSession, "id" | "playerId">): WorkbenchSession {
  return {
    coachId: "coach-1",
    date: "2026-08-22",
    startMinute: 540,
    durationMinutes: 60,
    title: "Teknikk-blokk",
    pyramid: "TEK",
    status: "DRAFT",
    blockType: "OEKT",
    drills: [],
    origin: "COACH",
    createdAt: "2026-08-22T06:00:00.000Z",
    updatedAt: "2026-08-22T06:00:00.000Z",
    createdBy: "COACH",
    ...overrides,
  };
}

describe("buildStallDagViewModel", () => {
  it("grupperer økter per spiller og sorterer stigende på starttid", () => {
    const spillere = [
      { id: "p1", navn: "Øyvind Rohjan" },
      { id: "p2", navn: "Anders Kristiansen" },
    ];
    const okter: WorkbenchSession[] = [
      okt({ id: "o1", playerId: "p1", startMinute: 600 }),
      okt({ id: "o2", playerId: "p1", startMinute: 480 }),
      okt({ id: "o3", playerId: "p2", startMinute: 540 }),
    ];

    const vm = buildStallDagViewModel("2026-08-22", spillere, okter);

    assert.equal(vm.dato, "2026-08-22");
    // Alfabetisk (nb): Anders før Øyvind.
    assert.deepEqual(vm.spillere.map((s) => s.navn), ["Anders Kristiansen", "Øyvind Rohjan"]);

    const oyvind = vm.spillere.find((s) => s.id === "p1")!;
    assert.deepEqual(oyvind.okter.map((o) => o.id), ["o2", "o1"]);

    const anders = vm.spillere.find((s) => s.id === "p2")!;
    assert.equal(anders.okter.length, 1);
  });

  it("markerer erUtkast kun for status DRAFT", () => {
    const spillere = [{ id: "p1", navn: "Filip Nilsen" }];
    const okter: WorkbenchSession[] = [
      okt({ id: "draft", playerId: "p1", status: "DRAFT" }),
      okt({ id: "pub", playerId: "p1", status: "PUBLISHED", startMinute: 660 }),
    ];

    const vm = buildStallDagViewModel("2026-08-22", spillere, okter);
    const [draft, pub] = vm.spillere[0].okter;
    assert.equal(draft.erUtkast, true);
    assert.equal(pub.erUtkast, false);
  });

  it("gir spillere uten økter en tom liste (ikke feil)", () => {
    const spillere = [{ id: "p1", navn: "Nora Vik" }];
    const vm = buildStallDagViewModel("2026-08-22", spillere, []);
    assert.deepEqual(vm.spillere, [{ id: "p1", navn: "Nora Vik", okter: [] }]);
  });

  it("ignorerer økter for spillere utenfor coachens scope", () => {
    const spillere = [{ id: "p1", navn: "Nora Vik" }];
    const okter: WorkbenchSession[] = [okt({ id: "o1", playerId: "utenfor-scope" })];
    const vm = buildStallDagViewModel("2026-08-22", spillere, okter);
    assert.deepEqual(vm.spillere[0].okter, []);
  });
});
