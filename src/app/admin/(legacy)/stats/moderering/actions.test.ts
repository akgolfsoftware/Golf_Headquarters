/**
 * R-I: admin/(legacy)/stats/moderering/actions.ts. GDPR-/moderasjonskøen
 * håndhever egne status-overganger (OPEN→APPROVED/REJECTED, APPROVED
 * GDPR_SLETTING→EXECUTED) og en hard regel: coach-/admin-kontoer kan ikke
 * GDPR-slettes herfra. Testen dekker rollegrensen (PLAYER/uinnlogget
 * avvist for alle tre handlinger) pluss alle status-/type-vaktene, siden
 * dette er den mest sikkerhetskritiske filen i R-I-serien så langt —
 * `utforGdprSletting` utfører faktisk anonymisering.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

const saker: Record<string, { id: string; type: string; status: string; userId: string; reporterId: string | null }> = {
  "sak-open-gdpr": { id: "sak-open-gdpr", type: "GDPR_SLETTING", status: "OPEN", userId: "spiller-a", reporterId: "forelder-a" },
  "sak-open-rapport": { id: "sak-open-rapport", type: "INNHOLD_RAPPORT", status: "OPEN", userId: "spiller-a", reporterId: null },
  "sak-approved-gdpr": { id: "sak-approved-gdpr", type: "GDPR_SLETTING", status: "APPROVED", userId: "spiller-a", reporterId: "forelder-a" },
  "sak-executed": { id: "sak-executed", type: "GDPR_SLETTING", status: "EXECUTED", userId: "spiller-a", reporterId: null },
  "sak-approved-ikke-gdpr": { id: "sak-approved-ikke-gdpr", type: "INNHOLD_RAPPORT", status: "APPROVED", userId: "spiller-a", reporterId: null },
  "sak-mot-coach": { id: "sak-mot-coach", type: "GDPR_SLETTING", status: "APPROVED", userId: "coach-b", reporterId: null },
};

const malBrukere: Record<string, { id: string; role: string; publicPlayerId: string | null }> = {
  "spiller-a": { id: "spiller-a", role: "PLAYER", publicPlayerId: null },
  "coach-b": { id: "coach-b", role: "COACH", publicPlayerId: null },
};

let caseUpdates: Array<{ id: string; data: Record<string, unknown> }> = [];
let auditWrites: Array<{ action: string; target: string; metadata: Record<string, unknown> }> = [];
let notifyKall: Array<{ userId: string; body: string }> = [];
let anonymiserKall: string[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  caseUpdates = [];
  auditWrites = [];
  notifyKall = [];
  anonymiserKall = [];
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/action-guards", {
  namedExports: {
    requireCoachActionUser: async () => {
      if (!bruker) throw new Error("unauthenticated");
      if (bruker.role !== "COACH" && bruker.role !== "ADMIN") throw new Error("forbidden");
      return bruker;
    },
  },
});
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { action: string; target: string; metadata: Record<string, unknown> }) => {
      auditWrites.push(input);
    },
  },
});
mock.module("@/lib/notifications", {
  namedExports: {
    notify: async (input: { userId: string; body: string }) => {
      notifyKall.push(input);
    },
  },
});
mock.module("@/lib/gdpr/anonymiser-bruker", {
  namedExports: {
    anonymiserBruker: async (userId: string) => {
      anonymiserKall.push(userId);
      return {
        brukerFantes: true,
        publicPlayerAnonymisert: false,
        snittScore: null,
        antallRunder: 0,
        vasket: { okter: 0, driller: 0, drillLogger: 0, fysOvelser: 0, runder: 0 },
      };
    },
    ANONYMISERTE_BRUKERFELTER: ["name", "email", "phone"],
    ANONYMISERTE_PUBLICPLAYER_FELTER: ["name", "slug", "bio"],
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  moderationCase: {
    findUnique: async ({ where }: { where: { id: string } }) => saker[where.id] ?? null,
    update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
      caseUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
  },
  user: {
    findUnique: async ({ where }: { where: { id: string } }) => malBrukere[where.id] ?? null,
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("godkjennSak avviser PLAYER uten å endre status", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { godkjennSak } = await actions();
  await assert.rejects(() => godkjennSak("sak-open-gdpr"));
  assert.equal(caseUpdates.length, 0);
});

test("godkjennSak avviser uinnlogget uten å endre status", async () => {
  bruker = null;
  const { godkjennSak } = await actions();
  await assert.rejects(() => godkjennSak("sak-open-gdpr"));
  assert.equal(caseUpdates.length, 0);
});

test("godkjennSak avviser ukjent sak", async () => {
  const { godkjennSak } = await actions();
  await assert.rejects(() => godkjennSak("finnes-ikke"), /Fant ikke saken/);
});

test("godkjennSak avviser allerede behandlet sak", async () => {
  const { godkjennSak } = await actions();
  await assert.rejects(() => godkjennSak("sak-approved-gdpr"), /allerede behandlet/);
  assert.equal(caseUpdates.length, 0);
});

test("godkjennSak setter APPROVED og varsler innmelder for GDPR-sak", async () => {
  const { godkjennSak } = await actions();
  await godkjennSak("sak-open-gdpr");
  assert.equal(caseUpdates[0]?.data.status, "APPROVED");
  assert.equal(auditWrites.at(-1)?.action, "moderation.approved");
  assert.deepEqual(notifyKall.map((n) => n.userId), ["forelder-a"]);
});

test("godkjennSak varsler ikke når saken mangler innmelder", async () => {
  const { godkjennSak } = await actions();
  await godkjennSak("sak-open-rapport");
  assert.equal(notifyKall.length, 0);
});

test("avvisSak avviser PLAYER uten å endre status", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { avvisSak } = await actions();
  await assert.rejects(() => avvisSak("sak-open-gdpr"));
  assert.equal(caseUpdates.length, 0);
});

test("avvisSak avviser uinnlogget uten å endre status", async () => {
  bruker = null;
  const { avvisSak } = await actions();
  await assert.rejects(() => avvisSak("sak-open-gdpr"));
  assert.equal(caseUpdates.length, 0);
});

test("avvisSak avviser allerede behandlet sak", async () => {
  const { avvisSak } = await actions();
  await assert.rejects(() => avvisSak("sak-executed"), /allerede behandlet/);
});

test("avvisSak setter REJECTED og logger begrunnelse i audit, ikke på selve saken", async () => {
  const { avvisSak } = await actions();
  await avvisSak("sak-open-gdpr", "Ikke grunnlag");
  assert.equal(caseUpdates[0]?.data.status, "REJECTED");
  assert.ok(!("begrunnelse" in (caseUpdates[0]?.data ?? {})));
  assert.equal(auditWrites.at(-1)?.metadata.begrunnelse, "Ikke grunnlag");
});

test("utforGdprSletting avviser PLAYER uten å anonymisere", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { utforGdprSletting } = await actions();
  await assert.rejects(() => utforGdprSletting("sak-approved-gdpr"));
  assert.equal(anonymiserKall.length, 0);
});

test("utforGdprSletting avviser uinnlogget uten å anonymisere", async () => {
  bruker = null;
  const { utforGdprSletting } = await actions();
  await assert.rejects(() => utforGdprSletting("sak-approved-gdpr"));
  assert.equal(anonymiserKall.length, 0);
});

test("utforGdprSletting avviser en sak som ikke er GDPR_SLETTING", async () => {
  const { utforGdprSletting } = await actions();
  await assert.rejects(() => utforGdprSletting("sak-approved-ikke-gdpr"), /Kun GDPR-slettesaker/);
  assert.equal(anonymiserKall.length, 0);
});

test("utforGdprSletting avviser en GDPR-sak som ikke er godkjent ennå (OPEN)", async () => {
  const { utforGdprSletting } = await actions();
  await assert.rejects(() => utforGdprSletting("sak-open-gdpr"), /må godkjennes/);
  assert.equal(anonymiserKall.length, 0);
});

test("utforGdprSletting avviser en allerede utført sak", async () => {
  const { utforGdprSletting } = await actions();
  await assert.rejects(() => utforGdprSletting("sak-executed"));
  assert.equal(anonymiserKall.length, 0);
});

test("utforGdprSletting avviser sletting av en coach-/admin-konto", async () => {
  const { utforGdprSletting } = await actions();
  await assert.rejects(() => utforGdprSletting("sak-mot-coach"), /Coach-\/admin-kontoer/);
  assert.equal(anonymiserKall.length, 0);
});

test("utforGdprSletting anonymiserer og setter EXECUTED for gyldig godkjent GDPR-sak", async () => {
  const { utforGdprSletting } = await actions();
  await utforGdprSletting("sak-approved-gdpr");
  assert.deepEqual(anonymiserKall, ["spiller-a"]);
  assert.equal(caseUpdates[0]?.data.status, "EXECUTED");
  assert.equal(auditWrites.at(-1)?.action, "moderation.gdpr_executed");
});
