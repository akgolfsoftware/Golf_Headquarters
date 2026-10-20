import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

// Syntetiske ider. Treneren er trener i WANG-gruppa «g1», og bare «deler-1» deler testene.
let bruker = { id: "trener-1", role: "COACH" };
let tilgang: { gruppeId: string; delerIder: string[] } | null = { gruppeId: "g1", delerIder: ["deler-1"] };
let funnet: { id: string; userId: string; recordedById: string | null; witnessStatus: string } | null = null;
let sisteWhere: unknown = null;
const oppdateringer: unknown[] = [];
const audits: unknown[] = [];

mock.module("server-only", { defaultExport: {} });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/requirePortalUser", { namedExports: { requirePortalUser: async () => bruker } });
mock.module("@/lib/audit", { namedExports: { audit: async (e: unknown) => { audits.push(e); } } });
mock.module("@/app/team-wang/_data/wang-testdag-data", { namedExports: { hentWangTestTilgang: async () => tilgang } });
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      testResult: {
        findFirst: async (a: { where: unknown }) => { sisteWhere = a.where; return funnet; },
        update: async (a: unknown) => { oppdateringer.push(a); return {}; },
      },
    },
  },
});

async function kontrollerWangTest(input: { resultatId: string; utfall: "KONTROLLERT" | "AVVIST" }) {
  return (await import("./tester-actions")).kontrollerWangTest(input);
}

beforeEach(() => {
  bruker = { id: "trener-1", role: "COACH" };
  tilgang = { gruppeId: "g1", delerIder: ["deler-1"] };
  funnet = { id: "r1", userId: "deler-1", recordedById: null, witnessStatus: "PENDING" };
  sisteWhere = null;
  oppdateringer.length = 0;
  audits.length = 0;
});

test("trener uten WANG-gruppe avvises og ingenting leses", async () => {
  tilgang = null;
  const svar = await kontrollerWangTest({ resultatId: "r1", utfall: "KONTROLLERT" });
  assert.equal(svar.ok, false);
  assert.equal(sisteWhere, null);
});

test("oppslaget er avgrenset til elever som deler testene med WANG", async () => {
  funnet = null;
  const svar = await kontrollerWangTest({ resultatId: "r-annen", utfall: "KONTROLLERT" });
  assert.equal(svar.ok, false);
  assert.deepEqual(sisteWhere, { id: "r-annen", userId: { in: ["deler-1"] } });
  assert.equal(oppdateringer.length, 0);
});

test("Kontroller setter ATTESTED med treneren som vitne, uten å endre verdiene", async () => {
  const svar = await kontrollerWangTest({ resultatId: "r1", utfall: "KONTROLLERT" });
  assert.deepEqual(svar, { ok: true });
  assert.deepEqual(oppdateringer, [{ where: { id: "r1" }, data: { witnessStatus: "ATTESTED", witnessUserId: "trener-1", attestationMode: "DIGITAL" } }]);
  assert.equal(audits.length, 1);
});

test("Avvis setter REJECTED", async () => {
  await kontrollerWangTest({ resultatId: "r1", utfall: "AVVIST" });
  assert.equal((oppdateringer[0] as { data: { witnessStatus: string } }).data.witnessStatus, "REJECTED");
});

test("et resultat treneren selv har ført, røres ikke", async () => {
  funnet = { id: "r1", userId: "deler-1", recordedById: "trener-1", witnessStatus: "PENDING" };
  const svar = await kontrollerWangTest({ resultatId: "r1", utfall: "AVVIST" });
  assert.deepEqual(svar, { ok: true });
  assert.equal(oppdateringer.length, 0);
});

test("ugyldig utfall avvises før oppslag", async () => {
  const svar = await kontrollerWangTest({ resultatId: "r1", utfall: "SLETT" as "AVVIST" });
  assert.equal(svar.ok, false);
  assert.equal(sisteWhere, null);
});
