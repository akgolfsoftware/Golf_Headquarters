/**
 * R-I: admin/(legacy)/analytics/actions.ts. `exportAnalyticsReport` bruker
 * `getCurrentUser` manuelt (ikke en delt guard) og returnerer `{success:
 * false}` for både uinnlogget og PLAYER, i stedet for å kaste — testen
 * sjekker svaret, ikke `assert.rejects`. Dekker også slug-logikken per
 * scope (stall/kategori/spillere) i det genererte filnavnet.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Coach A",
};

let auditWrites: Array<{ action: string; metadata: Record<string, unknown> }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Coach A" };
  auditWrites = [];
}

mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUser: async () => bruker },
});
mock.module("@/lib/audit", {
  namedExports: {
    audit: async (input: { action: string; metadata: Record<string, unknown> }) => {
      auditWrites.push(input);
    },
  },
});

async function actions() {
  return import("./actions");
}

const basisInput = {
  format: "pdf" as const,
  period: "30d" as const,
  scope: "stall" as const,
  spillerIds: [] as string[],
  includes: { sgTrender: true, pyramide: true, compliance: true, rundeData: false },
  recipients: [] as string[],
};

test.beforeEach(() => {
  nullstill();
});

test("exportAnalyticsReport avviser ugyldig input", async () => {
  const { exportAnalyticsReport } = await actions();
  const svar = await exportAnalyticsReport({ ...basisInput, format: "docx" as never });
  assert.equal(svar.success, false);
  assert.equal(auditWrites.length, 0);
});

test("exportAnalyticsReport avviser uinnlogget", async () => {
  bruker = null;
  const { exportAnalyticsReport } = await actions();
  const svar = await exportAnalyticsReport(basisInput);
  assert.equal(svar.success, false);
  if (!svar.success) assert.match(svar.error, /[Ii]kke innlogget/);
  assert.equal(auditWrites.length, 0);
});

test("exportAnalyticsReport avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { exportAnalyticsReport } = await actions();
  const svar = await exportAnalyticsReport(basisInput);
  assert.equal(svar.success, false);
  if (!svar.success) assert.match(svar.error, /coach- eller admin/);
  assert.equal(auditWrites.length, 0);
});

test("exportAnalyticsReport genererer stall-slug for COACH", async () => {
  const { exportAnalyticsReport } = await actions();
  const svar = await exportAnalyticsReport(basisInput);
  assert.equal(svar.success, true);
  if (svar.success) assert.match(svar.filename, /^analytics-stall-snitt-\d{4}-\d{2}-\d{2}\.pdf$/);
  assert.equal(auditWrites.at(-1)?.action, "analytics.export");
});

test("exportAnalyticsReport genererer kategori-slug", async () => {
  const { exportAnalyticsReport } = await actions();
  const svar = await exportAnalyticsReport({ ...basisInput, scope: "kategori", kategori: "A1" });
  assert.equal(svar.success, true);
  if (svar.success) assert.match(svar.filename, /^analytics-kategori-a1-/);
});

test("exportAnalyticsReport genererer spillere-slug med antall", async () => {
  const { exportAnalyticsReport } = await actions();
  const svar = await exportAnalyticsReport({
    ...basisInput, scope: "spillere", spillerIds: ["s1", "s2", "s3"],
  });
  assert.equal(svar.success, true);
  if (svar.success) assert.match(svar.filename, /^analytics-spillere-3-/);
});

test("exportAnalyticsReport oppretter for ADMIN og logger mottakere", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  const { exportAnalyticsReport } = await actions();
  const svar = await exportAnalyticsReport({ ...basisInput, recipients: ["leder@example.com"] });
  assert.equal(svar.success, true);
  assert.deepEqual(auditWrites.at(-1)?.metadata.recipients, ["leder@example.com"]);
});
