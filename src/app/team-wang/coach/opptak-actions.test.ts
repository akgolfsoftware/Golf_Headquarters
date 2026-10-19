import assert from "node:assert/strict";
import { beforeEach, mock, test } from "node:test";

// Opptak og koordinering (WANG-31–33, pakke W3): bare sportssjef skriver, skolen kommer fra serveren.

let bruker: { id: string; role: string; name?: string } | null = null;
const SKOLE = "wang-fredrikstad";
const ANNEN_SKOLE = "wang-oslo";

type Kandidat = { id: string; groupId: string; skoleaar: string; navn: string; status: string };
let kandidater: Kandidat[] = [];
let stjerner: Array<{ kandidatId: string; groupId: string }> = [];
let kontakter: Array<{ kandidatId: string; groupId: string; mottaker: string; personRolle: string; kontaktetAt: Date }> = [];
let skrivinger = 0;
let revisjon: Array<{ action: string; metadata?: Record<string, unknown> }> = [];

class TestWangDataUtilgjengeligError extends Error {}

mock.module("server-only", { defaultExport: {} });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => bruker } });
mock.module("@/lib/audit", {
  namedExports: { audit: async (e: { action: string; metadata?: Record<string, unknown> }) => void revisjon.push(e) },
});
mock.module("@/app/team-wang/_data/wang-tilgang", {
  namedExports: {
    WangDataUtilgjengeligError: TestWangDataUtilgjengeligError,
    // Speiler gruppeporten: ADMIN får skolen sin, COACH bare som trenermedlem (her: medlem).
    hentWangCoachGruppeId: async (b: { role: string }) => (b.role === "ADMIN" || b.role === "COACH" ? SKOLE : null),
  },
});

const passer = (rad: Record<string, unknown>, where: Record<string, unknown>) =>
  Object.entries(where).every(([k, v]) => rad[k] === v);

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      wangKandidat: {
        create: async ({ data }: { data: Omit<Kandidat, "id" | "status"> }) => {
          skrivinger++;
          const rad = { ...data, id: `k${kandidater.length + 1}`, status: "SOKT" };
          kandidater.push(rad);
          return { id: rad.id };
        },
        findFirst: async ({ where }: { where: Record<string, unknown> }) => kandidater.find((k) => passer(k, where)) ?? null,
        updateMany: async ({ where, data }: { where: Record<string, unknown>; data: { status: string } }) => {
          const treff = kandidater.filter((k) => passer(k, where));
          treff.forEach((k) => (k.status = data.status));
          skrivinger += treff.length;
          return { count: treff.length };
        },
        deleteMany: async ({ where }: { where: Record<string, unknown> }) => {
          const før = kandidater.length;
          kandidater = kandidater.filter((k) => !passer(k, where));
          skrivinger += før - kandidater.length;
          return { count: før - kandidater.length };
        },
      },
      wangKandidatStjerne: {
        findFirst: async ({ where }: { where: { kandidatId: string } }) => stjerner.find((s) => s.kandidatId === where.kandidatId) ?? null,
        upsert: async ({ create }: { create: { kandidatId: string; groupId: string } }) => {
          skrivinger++;
          if (!stjerner.some((s) => passer(s, { kandidatId: create.kandidatId, groupId: create.groupId }))) stjerner.push(create);
          return create;
        },
        deleteMany: async ({ where }: { where: Record<string, unknown> }) => {
          skrivinger++;
          stjerner = stjerner.filter((s) => !passer(s, where));
          return { count: 1 };
        },
      },
      wangKandidatKontakt: {
        findFirst: async ({ where }: { where: { kandidatId: string } }) => kontakter.find((c) => c.kandidatId === where.kandidatId) ?? null,
        create: async ({ data }: { data: (typeof kontakter)[number] & Record<string, unknown> }) => {
          skrivinger++;
          kontakter.push(data);
          return data;
        },
      },
      wangOpptak: { upsert: async () => void skrivinger++ },
    },
  },
});

const osloIdagIso = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
const lastActions = () => import("./opptak-actions");
const lastVisning = () => import("@/app/team-wang/_data/wang-opptak-visning");
let AAR = "";

beforeEach(async () => {
  AAR = (await lastVisning()).opptakSkoleaar(osloIdagIso());
  bruker = { id: "ss-1", role: "ADMIN", name: "Anders Kristiansen" };
  kandidater = [];
  stjerner = [];
  kontakter = [];
  skrivinger = 0;
  revisjon = [];
});

test("skoleåret for opptaket er alltid neste skoleår", async () => {
  const { opptakSkoleaar } = await lastVisning();
  assert.equal(opptakSkoleaar("2026-10-19"), "2027/28");
  assert.equal(opptakSkoleaar("2027-03-01"), "2027/28");
  assert.equal(opptakSkoleaar("2027-08-01"), "2028/29");
});

test("sportssjef legger til kandidat på egen skole og neste skoleår, uten navn i revisjonsloggen", async () => {
  const actions = await lastActions();
  const r = await actions.leggTilKandidat({ navn: "Øyvind Rohjan", klubb: "Testklubb GK", fodselsaar: 2011, groupId: ANNEN_SKOLE });
  assert.deepEqual(r, { ok: true });
  assert.equal(kandidater.length, 1);
  assert.equal(kandidater[0].groupId, SKOLE, "skolen kommer fra serveren, aldri fra input");
  assert.equal(kandidater[0].skoleaar, AAR);
  assert.doesNotMatch(JSON.stringify(revisjon), /Øyvind|Rohjan|Testklubb/);
});

test("sportssjef stjernemerker og logger kontakt uten innhold", async () => {
  const actions = await lastActions();
  await actions.leggTilKandidat({ navn: "Øyvind Rohjan" });
  const id = kandidater[0].id;
  assert.deepEqual(await actions.settStjerne({ kandidatId: id, merket: true }), { ok: true });
  assert.deepEqual(stjerner, [{ kandidatId: id, groupId: SKOLE, createdById: "ss-1" }]);

  const r = await actions.loggKontakt({ kandidatId: id, mottaker: "FORESATTE", dato: osloIdagIso(), innhold: "skal ikke lagres" });
  assert.deepEqual(r, { ok: true });
  assert.equal(kontakter.length, 1);
  assert.equal(kontakter[0].groupId, SKOLE);
  assert.equal(kontakter[0].mottaker, "FORESATTE");
  assert.equal(kontakter[0].personRolle, "Sportssjef");
  assert.equal("innhold" in kontakter[0], false);

  assert.deepEqual(await actions.settStjerne({ kandidatId: id, merket: false }), { ok: true });
  assert.equal(stjerner.length, 0);
});

test("kontakt fram i tid avvises", async () => {
  const actions = await lastActions();
  await actions.leggTilKandidat({ navn: "Øyvind Rohjan" });
  const r = await actions.loggKontakt({ kandidatId: kandidater[0].id, mottaker: "KANDIDAT", dato: "2999-01-01" });
  assert.equal(r.ok, false);
  assert.equal(kontakter.length, 0);
});

test("trener avvises med «Denne siden er lukket» i alle handlinger, og ingenting skrives", async () => {
  const actions = await lastActions();
  kandidater.push({ id: "k1", groupId: SKOLE, skoleaar: AAR, navn: "Øyvind Rohjan", status: "SOKT" });
  bruker = { id: "trener-1", role: "COACH" };
  const svar = await Promise.all([
    actions.leggTilKandidat({ navn: "Ny Kandidat" }),
    actions.settStjerne({ kandidatId: "k1", merket: true }),
    actions.loggKontakt({ kandidatId: "k1", mottaker: "KANDIDAT", dato: osloIdagIso() }),
    actions.settKandidatStatus({ kandidatId: "k1", status: "TATT_OPP" }),
    actions.fjernKandidat({ kandidatId: "k1" }),
    actions.settPlasser({ plasser: 4 }),
  ]);
  for (const r of svar) {
    assert.equal(r.ok, false);
    assert.match((r as { feil: string }).feil, /Denne siden er lukket/);
  }
  assert.equal(skrivinger, 0);
  assert.equal(kandidater[0].status, "SOKT");
});

test("uinnlogget avvises", async () => {
  const actions = await lastActions();
  bruker = null;
  const r = await actions.leggTilKandidat({ navn: "Ny Kandidat" });
  assert.equal(r.ok, false);
  assert.equal(skrivinger, 0);
});

test("status og sletting gjelder bare egen skoles kandidater", async () => {
  const actions = await lastActions();
  kandidater.push({ id: "k9", groupId: ANNEN_SKOLE, skoleaar: AAR, navn: "Annen Kandidat", status: "SOKT" });
  assert.equal((await actions.settKandidatStatus({ kandidatId: "k9", status: "TATT_OPP" })).ok, false);
  assert.equal((await actions.fjernKandidat({ kandidatId: "k9" })).ok, false);
  assert.equal(kandidater[0].status, "SOKT");
  assert.equal(kandidater.length, 1);
});

test("en annen skoles kandidat kan bare merkes når den alt er delt i koordineringen", async () => {
  const actions = await lastActions();
  kandidater.push({ id: "k9", groupId: ANNEN_SKOLE, skoleaar: AAR, navn: "Annen Kandidat", status: "SOKT" });
  assert.equal((await actions.settStjerne({ kandidatId: "k9", merket: true })).ok, false);
  stjerner.push({ kandidatId: "k9", groupId: ANNEN_SKOLE });
  assert.deepEqual(await actions.settStjerne({ kandidatId: "k9", merket: true }), { ok: true });
  assert.equal(stjerner.filter((s) => s.kandidatId === "k9").length, 2);
});
