/**
 * R-I: admin/agents/[agentId]/actions.ts. `gisFeedback` krever
 * `Capability.USE_AGENTS` (G6, utenfor COACH-defaulten) — IKKE fanget i
 * try/catch her, ulikt `caddie/dashbord/actions.ts`, så en COACH uten
 * granted USE_AGENTS får et kastet unntak, ikke `{ok:false}`. Testen
 * dekker rollegrensen, capability-gaten og at kommentarfeltet trimmes og
 * kappes til 1000 tegn før det skrives til audit-loggen.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

/** Simulerer effektiv USE_AGENTS-tilgang for den innloggede coachen. */
let coachHarUseAgents = false;

let auditWrites: Array<{ actorId: string; action: string; target: string; metadata: Record<string, unknown> }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachHarUseAgents = false;
  auditWrites = [];
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async (options: { allow?: Rolle | Rolle[] }) => {
      if (!bruker) throw new Error("NEXT_REDIRECT");
      const tillatt = Array.isArray(options.allow) ? options.allow : options.allow ? [options.allow] : undefined;
      if (tillatt && !tillatt.includes(bruker.role)) throw new Error("NEXT_REDIRECT");
      return bruker;
    },
  },
});
mock.module("@/lib/auth/effective-capabilities", {
  namedExports: {
    assertCapability: async (user: { role: Rolle }) => {
      if (user.role === "ADMIN") return;
      if (!coachHarUseAgents) throw new Error("forbidden");
    },
  },
});
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { actorId: string; action: string; target: string; metadata: Record<string, unknown> }) => {
      auditWrites.push(input);
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("gisFeedback avviser PLAYER uten å skrive audit", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { gisFeedback } = await actions();
  await assert.rejects(() => gisFeedback("audit-1", 1));
  assert.equal(auditWrites.length, 0);
});

test("gisFeedback avviser uinnlogget uten å skrive audit", async () => {
  bruker = null;
  const { gisFeedback } = await actions();
  await assert.rejects(() => gisFeedback("audit-1", 1));
  assert.equal(auditWrites.length, 0);
});

test("gisFeedback avviser COACH uten USE_AGENTS-tilgang", async () => {
  const { gisFeedback } = await actions();
  await assert.rejects(() => gisFeedback("audit-1", 1), /forbidden/);
  assert.equal(auditWrites.length, 0);
});

test("gisFeedback avviser tom auditId med ok:false", async () => {
  coachHarUseAgents = true;
  const { gisFeedback } = await actions();
  const svar = await gisFeedback("", 1);
  assert.equal(svar.ok, false);
  assert.equal(auditWrites.length, 0);
});

test("gisFeedback avviser ugyldig rating med ok:false", async () => {
  coachHarUseAgents = true;
  const { gisFeedback } = await actions();
  const svar = await gisFeedback("audit-1", 0 as never);
  assert.equal(svar.ok, false);
  assert.equal(auditWrites.length, 0);
});

test("gisFeedback skriver audit for COACH med granted USE_AGENTS", async () => {
  coachHarUseAgents = true;
  const { gisFeedback } = await actions();
  const svar = await gisFeedback("audit-1", 1, "Bra forslag");
  assert.equal(svar.ok, true);
  assert.equal(auditWrites.length, 1);
  assert.equal(auditWrites[0]?.action, "agent.feedback");
  assert.equal(auditWrites[0]?.metadata.rating, 1);
  assert.equal(auditWrites[0]?.metadata.comment, "Bra forslag");
});

test("gisFeedback lar ADMIN gi feedback uten eksplisitt grant", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  const { gisFeedback } = await actions();
  const svar = await gisFeedback("audit-1", -1);
  assert.equal(svar.ok, true);
  assert.equal(auditWrites.length, 1);
});

test("gisFeedback trimmer og kapper kommentar til 1000 tegn", async () => {
  coachHarUseAgents = true;
  const { gisFeedback } = await actions();
  const langKommentar = "  " + "x".repeat(1200) + "  ";
  await gisFeedback("audit-1", 1, langKommentar);
  const lagretKommentar = auditWrites[0]?.metadata.comment as string;
  assert.equal(lagretKommentar.length, 1000);
});

test("gisFeedback lagrer null i stedet for tom kommentarstreng", async () => {
  coachHarUseAgents = true;
  const { gisFeedback } = await actions();
  await gisFeedback("audit-1", 1, "   ");
  assert.equal(auditWrites[0]?.metadata.comment, null);
});
