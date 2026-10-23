import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let aktivMedlemsrelasjon = true;
let writes = 0;
let scopeRead: unknown;
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findFirst: async (query: unknown) => { scopeRead = query; return aktivMedlemsrelasjon ? { id: "synthetic-player" } : null; } },
  notification: { create: async () => { writes++; return { id: "notification" }; } },
} } });
let execute: typeof import("./approval-executor").executeApprovedTool;
before(async () => { ({ executeApprovedTool: execute } = await import("./approval-executor")); });
beforeEach(() => { aktivMedlemsrelasjon = true; writes = 0; scopeRead = null; });
test("fortsatt gyldig spillerrelasjon tillater simulert handling etter fersk ressurskontroll", async () => {
  const result = await execute("draftPlayerMessage", { playerId: "synthetic-player", subject: "Golf", body: "Tren carry" }, "admin");
  assert.equal(result.status, "queued"); assert.equal(writes, 1);
  const query = JSON.stringify(scopeRead); assert(query.includes("synthetic-player")); assert(query.includes("managedByAkGolf")); assert(query.includes("arkivertAt")); assert(!query.includes("enrollmentsAsPlayer")); assert(query.includes("deletedAt"));
});
test("avsluttet relasjon etter opprettelse av utkast stopper utførelse før noen mutasjon", async () => {
  aktivMedlemsrelasjon = false;
  for (const toolName of ["draftPlayerMessage", "draftBookingProposal", "draftPlayerNote", "draftPlanAdjustment"]) {
    await assert.rejects(execute(toolName, { playerId: "synthetic-player" }, "admin"), /ikke tilgang/);
  }
  assert.equal(writes, 0);
});
