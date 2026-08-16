/**
 * Avvis-tester for auth-guardene (steg 4 i `docs/plan-testdekning.md`).
 *
 * `scripts/check-action-auth.mjs` beviser at en server-action IMPORTERER en
 * guard. Den beviser ikke at guarden faktisk AVVISER. Det er to helt
 * forskjellige påstander, og bare den siste stopper en fremmed `userId` som
 * POST-es direkte forbi side-vakten.
 *
 * Derfor tester denne filen avvisning, ikke bekreftelse: hvert tilfelle sier
 * «denne brukeren skal IKKE slippe gjennom», og feiler hvis guarden slipper
 * dem inn.
 *
 * Mocke-strategi: kun SESJONEN (`./getCurrentUser`), DB-oppslaget (`./coached`)
 * og `next/navigation` mockes. `./cbac` og `./minor` kjøres EKTE — det er selve
 * policyen vi vil teste, ikke en kopi av den.
 *
 * NB om mock-oppsettet: mockene registreres ÉN gang på modulnivå, før guardene
 * importeres, og hvert testtilfelle setter i stedet `gjeldendeBruker` /
 * `coachHarTilgang`. Grunnen er at ESM cacher moduler per spesifikator: legger
 * man `t.mock.module(...)` inne i hvert test, vinner den FØRSTE registreringen
 * for alle senere tester, fordi guarden allerede har bundet sin import av
 * `./getCurrentUser`. Da blir «utlogget»-tilfellene grønne uten å teste noe.
 * (Målt: 3 av 9 tester var falskt grønne med per-test-mocks.)
 *
 * Kjør med: npm test
 */

import { test, mock } from "node:test";
import assert from "node:assert/strict";
import type { User } from "@/generated/prisma/client";

/** Kastes av redirect-mocken, så vi kan se HVOR guarden sendte brukeren. */
class RedirectSignal extends Error {
  constructor(public readonly to: string) {
    super(`REDIRECT:${to}`);
  }
}

function bruker(over: Partial<User> = {}): User {
  return {
    id: "u-1",
    role: "PLAYER",
    requiresGuardianConsent: false,
    guardianConsentGivenAt: null,
    deletedAt: null,
    ...over,
  } as User;
}

// Delt tilstand som hvert testtilfelle setter før det kaller guarden.
let gjeldendeBruker: User | null = null;
let coachHarTilgang = false;

mock.module("@/lib/auth/getCurrentUser", {
  namedExports: {
    getCurrentUser: async () => gjeldendeBruker,
    getCurrentUserRaw: async () => gjeldendeBruker,
  },
});

mock.module("@/lib/auth/coached", {
  namedExports: {
    harCoachTilgangTilSpiller: async () => coachHarTilgang,
  },
});

mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new RedirectSignal(to);
    },
  },
});

// Repoet bygger som CJS, så top-level await er ikke tilgjengelig her (esbuild:
// «Top-level await is currently not supported with the "cjs" output format»).
// Guardene lastes derfor lazy ved første testtilfelle. Mockene over er allerede
// registrert synkront på modulnivå, så importen under plukker dem opp.
type Guards = {
  assertCanViewPlayerData: typeof import("./assert-own-or-coached").assertCanViewPlayerData;
  requireCapability: typeof import("./requireCapability").requireCapability;
  requirePortalUser: typeof import("./requirePortalUser").requirePortalUser;
  canAccessMissionControl: typeof import("./canAccessMissionControl").canAccessMissionControl;
  Capability: typeof import("./cbac").Capability;
};
let lastet: Guards | null = null;

async function guards(): Promise<Guards> {
  if (lastet) return lastet;
  const [aoc, rc, rpu, cam, cbac] = await Promise.all([
    import("./assert-own-or-coached"),
    import("./requireCapability"),
    import("./requirePortalUser"),
    import("./canAccessMissionControl"),
    import("./cbac"),
  ]);
  const g: Guards = {
    assertCanViewPlayerData: aoc.assertCanViewPlayerData,
    requireCapability: rc.requireCapability,
    requirePortalUser: rpu.requirePortalUser,
    canAccessMissionControl: cam.canAccessMissionControl,
    Capability: cbac.Capability,
  };
  lastet = g;
  return g;
}

/** Fanger redirect-signalet og returnerer stien guarden valgte. */
async function fangRedirect(fn: () => Promise<unknown>): Promise<string> {
  try {
    await fn();
  } catch (e) {
    if (e instanceof RedirectSignal) return e.to;
    throw e;
  }
  throw new Error("Guarden redirectet ikke — den slapp brukeren gjennom");
}

test("assertCanViewPlayerData avviser fremmed userId", async () => {
  const { assertCanViewPlayerData } = await guards();
  gjeldendeBruker = bruker({ id: "spiller-a", role: "PLAYER" });
  coachHarTilgang = false;

  // Egne data: OK.
  await assertCanViewPlayerData("spiller-a");

  // En annen spillers data: skal kaste. Dette er IDOR-tilfellet.
  await assert.rejects(
    () => assertCanViewPlayerData("spiller-b"),
    /Ingen tilgang/,
    "spiller-a fikk lese spiller-b sine data",
  );
});

test("assertCanViewPlayerData avviser coach UTEN tilgang til spilleren", async () => {
  const { assertCanViewPlayerData } = await guards();
  gjeldendeBruker = bruker({ id: "coach-a", role: "COACH" });
  coachHarTilgang = false; // spilleren er ikke i stallen hans

  await assert.rejects(
    () => assertCanViewPlayerData("spiller-b"),
    /Ingen tilgang/,
    "en coach uten relasjon til spilleren fikk lese dataene",
  );
});

test("assertCanViewPlayerData slipper gjennom coach MED tilgang", async () => {
  const { assertCanViewPlayerData } = await guards();
  gjeldendeBruker = bruker({ id: "coach-a", role: "COACH" });
  coachHarTilgang = true;

  await assertCanViewPlayerData("spiller-b");
});

test("assertCanViewPlayerData avviser PLAYER selv om coach-oppslaget sier ja", async () => {
  const { assertCanViewPlayerData } = await guards();
  // Rollesjekken skal komme FØR coach-oppslaget: en vanlig spiller skal aldri
  // kunne nyte godt av at harCoachTilgangTilSpiller returnerer true.
  gjeldendeBruker = bruker({ id: "spiller-a", role: "PLAYER" });
  coachHarTilgang = true;

  await assert.rejects(
    () => assertCanViewPlayerData("spiller-b"),
    /Ingen tilgang/,
    "en PLAYER slapp gjennom coach-grenen",
  );
});

test("assertCanViewPlayerData avviser utlogget", async () => {
  const { assertCanViewPlayerData } = await guards();
  gjeldendeBruker = null;
  coachHarTilgang = false;

  await assert.rejects(
    () => assertCanViewPlayerData("spiller-a"),
    /Ikke innlogget/,
  );
});

test("requireCapability avviser rolle uten capability (ekte cbac-policy)", async () => {
  const { requireCapability, Capability } = await guards();
  gjeldendeBruker = bruker({ id: "coach-a", role: "COACH" });

  // VIEW_FINANCE er ADMIN-only i cbac. COACH skal sendes hjem, ikke slippe inn.
  const til = await fangRedirect(() =>
    requireCapability(Capability.VIEW_FINANCE),
  );
  assert.equal(til, "/admin");
});

test("requireCapability avviser utlogget til login", async () => {
  const { requireCapability, Capability } = await guards();
  gjeldendeBruker = null;

  const til = await fangRedirect(() =>
    requireCapability(Capability.VIEW_FINANCE),
  );
  assert.equal(til, "/auth/login");
});

test("requirePortalUser avviser feil rolle og sender til riktig hjemmeside", async () => {
  const { requirePortalUser } = await guards();
  gjeldendeBruker = bruker({ id: "p-1", role: "PARENT" });

  // En PARENT skal ikke inn på en ADMIN-only flate.
  const til = await fangRedirect(() => requirePortalUser({ allow: "ADMIN" }));
  assert.equal(til, "/forelder");
});

test("requirePortalUser avviser utlogget til login", async () => {
  const { requirePortalUser } = await guards();
  gjeldendeBruker = null;

  const til = await fangRedirect(() => requirePortalUser({ allow: "PLAYER" }));
  assert.equal(til, "/auth/login");
});

test("requirePortalUser sender mindreårig uten samtykke til venterom (GDPR art. 8)", async () => {
  const { requirePortalUser } = await guards();
  gjeldendeBruker = bruker({
    id: "junior",
    role: "PLAYER",
    requiresGuardianConsent: true,
    guardianConsentGivenAt: null,
  });

  // Riktig rolle, men manglende foreldresamtykke skal fortsatt stoppe.
  const til = await fangRedirect(() => requirePortalUser({ allow: "PLAYER" }));
  assert.equal(til, "/auth/samtykke-venter");
});

test("canAccessMissionControl avviser alt annet enn ADMIN", async () => {
  const { canAccessMissionControl } = await guards();
  // COACH er staff, men Mission Control er ADMIN-only.
  gjeldendeBruker = bruker({ id: "coach-a", role: "COACH" });
  assert.equal(await canAccessMissionControl(), null);

  gjeldendeBruker = bruker({ id: "spiller-a", role: "PLAYER" });
  assert.equal(await canAccessMissionControl(), null);

  gjeldendeBruker = bruker({ id: "forelder", role: "PARENT" });
  assert.equal(await canAccessMissionControl(), null);
});

test("canAccessMissionControl avviser utlogget", async () => {
  const { canAccessMissionControl } = await guards();
  gjeldendeBruker = null;
  assert.equal(await canAccessMissionControl(), null);
});

test("canAccessMissionControl slipper gjennom ADMIN", async () => {
  const { canAccessMissionControl } = await guards();
  gjeldendeBruker = bruker({ id: "admin-1", role: "ADMIN" });
  const u = await canAccessMissionControl();
  assert.equal(u?.id, "admin-1");
});
