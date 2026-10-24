import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";

let reads = 0;
mock.module("@/lib/prisma", { namedExports: { prisma: {
  planAction: { findMany: async () => [] }, auditLog: { findMany: async () => [] },
  agentRun: { findMany: async (args: Prisma.AgentRunFindManyArgs) => {
    reads++;
    if (args.orderBy) {
      assert.deepEqual(args.select, { id: true, agentName: true, status: true, createdAt: true });
      return [{ id: "synthetic-run", agentName: "daily-brief", status: "OK", createdAt: new Date() }];
    }
    assert.deepEqual(args.select, { agentName: true, status: true });
    return [{ agentName: "daily-brief", status: "OK" }];
  } },
} } });

test("agentoversikt bygger historikk uten å hente rå output, feil eller bruker-ID", async () => {
  const { loadCoAgent } = await import("./co-agent-data");
  const data = await loadCoAgent({ id: "synthetic-admin", name: "Syntetisk trener" });
  assert.equal(data.fleet.length, 1);
  assert.equal(data.audit.length, 1);
  assert.equal(reads, 2);
});
