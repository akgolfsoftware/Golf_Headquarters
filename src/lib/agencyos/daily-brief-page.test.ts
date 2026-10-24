import assert from "node:assert/strict";
import { mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";
import type { AgentDetaljData } from "@/lib/agencyos/agent-detalj-typer";
import { isValidElement } from "react";

mock.module("next/navigation", { namedExports: { notFound: () => { throw new Error("not found"); } } });

let role = "ADMIN";
let denied = false;
let status = "ERROR";
let reads = 0;
let forbiddenCalls = 0;
const forbidden = async () => { forbiddenCalls++; throw new Error("unexpected personal data read"); };
const metadata = { id: "synthetic-run", status, createdAt: new Date(), duration: 100 };
const select = { id: true, status: true, createdAt: true, duration: true };
mock.module("@/lib/prisma", { namedExports: { prisma: {
  agentRun: {
    findFirst: async (args: Prisma.AgentRunFindFirstArgs) => { reads++; assert.deepEqual(args.select, select); return { ...metadata, status }; },
    findMany: async (args: Prisma.AgentRunFindManyArgs) => { reads++; assert.deepEqual(args.select, select); return [{ ...metadata, status }]; },
  },
  planAction: { findMany: forbidden, count: forbidden, findFirst: forbidden },
  kommandoAgentStep: { findMany: forbidden },
} } });
mock.module("@/lib/auth/requireCapability", { namedExports: { requireCapability: async () => { if (denied) throw new Error("synthetic-no-access"); return { id: "synthetic-viewer", name: "Syntetisk trener", role }; } } });
mock.module("@/components/precision/AgencyOSSkall", { namedExports: { AgencyOSSkall: () => null } });
mock.module("@/components/admin/agencyos-ny/ny", { namedExports: { Topp: () => null } });
const detalj = () => null;
mock.module("@/components/admin/precision/AG19AgentDetalj", { namedExports: { AG19AgentDetalj: detalj } });

function findData(node: unknown): AgentDetaljData | undefined {
  if (Array.isArray(node)) return node.map(findData).find(Boolean);
  if (!isValidElement<{ data?: AgentDetaljData; children?: unknown }>(node)) return undefined;
  return node.type === detalj ? node.props.data : findData(node.props.children);
}

test("dagsbrief-detalj leser bare metadata, ingen historiske forslag eller kommandosteg", async () => {
  const { default: page } = await import("@/app/admin/agents/[agentId]/page");
  for (const actorRole of ["ADMIN", "COACH"]) {
  role = actorRole;
  for (const value of ["ERROR", "OK"]) {
    status = value;
    const data = findData(await page({ params: Promise.resolve({ agentId: "daily-brief" }) }));
    assert.ok(data);
    assert.equal(data.statusBadge, "planlagt");
    assert.equal(data.trigger, "Ikke aktivert");
    assert.deepEqual(data.forslag, []);
    if (status === "ERROR") assert.equal(data.feil?.melding, "Kjøringen feilet.");
    else assert.equal(data.sisteSteg?.steg[0].tekst, "Historisk kjørestatus. Briefinnhold vises ikke.");
  }
  }
  denied = true;
  await assert.rejects(page({ params: Promise.resolve({ agentId: "daily-brief" }) }), /synthetic-no-access/);
  assert.equal(reads, 8);
  assert.equal(forbiddenCalls, 0);
});
