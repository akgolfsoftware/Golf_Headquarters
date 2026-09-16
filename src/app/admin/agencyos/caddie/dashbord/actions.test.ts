/**
 * R-I: admin/agencyos/caddie/dashbord/actions.ts. Alle tre handlinger krever
 * `Capability.USE_AGENTS` (G6) — som per kommentaren i filen er UTENFOR
 * COACH-defaulten, så i praksis er dette ADMIN + trenere med eksplisitt
 * GRANT. Testen dekker begge lag: rollegrensen (PLAYER/uinnlogget avvist av
 * `requirePortalUser`) og capability-gaten (COACH UTEN granted USE_AGENTS
 * avvist selv om rollen er tillatt, COACH MED granted USE_AGENTS slipper
 * gjennom).
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

let runProaktivKall = 0;
let avvisDraftKall: Array<{ draftId: string; userId: string }> = [];
let godkjennDraftKall: Array<{ draftId: string; userId: string }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachHarUseAgents = false;
  runProaktivKall = 0;
  avvisDraftKall = [];
  godkjennDraftKall = [];
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
mock.module("@/lib/agents/caddie-proactive", {
  namedExports: {
    runCaddieProactive: async () => {
      runProaktivKall += 1;
      return { forslagOpprettet: 0 };
    },
  },
});
mock.module("@/lib/caddie/draft-godkjenning", {
  namedExports: {
    avvisCaddieDraft: async (draftId: string, userId: string) => {
      avvisDraftKall.push({ draftId, userId });
      return { ok: true };
    },
    godkjennOgUtforCaddieDraft: async (draftId: string, userId: string) => {
      godkjennDraftKall.push({ draftId, userId });
      return { ok: true };
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("kjorCaddieProaktiv avviser PLAYER uten å kjøre agenten", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { kjorCaddieProaktiv } = await actions();
  await assert.rejects(() => kjorCaddieProaktiv());
  assert.equal(runProaktivKall, 0);
});

test("kjorCaddieProaktiv avviser uinnlogget uten å kjøre agenten", async () => {
  bruker = null;
  const { kjorCaddieProaktiv } = await actions();
  await assert.rejects(() => kjorCaddieProaktiv());
  assert.equal(runProaktivKall, 0);
});

test("kjorCaddieProaktiv avviser COACH uten USE_AGENTS-tilgang", async () => {
  const { kjorCaddieProaktiv } = await actions();
  await assert.rejects(() => kjorCaddieProaktiv(), /forbidden/);
  assert.equal(runProaktivKall, 0);
});

test("kjorCaddieProaktiv kjører agenten for COACH med granted USE_AGENTS", async () => {
  coachHarUseAgents = true;
  const { kjorCaddieProaktiv } = await actions();
  await kjorCaddieProaktiv();
  assert.equal(runProaktivKall, 1);
});

test("kjorCaddieProaktiv kjører agenten for ADMIN uten eksplisitt grant", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  const { kjorCaddieProaktiv } = await actions();
  await kjorCaddieProaktiv();
  assert.equal(runProaktivKall, 1);
});

test("avvisProaktivtForslag avviser PLAYER uten å avvise noe", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { avvisProaktivtForslag } = await actions();
  await assert.rejects(() => avvisProaktivtForslag("draft-1"));
  assert.equal(avvisDraftKall.length, 0);
});

test("avvisProaktivtForslag avviser COACH uten USE_AGENTS-tilgang", async () => {
  const { avvisProaktivtForslag } = await actions();
  await assert.rejects(() => avvisProaktivtForslag("draft-1"), /forbidden/);
  assert.equal(avvisDraftKall.length, 0);
});

test("avvisProaktivtForslag avviser draftet for COACH med granted USE_AGENTS", async () => {
  coachHarUseAgents = true;
  const { avvisProaktivtForslag } = await actions();
  const svar = await avvisProaktivtForslag("draft-1");
  assert.equal(svar.ok, true);
  assert.deepEqual(avvisDraftKall, [{ draftId: "draft-1", userId: "coach-a" }]);
});

test("godkjennCaddieDraft avviser PLAYER uten å utføre noe", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { godkjennCaddieDraft } = await actions();
  await assert.rejects(() => godkjennCaddieDraft("draft-1"));
  assert.equal(godkjennDraftKall.length, 0);
});

test("godkjennCaddieDraft avviser uinnlogget uten å utføre noe", async () => {
  bruker = null;
  const { godkjennCaddieDraft } = await actions();
  await assert.rejects(() => godkjennCaddieDraft("draft-1"));
  assert.equal(godkjennDraftKall.length, 0);
});

test("godkjennCaddieDraft avviser COACH uten USE_AGENTS-tilgang", async () => {
  const { godkjennCaddieDraft } = await actions();
  await assert.rejects(() => godkjennCaddieDraft("draft-1"), /forbidden/);
  assert.equal(godkjennDraftKall.length, 0);
});

test("godkjennCaddieDraft utfører draftet for COACH med granted USE_AGENTS", async () => {
  coachHarUseAgents = true;
  const { godkjennCaddieDraft } = await actions();
  await godkjennCaddieDraft("draft-1");
  assert.deepEqual(godkjennDraftKall, [{ draftId: "draft-1", userId: "coach-a" }]);
});
