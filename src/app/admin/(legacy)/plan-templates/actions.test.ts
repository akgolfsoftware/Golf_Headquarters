/**
 * R-I: admin/(legacy)/plan-templates/actions.ts. Planmaler er delt
 * biblioteksinnhold uten per-coach eierskap, så vernet er rollegrensen
 * alene — hver av de 10 mutasjonene skal avvise PLAYER (og uinnlogget)
 * uten å skrive noe, og fortsatt slippe COACH gjennom.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

const disciplinFordeling = { FYS: 0.2, TEK: 0.2, SLAG: 0.2, SPILL: 0.2, TURN: 0.2 };
const templateInput = {
  name: "Standardmal",
  description: null,
  kategori: "A" as const,
  lPhase: "GRUNN" as const,
  varighetUker: 4,
  ukentligOktAntall: 3,
  disciplinFordeling,
  minAlder: null,
  maxAlder: null,
};
const sessionInput = {
  ukeNr: 1,
  dagNr: 1,
  title: "Økt 1",
  varighetMin: 60,
  pyramidArea: "TEK" as const,
  skillArea: null,
  environment: "RANGE" as const,
  drillsJson: [],
  focus: null,
  notes: null,
};

const templates: Record<string, { id: string; name: string; kategori: string; lPhase: string; approved: boolean; description: string | null; varighetUker: number; ukentligOktAntall: number; disciplinFordeling: unknown; minAlder: number | null; maxAlder: number | null; sessions: unknown[] }> = {};
const sessions: Record<string, { id: string; templateId: string; ukeNr: number; dagNr: number; title: string; varighetMin: number; pyramidArea: string; skillArea: string | null; environment: string; drillsJson: unknown; focus: string | null; notes: string | null }> = {};

let templateCreates: unknown[] = [];
let templateUpdates: unknown[] = [];
let sessionCreates: unknown[] = [];
let sessionUpdates: unknown[] = [];
let sessionDeletes: string[] = [];
let sessionUpdateManys: unknown[] = [];
let auditWrites: Array<{ action: string; target: string }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  for (const k of Object.keys(templates)) delete templates[k];
  for (const k of Object.keys(sessions)) delete sessions[k];
  Object.assign(templates, {
    "mal-a": {
      id: "mal-a",
      name: "Mal A",
      kategori: "A",
      lPhase: "GRUNN",
      approved: true,
      description: null,
      varighetUker: 4,
      ukentligOktAntall: 3,
      disciplinFordeling,
      minAlder: null,
      maxAlder: null,
      sessions: [],
    },
  });
  Object.assign(sessions, {
    "okt-a": {
      id: "okt-a",
      templateId: "mal-a",
      ukeNr: 1,
      dagNr: 1,
      title: "Økt A",
      varighetMin: 60,
      pyramidArea: "TEK",
      skillArea: null,
      environment: "RANGE",
      drillsJson: [],
      focus: null,
      notes: null,
    },
  });
  templateCreates = [];
  templateUpdates = [];
  sessionCreates = [];
  sessionUpdates = [];
  sessionDeletes = [];
  sessionUpdateManys = [];
  auditWrites = [];
}

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: {
    requirePortalUser: async (opts?: { allow?: Rolle | Rolle[] }) => {
      if (!bruker) throw new Error("unauthenticated");
      const allow = opts?.allow ? (Array.isArray(opts.allow) ? opts.allow : [opts.allow]) : undefined;
      if (allow && !allow.includes(bruker.role)) throw new Error("forbidden");
      return bruker;
    },
  },
});
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { action: string; target: string }) => {
      auditWrites.push({ action: input.action, target: input.target });
    },
  },
});
mock.module("@/lib/plan-templates/uke-verktoy", {
  namedExports: {
    planleggUkeVarighet: (okter: Array<{ id: string }>) =>
      okter.length === 0 ? { status: "tom-uke" as const } : { status: "ok" as const, oktIder: okter.map((o) => o.id) },
    planleggUkeKopi: (
      kilde: Array<{ ukeNr: number; dagNr: number; title: string; varighetMin: number; pyramidArea: string; skillArea: string | null; environment: string; drillsJson: unknown; focus: string | null; notes: string | null }>,
      tilUke: number,
      maal: unknown[],
      overskriv: boolean,
    ) => {
      if (kilde.length === 0) return { status: "tom-kilde" as const };
      if (maal.length > 0 && !overskriv) return { status: "konflikt" as const, antallIMaal: maal.length };
      return {
        status: "kopiert" as const,
        slettIds: maal.length > 0 ? (maal as Array<{ id: string }>).map((m) => m.id) : [],
        nyeRader: kilde.map((k) => ({ ...k, ukeNr: tilUke })),
      };
    },
  },
});
const prismaMock: Record<string, unknown> = {};
mock.module("@/lib/prisma", { namedExports: { prisma: prismaMock } });
Object.assign(prismaMock, {
  planTemplate: {
    findUnique: async ({ where }: { where: { id: string } }) => templates[where.id] ?? null,
    findFirst: async () => null,
    create: async ({ data }: { data: { name: string } }) => {
      templateCreates.push(data);
      return { id: "ny-mal", ...data };
    },
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      templateUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
  },
  planTemplateSession: {
    findUnique: async ({ where }: { where: { id?: string; templateId_ukeNr_dagNr?: { templateId: string; ukeNr: number; dagNr: number } } }) => {
      if (where.id) return sessions[where.id] ?? null;
      return null;
    },
    findMany: async ({ where }: { where: { templateId: string; ukeNr: number } }) =>
      Object.values(sessions).filter((s) => s.templateId === where.templateId && s.ukeNr === where.ukeNr),
    create: async ({ data }: { data: unknown }) => {
      sessionCreates.push(data);
      return { id: "ny-okt" };
    },
    update: async ({ where, data }: { where: { id: string }; data: unknown }) => {
      sessionUpdates.push({ id: where.id, data });
      return { id: where.id };
    },
    delete: async ({ where }: { where: { id: string } }) => {
      sessionDeletes.push(where.id);
      return { id: where.id };
    },
    updateMany: async (args: unknown) => {
      sessionUpdateManys.push(args);
      return { count: 1 };
    },
    deleteMany: async () => ({ count: 0 }),
    createMany: async () => ({ count: 0 }),
  },
  $transaction: async (arr: unknown[]) => Promise.all(arr),
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  nullstill();
});

test("updateTemplate avviser PLAYER uten å oppdatere", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { updateTemplate } = await actions();
  await assert.rejects(() => updateTemplate("mal-a", templateInput));
  assert.equal(templateUpdates.length, 0);
});

test("updateTemplate avviser uinnlogget uten å oppdatere", async () => {
  bruker = null;
  const { updateTemplate } = await actions();
  await assert.rejects(() => updateTemplate("mal-a", templateInput));
  assert.equal(templateUpdates.length, 0);
});

test("createTemplate avviser PLAYER uten å opprette", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { createTemplate } = await actions();
  await assert.rejects(() => createTemplate(templateInput));
  assert.equal(templateCreates.length, 0);
});

test("createTemplate oppretter mal for COACH", async () => {
  const { createTemplate } = await actions();
  const svar = await createTemplate(templateInput);
  assert.equal(svar.ok, true);
  assert.equal(templateCreates.length, 1);
  assert.equal(auditWrites.at(-1)?.action, "plan_template.create");
});

test("duplicateTemplate avviser PLAYER uten å duplisere", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { duplicateTemplate } = await actions();
  await assert.rejects(() => duplicateTemplate("mal-a"));
  assert.equal(templateCreates.length, 0);
});

test("archiveTemplate avviser PLAYER uten å arkivere", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { archiveTemplate } = await actions();
  await assert.rejects(() => archiveTemplate("mal-a"));
  assert.equal(templateUpdates.length, 0);
});

test("unarchiveTemplate avviser PLAYER uten å gjenåpne", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { unarchiveTemplate } = await actions();
  await assert.rejects(() => unarchiveTemplate("mal-a"));
  assert.equal(templateUpdates.length, 0);
});

test("addTemplateSession avviser PLAYER uten å legge til økt", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { addTemplateSession } = await actions();
  await assert.rejects(() => addTemplateSession("mal-a", sessionInput));
  assert.equal(sessionCreates.length, 0);
});

test("addTemplateSession legger til økt for COACH", async () => {
  const { addTemplateSession } = await actions();
  const svar = await addTemplateSession("mal-a", { ...sessionInput, dagNr: 2 });
  assert.equal(svar.ok, true);
  assert.equal(sessionCreates.length, 1);
});

test("updateTemplateSession avviser PLAYER uten å oppdatere økt", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { updateTemplateSession } = await actions();
  await assert.rejects(() => updateTemplateSession("okt-a", sessionInput));
  assert.equal(sessionUpdates.length, 0);
});

test("deleteTemplateSession avviser PLAYER uten å slette økt", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { deleteTemplateSession } = await actions();
  await assert.rejects(() => deleteTemplateSession("okt-a"));
  assert.equal(sessionDeletes.length, 0);
});

test("setWeekDuration avviser PLAYER uten å endre varighet", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { setWeekDuration } = await actions();
  await assert.rejects(() => setWeekDuration("mal-a", 1, 90));
  assert.equal(sessionUpdateManys.length, 0);
});

test("setWeekDuration endrer varighet for COACH", async () => {
  const { setWeekDuration } = await actions();
  const svar = await setWeekDuration("mal-a", 1, 90);
  assert.equal(svar.ok, true);
  assert.equal(sessionUpdateManys.length, 1);
});

test("copyTemplateWeek avviser PLAYER uten å kopiere", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { copyTemplateWeek } = await actions();
  await assert.rejects(() => copyTemplateWeek("mal-a", 1, 2));
  assert.equal(sessionCreates.length, 0);
});
