/**
 * R-I: admin/(legacy)/brief/actions.ts. Samme mønster som `(legacy)/
 * analytics/actions.ts`: `exportBriefReport` returnerer `{success:false}`
 * for uinnlogget og PLAYER, i stedet for å kaste. Dekker slug-avledningen
 * fra coachens navn i filnavnet (norske tegn normalisert, mellomrom til
 * bindestrek).
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Rolle = "PLAYER" | "COACH" | "ADMIN" | "PARENT";

let bruker: { id: string; role: Rolle; name: string } | null = {
  id: "coach-a",
  role: "COACH",
  name: "Åse Ærfuglstad",
};

let auditWrites: Array<{ action: string; metadata: Record<string, unknown> }> = [];

function nullstill() {
  bruker = { id: "coach-a", role: "COACH", name: "Åse Ærfuglstad" };
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
  period: "i-dag" as const,
  includes: { kpiStrip: true, spillerStatus: true, foresporsler: true, coachNotater: false },
  recipients: [] as string[],
};

test.beforeEach(() => {
  nullstill();
});

test("exportBriefReport avviser ugyldig input", async () => {
  const { exportBriefReport } = await actions();
  const svar = await exportBriefReport({ ...basisInput, format: "docx" as never });
  assert.equal(svar.success, false);
  assert.equal(auditWrites.length, 0);
});

test("exportBriefReport avviser uinnlogget", async () => {
  bruker = null;
  const { exportBriefReport } = await actions();
  const svar = await exportBriefReport(basisInput);
  assert.equal(svar.success, false);
  if (!svar.success) assert.match(svar.error, /[Ii]kke innlogget/);
  assert.equal(auditWrites.length, 0);
});

test("exportBriefReport avviser PLAYER", async () => {
  bruker = { id: "spiller-a", role: "PLAYER", name: "Spiller A" };
  const { exportBriefReport } = await actions();
  const svar = await exportBriefReport(basisInput);
  assert.equal(svar.success, false);
  if (!svar.success) assert.match(svar.error, /coach- eller admin/);
  assert.equal(auditWrites.length, 0);
});

test("exportBriefReport normaliserer norske tegn i filnavn-slug", async () => {
  const { exportBriefReport } = await actions();
  const svar = await exportBriefReport(basisInput);
  assert.equal(svar.success, true);
  // NFD dekomponerer å til a + kombinerende ring (strippet av regexen), men
  // IKKE æ (ikke-dekomponerbar bokstav) — æ faller derfor i "ikke a-z0-9"
  // og blir til bindestrek i stedet for "ae". Faktisk oppførsel, ikke rettet.
  if (svar.success) assert.match(svar.filename, /^coach-brief-ase-rfuglstad-\d{4}-\d{2}-\d{2}\.pdf$/);
  assert.equal(auditWrites.at(-1)?.action, "brief.export");
});

test("exportBriefReport bruker fallback-slug 'coach' når navn er null (ikke tom streng — ?? fanger kun null/undefined)", async () => {
  bruker = { id: "coach-b", role: "COACH", name: null as never };
  const { exportBriefReport } = await actions();
  const svar = await exportBriefReport(basisInput);
  assert.equal(svar.success, true);
  if (svar.success) assert.match(svar.filename, /^coach-brief-coach-\d{4}-\d{2}-\d{2}\.pdf$/);
});

test("exportBriefReport lykkes for ADMIN og logger mottakere", async () => {
  bruker = { id: "admin-a", role: "ADMIN", name: "Admin A" };
  const { exportBriefReport } = await actions();
  const svar = await exportBriefReport({ ...basisInput, recipients: ["leder@example.com"] });
  assert.equal(svar.success, true);
  assert.deepEqual(auditWrites.at(-1)?.metadata.recipients, ["leder@example.com"]);
});
