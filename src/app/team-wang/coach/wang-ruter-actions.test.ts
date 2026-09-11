import assert from "node:assert/strict";
import { mock, test } from "node:test";

const IKKE_FUNNET = new Error("IKKE_FUNNET");

let bruker = { id: "coach-1", role: "COACH" };
let coachGruppeId: string | null = "wang-top-id";
let elevGruppeId: string | null = "wang-top-id";
let tilgangFeil = false;
let liveKall = 0;
let elevLesinger = 0;
let transaksjoner = 0;
let periodeCount = 1;
let maalRader: Array<{ id: string; periodBlockId: string }> = [];
const periodeWheres: Array<Record<string, unknown>> = [];

class TestWangDataUtilgjengeligError extends Error {}

mock.module("next/navigation", {
  namedExports: {
    notFound: () => {
      throw IKKE_FUNNET;
    },
    redirect: (url: string) => {
      throw new Error(`REDIRECT:${url}`);
    },
  },
});

mock.module("next/cache", {
  namedExports: { revalidatePath: () => undefined },
});

mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => bruker },
});

mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUser: async () => bruker },
});

mock.module("@/app/team-wang/coach/coach-arsplan", {
  namedExports: { CoachArsplan: () => null },
});

mock.module("@/app/team-wang/coach/iup/[elevId]/iup-samtale", {
  namedExports: { IupSamtale: () => null },
});

mock.module("@/app/team-wang/_data/wang-tilgang", {
  namedExports: {
    WangDataUtilgjengeligError: TestWangDataUtilgjengeligError,
    hentWangCoachGruppeId: async () => {
      if (tilgangFeil) throw new TestWangDataUtilgjengeligError();
      return coachGruppeId;
    },
    hentWangElevGruppeId: async () => {
      if (tilgangFeil) throw new TestWangDataUtilgjengeligError();
      return elevGruppeId;
    },
  },
});

mock.module("@/app/team-wang/_data/hent-wang-gruppe", {
  namedExports: {
    hentWangGruppe: async () => {
      liveKall += 1;
      return { gruppeId: "wang-top-id" };
    },
  },
});

mock.module("@/lib/audit", {
  namedExports: { audit: async () => undefined },
});

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        findUnique: async () => {
          elevLesinger += 1;
          return { id: "elev-1", name: "Test Elev", email: "elev@example.no" };
        },
      },
      groupPeriodBlock: {
        findMany: async () => [],
        count: async ({ where }: { where: Record<string, unknown> }) => {
          periodeWheres.push(where);
          return periodeCount;
        },
      },
      groupPeriodGoal: {
        findMany: async () => maalRader,
        update: async () => ({}),
        deleteMany: async () => ({}),
        createMany: async () => ({}),
      },
      testResult: { findMany: async () => [] },
      $transaction: async (operasjoner: Promise<unknown>[]) => {
        transaksjoner += 1;
        return Promise.all(operasjoner);
      },
    },
  },
});

async function coachPage() {
  return (await import("./page")).default;
}

async function iupPage() {
  return (await import("./iup/[elevId]/page")).default;
}

async function action() {
  return (await import("./iup/[elevId]/actions")).lagreIupSamtale;
}

test.beforeEach(() => {
  bruker = { id: "coach-1", role: "COACH" };
  coachGruppeId = "wang-top-id";
  elevGruppeId = "wang-top-id";
  tilgangFeil = false;
  liveKall = 0;
  elevLesinger = 0;
  transaksjoner = 0;
  periodeCount = 1;
  maalRader = [];
  periodeWheres.length = 0;
});

test("coachruten henter aldri elevlisten når gruppetilgang mangler", async () => {
  const side = await coachPage();
  coachGruppeId = null;
  await assert.rejects(side(), (error) => error === IKKE_FUNNET);
  assert.equal(liveKall, 0);
});

test("coachruten henter elevlisten etter godkjent gruppetilgang", async () => {
  const side = await coachPage();
  const resultat = await side();
  assert.equal(liveKall, 1);
  assert.ok(resultat);
});

test("IUP-ruten leser ingen elevdata når den felles ressursgrensen avviser", async () => {
  const side = await iupPage();
  elevGruppeId = null;
  await assert.rejects(side({ params: Promise.resolve({ elevId: "elev-1" }) }), (error) => error === IKKE_FUNNET);
  assert.equal(elevLesinger, 0);
});

test("IUP-action skriver ingenting når ressursgrensen avviser", async () => {
  const lagre = await action();
  elevGruppeId = null;
  const svar = await lagre({ elevId: "elev-1", evalueringer: [], nestePeriodeId: "periode-1", nyeFokus: [] });
  assert.deepEqual(svar, { ok: false, feil: "Du har ikke tilgang til denne elevens IUP." });
  assert.equal(transaksjoner, 0);
});

test("IUP-action viser trygg prøve-igjen-feil ved tilgangsdatabasefeil", async () => {
  const lagre = await action();
  tilgangFeil = true;
  const svar = await lagre({ elevId: "elev-1", evalueringer: [], nestePeriodeId: "periode-1", nyeFokus: [] });
  assert.deepEqual(svar, { ok: false, feil: "Kunne ikke kontrollere tilgangen akkurat nå. Prøv igjen." });
  assert.equal(transaksjoner, 0);
});

test("IUP-action avviser en periode utenfor elevens WANG-gruppe", async () => {
  const lagre = await action();
  periodeCount = 0;
  const svar = await lagre({ elevId: "elev-1", evalueringer: [], nestePeriodeId: "annen-gruppe-periode", nyeFokus: [] });
  assert.deepEqual(svar, { ok: false, feil: "Fant ikke alle periodene i WANG-gruppen." });
  assert.equal(transaksjoner, 0);
});

test("IUP-action lagrer når både aktør, elev, mål og perioder er innenfor grensen", async () => {
  const lagre = await action();
  maalRader = [{ id: "maal-1", periodBlockId: "periode-0" }];
  periodeCount = 2;
  const svar = await lagre({
    elevId: "elev-1",
    evalueringer: [{
      id: "maal-1",
      egenvurdering: 4,
      trenervurdering: 4,
      status: "PAA_VEI",
      kommentar: "Syntetisk test",
    }],
    nestePeriodeId: "periode-1",
    nyeFokus: [],
  });
  assert.deepEqual(svar, { ok: true });
  assert.equal(transaksjoner, 1);
  assert.equal(periodeWheres[0]?.groupId, "wang-top-id");
});
