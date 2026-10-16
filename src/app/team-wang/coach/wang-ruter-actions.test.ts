import assert from "node:assert/strict";
import { mock, test } from "node:test";

const IKKE_FUNNET = new Error("IKKE_FUNNET");

let bruker: { id: string; role: string; name?: string } | null = { id: "coach-1", role: "COACH" };
let sisteAllow: string[] | undefined;
let coachGruppeId: string | null = "wang-top-id";
let elevGruppeId: string | null = "wang-top-id";
let tilgangFeil = false;
let liveKall = 0;
let elevLesinger = 0;
let transaksjoner = 0;
let proposalWrites = 0;
let goalCreates = 0;
let goalDeletes = 0;
let periodeCount = 1;
let maalRader: Array<{ id: string; periodBlockId: string }> = [];
const periodeWheres: Array<Record<string, unknown>> = [];

class TestWangDataUtilgjengeligError extends Error {}

mock.module("server-only", { defaultExport: {} });

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
  namedExports: {
    // Speiler den ekte vakten: uinnlogget og feil rolle sendes bort.
    requirePortalUser: async (opts: { allow?: string[]; redirectTo?: string } = {}) => {
      sisteAllow = opts.allow;
      if (!bruker) throw new Error(`REDIRECT:${opts.redirectTo ?? "/auth/login"}`);
      if (opts.allow && !opts.allow.includes(bruker.role)) throw new Error("REDIRECT:/portal");
      return bruker;
    },
  },
});

mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUser: async () => bruker },
});

mock.module("@/app/team-wang/coach/coach-arsplan", {
  namedExports: { CoachArsplan: () => null },
});

mock.module("@/app/team-wang/coach/WangCoachKlient", {
  namedExports: { WangCoachKlient: () => null },
});

mock.module("@/app/team-wang/coach/iup/[elevId]/iup-samtale", {
  namedExports: { IupSamtale: () => null },
});

mock.module("@/app/team-wang/_data/wang-tilgang", {
  namedExports: {
    WangDataUtilgjengeligError: TestWangDataUtilgjengeligError,
    medWangElevData: async (_bruker: unknown, _id: string, les: (tx: unknown, gruppe: string) => Promise<unknown>) => {
      if (tilgangFeil) throw new TestWangDataUtilgjengeligError();
      if (!elevGruppeId) return null;
      transaksjoner += 1;
      return les((await import("@/lib/prisma")).prisma, elevGruppeId);
    },
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
      return {
        gruppeId: "wang-top-id",
        elever: [
          { id: "elev-1", navn: "Test Elev", rolle: "PLAYER" },
          { id: "trener-1", navn: "Test Trener", rolle: "COACH" },
        ],
      };
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
        findMany: async ({ where }: { where?: { periodBlockId?: string; id?: { in: string[] } } } = {}) => {
          if (where?.id?.in) return maalRader.filter((r) => where.id?.in.includes(r.id));
          if (where?.periodBlockId) return maalRader.filter((r) => r.periodBlockId === where.periodBlockId);
          return maalRader;
        },
        update: async () => ({}),
        deleteMany: async () => { goalDeletes += 1; return {}; },
        createMany: async () => { goalCreates += 1; return {}; },
      },
      planAction: {
        findUnique: async () => null,
        create: async () => { proposalWrites += 1; return { id: "proposal" }; },
      },
      testResult: { findMany: async () => [] },
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
  sisteAllow = undefined;
  coachGruppeId = "wang-top-id";
  elevGruppeId = "wang-top-id";
  tilgangFeil = false;
  liveKall = 0;
  elevLesinger = 0;
  transaksjoner = 0;
  proposalWrites = 0;
  goalCreates = 0;
  goalDeletes = 0;
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

test("IUP-action avviser spilleren selv når ressursgrensen ellers ville sluppet inn", async () => {
  const lagre = await action();
  bruker = { id: "elev-1", role: "PLAYER" };
  elevGruppeId = "wang-top-id";
  const svar = await lagre({ elevId: "elev-1", evalueringer: [], nestePeriodeId: "periode-1", nestePeriodeNavn: "Vår", requestId: "00000000-0000-4000-8000-000000000001", nyeFokus: [] });
  assert.deepEqual(svar, { ok: false, feil: "Du har ikke tilgang til denne elevens IUP." });
  assert.equal(transaksjoner, 0);
});

test("IUP-action skriver ingenting når ressursgrensen avviser", async () => {
  const lagre = await action();
  elevGruppeId = null;
  const svar = await lagre({ elevId: "elev-1", evalueringer: [], nestePeriodeId: "periode-1", nestePeriodeNavn: "Vår", requestId: "00000000-0000-4000-8000-000000000002", nyeFokus: [] });
  assert.deepEqual(svar, { ok: false, feil: "Du har ikke tilgang til denne elevens IUP." });
  assert.equal(transaksjoner, 0);
});

test("IUP-action viser trygg prøve-igjen-feil ved tilgangsdatabasefeil", async () => {
  const lagre = await action();
  tilgangFeil = true;
  const svar = await lagre({ elevId: "elev-1", evalueringer: [], nestePeriodeId: "periode-1", nestePeriodeNavn: "Vår", requestId: "00000000-0000-4000-8000-000000000003", nyeFokus: [] });
  assert.deepEqual(svar, { ok: false, feil: "Kunne ikke kontrollere tilgangen akkurat nå. Prøv igjen." });
  assert.equal(transaksjoner, 0);
});

test("IUP-action avviser en periode utenfor elevens WANG-gruppe", async () => {
  const lagre = await action();
  periodeCount = 0;
  const svar = await lagre({ elevId: "elev-1", evalueringer: [], nestePeriodeId: "annen-gruppe-periode", nestePeriodeNavn: "Ukjent", requestId: "00000000-0000-4000-8000-000000000004", nyeFokus: [] });
  assert.deepEqual(svar, { ok: false, feil: "Du har ikke tilgang til denne elevens IUP." });
  assert.equal(proposalWrites, 0);
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
    nestePeriodeNavn: "Vår",
    requestId: "00000000-0000-4000-8000-000000000005",
    nyeFokus: [],
  });
  assert.deepEqual(svar, { ok: true });
  assert.equal(transaksjoner, 1);
  assert.equal(proposalWrites, 1);
  assert.equal(goalCreates, 0);
  assert.equal(goalDeletes, 0);
  assert.equal(periodeWheres[0]?.groupId, "wang-top-id");
});

// ---- Rolle og tilgang i /team-wang (sikkerhet 05.10.2026) ----

async function skjermerPage() {
  return (await import("../skjermer/page")).default;
}

type KlientProps = { omraade: string; rolle: string; elever?: Array<{ id: string; navn: string }> };
function propsFra(element: unknown): KlientProps {
  return (element as { props: KlientProps }).props;
}

test("trener kan ikke åpne Administrasjon: sendes til I dag", async () => {
  const side = await coachPage();
  await assert.rejects(
    side({ searchParams: Promise.resolve({ omraade: "admin" }) }),
    /REDIRECT:\/team-wang\/coach\?omraade=idag/,
  );
});

test("sportssjef (ADMIN) får Administrasjon og rollen Sportssjef fra serveren", async () => {
  bruker = { id: "admin-1", role: "ADMIN" };
  const side = await coachPage();
  const props = propsFra(await side({ searchParams: Promise.resolve({ omraade: "admin" }) }));
  assert.equal(props.omraade, "admin");
  assert.equal(props.rolle, "Sportssjef");
});

test("rollen kan ikke velges via adressen: trener forblir Trener", async () => {
  const side = await coachPage();
  const props = propsFra(
    await side({ searchParams: Promise.resolve({ omraade: "idag", rolle: "Sportssjef" } as never) }),
  );
  assert.equal(props.rolle, "Trener");
});

test("coachruten gir bare spillere videre til lenker mot ekte data", async () => {
  const side = await coachPage();
  const props = propsFra(await side());
  assert.deepEqual(props.elever, [{ id: "elev-1", navn: "Test Elev" }]);
});

test("skjermoversikten krever innlogget trener eller sportssjef", async () => {
  const side = await skjermerPage();
  bruker = null;
  await assert.rejects(side(), /REDIRECT:\/team-wang\/logg-inn/);
  bruker = { id: "elev-1", role: "PLAYER" };
  await assert.rejects(side(), /REDIRECT:\/portal/);
  bruker = { id: "foresatt-1", role: "PARENT" };
  await assert.rejects(side(), /REDIRECT:/);
});

test("skjermoversikten kaller vakten med ADMIN/COACH og krever WANG-gruppe", async () => {
  const side = await skjermerPage();
  coachGruppeId = null;
  await assert.rejects(side(), (error) => error === IKKE_FUNNET);
  assert.deepEqual(sisteAllow, ["ADMIN", "COACH"]);
  coachGruppeId = "wang-top-id";
  const props = propsFra(await side());
  assert.equal(props.omraade, "system");
  assert.equal(props.rolle, "Trener");
});
