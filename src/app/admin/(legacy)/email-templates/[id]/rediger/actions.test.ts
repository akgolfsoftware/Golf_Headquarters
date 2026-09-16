/**
 * R-I: admin/(legacy)/email-templates/[id]/rediger/actions.ts. E-postmaler
 * er en delt admin-ressurs uten per-coach eierskap — vernet er
 * rollegrensen (`requireCoachActionUser`) alene, for alle fire handlinger.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string; email: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
  email: "coach-a@example.com",
};

const maler: Record<string, { id: string; subject: string; slug: string; active: boolean }> = {
  "mal-a": { id: "mal-a", subject: "Velkommen", slug: "velkommen", active: false },
};

let templateUpdates: Array<{ id: string; data: unknown }> = [];
let auditWrites: Array<{ action: string; metadata?: Record<string, unknown> }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A", email: "coach-a@example.com" };
  templateUpdates = [];
  auditWrites = [];
  maler["mal-a"].active = false;
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
    audit: async (input: { action: string; metadata?: Record<string, unknown> }) => {
      auditWrites.push(input);
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  emailTemplate: {
    findUnique: async ({ where }: { where: { id: string } }) => maler[where.id] ?? null,
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      templateUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
  },
});

async function actions() {
  return import("./actions");
}

const gyldigMal = { name: "Mal", subject: "Emne", body: "Innhold", active: true };

test.beforeEach(() => {
  nullstill();
});

test("saveTemplate avviser PLAYER uten å skrive", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A", email: "s@example.com" };
  const { saveTemplate } = await actions();
  await assert.rejects(() => saveTemplate("mal-a", gyldigMal));
  assert.equal(templateUpdates.length, 0);
});

test("saveTemplate avviser uinnlogget uten å skrive", async () => {
  bruker = null;
  const { saveTemplate } = await actions();
  await assert.rejects(() => saveTemplate("mal-a", gyldigMal));
  assert.equal(templateUpdates.length, 0);
});

test("saveTemplate avviser ugyldig input", async () => {
  const { saveTemplate } = await actions();
  await assert.rejects(() => saveTemplate("mal-a", { ...gyldigMal, name: "A" }));
  assert.equal(templateUpdates.length, 0);
});

test("saveTemplate oppdaterer for COACH", async () => {
  const { saveTemplate } = await actions();
  await saveTemplate("mal-a", gyldigMal);
  assert.equal(templateUpdates.length, 1);
  assert.equal(auditWrites.at(-1)?.action, "email_template.updated");
});

test("sendTestEmail avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A", email: "s@example.com" };
  const { sendTestEmail } = await actions();
  await assert.rejects(() => sendTestEmail("mal-a"));
  assert.equal(auditWrites.length, 0);
});

test("sendTestEmail avviser uinnlogget", async () => {
  bruker = null;
  const { sendTestEmail } = await actions();
  await assert.rejects(() => sendTestEmail("mal-a"));
});

test("sendTestEmail avviser ukjent mal", async () => {
  const { sendTestEmail } = await actions();
  await assert.rejects(() => sendTestEmail("finnes-ikke"), /Mal ikke funnet/);
});

test("sendTestEmail logger til coachens egen e-post for COACH", async () => {
  const { sendTestEmail } = await actions();
  const svar = await sendTestEmail("mal-a");
  assert.equal(svar.ok, true);
  assert.equal(svar.recipient, "coach-a@example.com");
  assert.equal(auditWrites.at(-1)?.action, "email_template.test_sent");
});

test("setAsDefault avviser PLAYER uten å skrive", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A", email: "s@example.com" };
  const { setAsDefault } = await actions();
  await assert.rejects(() => setAsDefault("mal-a"));
  assert.equal(templateUpdates.length, 0);
});

test("setAsDefault avviser uinnlogget uten å skrive", async () => {
  bruker = null;
  const { setAsDefault } = await actions();
  await assert.rejects(() => setAsDefault("mal-a"));
  assert.equal(templateUpdates.length, 0);
});

test("setAsDefault avviser ukjent mal", async () => {
  const { setAsDefault } = await actions();
  await assert.rejects(() => setAsDefault("finnes-ikke"), /Mal ikke funnet/);
  assert.equal(templateUpdates.length, 0);
});

test("setAsDefault setter active=true for COACH", async () => {
  const { setAsDefault } = await actions();
  await setAsDefault("mal-a");
  assert.equal((templateUpdates[0]?.data as { active: boolean }).active, true);
  assert.equal(auditWrites.at(-1)?.action, "email_template.set_default");
});

test("archiveTemplate avviser PLAYER uten å skrive", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A", email: "s@example.com" };
  const { archiveTemplate } = await actions();
  await assert.rejects(() => archiveTemplate("mal-a"));
  assert.equal(templateUpdates.length, 0);
});

test("archiveTemplate avviser uinnlogget uten å skrive", async () => {
  bruker = null;
  const { archiveTemplate } = await actions();
  await assert.rejects(() => archiveTemplate("mal-a"));
  assert.equal(templateUpdates.length, 0);
});

test("archiveTemplate setter active=false for COACH", async () => {
  const { archiveTemplate } = await actions();
  await archiveTemplate("mal-a");
  assert.equal((templateUpdates[0]?.data as { active: boolean }).active, false);
  assert.equal(auditWrites.at(-1)?.action, "email_template.archived");
});
