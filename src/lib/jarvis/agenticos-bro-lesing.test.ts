import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";

let status = "ERROR";
let reads = 0;
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findFirst: async () => ({ id: "synthetic-admin" }) },
  agentRun: {
    findFirst: async (args: Prisma.AgentRunFindFirstArgs) => {
      reads++;
      assert.deepEqual(args.select, { agentName: true, status: true, createdAt: true });
      return { agentName: "daily-brief", status, createdAt: new Date("2026-10-24T10:00:00Z") };
    },
    count: async () => 1,
  },
} } });
mock.module("@/lib/admin/ko-telling", { namedExports: { koTelling: async () => ({ totalt: 0, planActions: 0, caddieDrafts: 0, sessionRequests: 0 }) } });

test("JARVIS henter kun teknisk status og lager fast feiltekst uten rå kjøringsfeil", async () => {
  const { hentAgenticosBro } = await import("./agenticos-bro");
  assert.equal((await hentAgenticosBro()).sisteAgentKjoring?.error, "Kjøringen feilet.");
  status = "OK";
  assert.equal((await hentAgenticosBro()).sisteAgentKjoring?.error, null);
  assert.equal(reads, 2);
});
