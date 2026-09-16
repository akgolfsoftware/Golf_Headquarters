/**
 * R-I: admin/(legacy)/team/actions.ts. `inviterCoach` har to lag: (1)
 * `Capability.INVITE_USERS` (G6) — utenfor COACH-defaulten, gates i praksis
 * til ADMIN + trenere med eksplisitt GRANT, fanget i try/catch og returnert
 * som `{ok:false}`, ikke kastet; (2) en ekstra regel filen selv håndhever:
 * kun ADMIN kan tildele ekstra capabilities ved invitasjon — en COACH med
 * INVITE_USERS skal IKKE kunne gi bort tilganger hen ikke selv styrer.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

/** Simulerer effektiv INVITE_USERS-tilgang for den innloggede coachen. */
let coachHarInviteUsers = false;

const eksisterendeBrukere: Record<string, { id: string; role: string }> = {
  "opptatt@example.com": { id: "user-opptatt", role: "COACH" },
};

let userCreates: Array<{ email: string; name: string; role: string }> = [];
let capabilityCreates: unknown[] = [];
let auditWrites: Array<{ action: string; metadata: unknown }> = [];
let epostSendtKall: string[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  coachHarInviteUsers = false;
  userCreates = [];
  capabilityCreates = [];
  auditWrites = [];
  epostSendtKall = [];
  delete process.env.RESEND_API_KEY;
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
mock.module("@/lib/auth/effective-capabilities", {
  namedExports: {
    assertCapability: async (user: { role: Rolle }) => {
      if (user.role === "ADMIN") return;
      if (!coachHarInviteUsers) throw new Error("forbidden");
    },
  },
});
mock.module("@/lib/email", {
  namedExports: {
    FRA_EPOST: "AK Golf HQ <no-reply@akgolf.no>",
    resendKlient: () => ({
      emails: {
        send: async (input: { to: string }) => {
          epostSendtKall.push(input.to);
        },
      },
    }),
  },
});
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { action: string; metadata: unknown }) => {
      auditWrites.push(input);
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  user: {
    findUnique: async ({ where }: { where: { email: string } }) => eksisterendeBrukere[where.email] ?? null,
    create: async ({ data }: { data: { email: string; name: string; role: string } }) => {
      userCreates.push(data);
      return { id: "ny-coach", email: data.email, name: data.name };
    },
  },
  userCapability: {
    createMany: async (input: { data: unknown[] }) => {
      capabilityCreates.push(...input.data);
      return { count: input.data.length };
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("inviterCoach avviser PLAYER med ok:false, ingen bruker opprettet", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { inviterCoach } = await actions();
  const svar = await inviterCoach("ny@example.com", "Ny Coach");
  assert.equal(svar.ok, false);
  assert.equal(userCreates.length, 0);
});

test("inviterCoach avviser uinnlogget med ok:false, ingen bruker opprettet", async () => {
  bruker = null;
  const { inviterCoach } = await actions();
  const svar = await inviterCoach("ny@example.com", "Ny Coach");
  assert.equal(svar.ok, false);
  assert.equal(userCreates.length, 0);
});

test("inviterCoach avviser COACH uten INVITE_USERS-tilgang med ok:false", async () => {
  const { inviterCoach } = await actions();
  const svar = await inviterCoach("ny@example.com", "Ny Coach");
  assert.equal(svar.ok, false);
  assert.equal(userCreates.length, 0);
});

test("inviterCoach oppretter COACH-bruker for COACH med granted INVITE_USERS", async () => {
  coachHarInviteUsers = true;
  const { inviterCoach } = await actions();
  const svar = await inviterCoach("ny@example.com", "Ny Coach");
  assert.equal(svar.ok, true);
  assert.equal(userCreates.length, 1);
  assert.equal(userCreates[0]?.role, "COACH");
  assert.equal(auditWrites.at(-1)?.action, "user.invited");
});

test("inviterCoach avviser COACH som prøver å tildele ekstra capabilities", async () => {
  coachHarInviteUsers = true;
  const { inviterCoach } = await actions();
  const svar = await inviterCoach("ny@example.com", "Ny Coach", ["view_finance" as never]);
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.match(svar.error, /Kun admin/);
  assert.equal(userCreates.length, 0);
});

test("inviterCoach lar ADMIN tildele ekstra capabilities utover COACH-defaulten", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  const { inviterCoach } = await actions();
  const svar = await inviterCoach("ny@example.com", "Ny Coach", ["view_finance" as never]);
  assert.equal(svar.ok, true);
  assert.equal(userCreates.length, 1);
  assert.equal(capabilityCreates.length, 1);
  assert.equal((capabilityCreates[0] as { capability: string }).capability, "view_finance");
});

test("inviterCoach hopper over capabilities som allerede er i COACH-defaulten", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  const { inviterCoach } = await actions();
  // manage_tests er allerede i COACH-defaulten (cbac.ts) — skal ikke skrives som override.
  const svar = await inviterCoach("ny@example.com", "Ny Coach", ["manage_tests" as never]);
  assert.equal(svar.ok, true);
  assert.equal(capabilityCreates.length, 0);
});

test("inviterCoach avviser opptatt e-post med ok:false, ingen bruker opprettet", async () => {
  coachHarInviteUsers = true;
  const { inviterCoach } = await actions();
  const svar = await inviterCoach("opptatt@example.com", "Noen");
  assert.equal(svar.ok, false);
  assert.equal(userCreates.length, 0);
});

test("inviterCoach avviser ugyldig e-post med feltfeil", async () => {
  coachHarInviteUsers = true;
  const { inviterCoach } = await actions();
  const svar = await inviterCoach("ikke-en-epost", "Noen");
  assert.equal(svar.ok, false);
  if (!svar.ok) assert.ok(svar.fieldErrors?.email);
  assert.equal(userCreates.length, 0);
});

test("inviterCoach sender ikke e-post når RESEND_API_KEY mangler, men lykkes likevel", async () => {
  coachHarInviteUsers = true;
  const { inviterCoach } = await actions();
  const svar = await inviterCoach("ny@example.com", "Ny Coach");
  assert.equal(svar.ok, true);
  if (svar.ok) assert.equal(svar.epostSendt, false);
  assert.equal(epostSendtKall.length, 0);
});

test("inviterCoach sender invitasjonsepost når RESEND_API_KEY er satt", async () => {
  coachHarInviteUsers = true;
  process.env.RESEND_API_KEY = "test-key";
  const { inviterCoach } = await actions();
  const svar = await inviterCoach("ny@example.com", "Ny Coach");
  assert.equal(svar.ok, true);
  if (svar.ok) assert.equal(svar.epostSendt, true);
  assert.deepEqual(epostSendtKall, ["ny@example.com"]);
});
