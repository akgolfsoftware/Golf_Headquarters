/**
 * R-I: admin/(legacy)/email-templates/actions.ts. E-postmaler er en delt
 * admin-ressurs uten per-coach eierskap — vernet er rollegrensen
 * (`requireCoachActionUser`) alene. Alle tre handlinger skal avvise PLAYER
 * og uinnlogget uten å skrive, og fortsatt slippe COACH gjennom. Dekker
 * også slug-normaliseringen i `createTemplate` (kun a-z0-9, bindestrek som
 * skilletegn, aldri lagret tom).
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

let templateCreates: Array<{ slug: string; name: string }> = [];
let templateUpdates: Array<{ id: string; data: unknown }> = [];
let templateDeletes: string[] = [];
let auditWrites: Array<{ action: string }> = [];
let redirectKall: string[] = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  templateCreates = [];
  templateUpdates = [];
  templateDeletes = [];
  auditWrites = [];
  redirectKall = [];
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (url: string) => {
      redirectKall.push(url);
      throw new Error("NEXT_REDIRECT");
    },
  },
});
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
    audit: async (input: { action: string }) => {
      auditWrites.push(input);
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  emailTemplate: {
    create: async ({ data }: { data: { slug: string; name: string } }) => {
      templateCreates.push(data);
      return { id: "mal-ny" };
    },
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      templateUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      templateDeletes.push(where.id);
      return { id: where.id };
    },
  },
});

async function actions() {
  return import("./actions");
}

const gyldigMal = { slug: "Ny Mal!", name: "Ny mal", subject: "Emne", body: "Innhold", active: true };

test.beforeEach(() => {
  nullstill();
});

test("createTemplate avviser PLAYER uten å opprette mal", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { createTemplate } = await actions();
  await assert.rejects(() => createTemplate(gyldigMal));
  assert.equal(templateCreates.length, 0);
});

test("createTemplate avviser uinnlogget uten å opprette mal", async () => {
  bruker = null;
  const { createTemplate } = await actions();
  await assert.rejects(() => createTemplate(gyldigMal));
  assert.equal(templateCreates.length, 0);
});

test("createTemplate avviser slug som normaliserer til tom streng", async () => {
  const { createTemplate } = await actions();
  await assert.rejects(() => createTemplate({ ...gyldigMal, slug: "!!!" }), /invalid-slug/);
  assert.equal(templateCreates.length, 0);
});

test("createTemplate normaliserer slug og oppretter mal for COACH", async () => {
  const { createTemplate } = await actions();
  await createTemplate(gyldigMal);
  assert.equal(templateCreates.length, 1);
  assert.equal(templateCreates[0]?.slug, "ny-mal");
  assert.equal(auditWrites.at(-1)?.action, "email_template.created");
});

test("updateTemplate avviser PLAYER uten å oppdatere", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { updateTemplate } = await actions();
  await assert.rejects(() => updateTemplate("mal-a", gyldigMal));
  assert.equal(templateUpdates.length, 0);
});

test("updateTemplate avviser uinnlogget uten å oppdatere", async () => {
  bruker = null;
  const { updateTemplate } = await actions();
  await assert.rejects(() => updateTemplate("mal-a", gyldigMal));
  assert.equal(templateUpdates.length, 0);
});

test("updateTemplate oppdaterer for COACH", async () => {
  const { updateTemplate } = await actions();
  await updateTemplate("mal-a", gyldigMal);
  assert.equal(templateUpdates.length, 1);
  assert.equal(auditWrites.at(-1)?.action, "email_template.updated");
});

test("deleteTemplate avviser PLAYER uten å slette", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { deleteTemplate } = await actions();
  await assert.rejects(() => deleteTemplate("mal-a"));
  assert.equal(templateDeletes.length, 0);
});

test("deleteTemplate avviser uinnlogget uten å slette", async () => {
  bruker = null;
  const { deleteTemplate } = await actions();
  await assert.rejects(() => deleteTemplate("mal-a"));
  assert.equal(templateDeletes.length, 0);
});

test("deleteTemplate sletter og redirecter for COACH", async () => {
  const { deleteTemplate } = await actions();
  await assert.rejects(() => deleteTemplate("mal-a"), /NEXT_REDIRECT/);
  assert.deepEqual(templateDeletes, ["mal-a"]);
  assert.equal(auditWrites.at(-1)?.action, "email_template.deleted");
  assert.deepEqual(redirectKall, ["/admin/email-templates"]);
});
