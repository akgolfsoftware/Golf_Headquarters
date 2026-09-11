import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let enrolled = true;
let writes = 0;
let scopeRead: unknown;
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findFirst: async (query: unknown) => { scopeRead = query; return enrolled ? { id: "synthetic-player" } : null; } },
  notification: { create: async () => { writes++; return { id: "notification" }; } },
} } });
let execute: typeof import("./approval-executor").executeApprovedTool;
before(async () => { ({ executeApprovedTool: execute } = await import("./approval-executor")); });
beforeEach(() => { enrolled = true; writes = 0; scopeRead = null; });
test("fortsatt gyldig spillerrelasjon tillater simulert handling etter fersk ressurskontroll", async () => {
  const result = await execute("draftPlayerMessage", { playerId: "synthetic-player", subject: "Golf", body: "Tren carry" }, "admin");
  assert.equal(result.status, "queued"); assert.equal(writes, 1);
  const query = JSON.stringify(scopeRead); assert(query.includes("synthetic-player")); assert(query.includes("PLATFORM_ONLY")); assert(query.includes("deletedAt"));
});
test("avsluttet relasjon etter opprettelse av utkast stopper utførelse før noen mutasjon", async () => {
  enrolled = false;
  for (const toolName of ["draftPlayerMessage", "draftBookingProposal", "draftPlayerNote", "draftPlanAdjustment"]) {
    await assert.rejects(execute(toolName, { playerId: "synthetic-player" }, "admin"), /ikke tilgang/);
  }
  assert.equal(writes, 0);
});
