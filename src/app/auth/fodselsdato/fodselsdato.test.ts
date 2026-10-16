/**
 * Punkt 8 i §KODEGJENNOMGANGEN 06.10: spiller uten fødselsdato sendes til
 * /auth/fodselsdato før PlayerHQ åpnes, og slipper inn når datoen er lagret.
 * Datoen kan ikke skrives om (D-63/TP-02). Coach, admin og forelder berøres ikke.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

type Bruker = {
  id: string;
  name: string;
  role: string;
  dateOfBirth: Date | null;
  requiresGuardianConsent: boolean;
  preferences: Record<string, unknown> | null;
};

let bruker: Bruker;
let oppdateringer: Array<Record<string, unknown>> = [];

mock.module("server-only", { defaultExport: {} });
mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new Error(`REDIRECT:${to}`);
    },
  },
});
mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUserRaw: async () => bruker },
});
mock.module("@/lib/auth/requirePortalUser", {
  namedExports: { requirePortalUser: async () => bruker },
});
mock.module("@/lib/analytics/daglig-aktivitet", {
  namedExports: { registrerDagligAktivitet: async () => undefined },
});
mock.module("@/components/portal/portal-providers", {
  namedExports: { PortalProviders: ({ children }: { children: unknown }) => children },
});
// Skjemaet er en klientkomponent med stilark; siden testes uten det.
mock.module("./fodselsdato-skjema", { namedExports: { FodselsdatoSkjema: () => null } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/email", {
  namedExports: { resendKlient: () => ({ emails: { send: async () => undefined } }), FRA_EPOST: "x@y.no" },
});
mock.module("@/lib/turneringer/link-public-players", {
  namedExports: { linkAndSyncUserTournamentResults: async () => undefined },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        update: async ({ data }: { data: Record<string, unknown> }) => {
          oppdateringer.push(data);
          Object.assign(bruker, data);
          return {};
        },
      },
      parentInvitation: {
        create: async () => ({ id: "inv-1", token: "tok" }),
        updateMany: async () => ({ count: 0 }),
      },
    },
  },
});

async function aapnePortal(): Promise<string> {
  const { default: PortalLayout } = await import("@/app/portal/layout");
  try {
    await PortalLayout({ children: "portal" });
    return "inne";
  } catch (e) {
    return (e as Error).message;
  }
}

async function aapneFodselsdato(): Promise<string> {
  const { default: Side } = await import("./page");
  try {
    await Side();
    return "skjema";
  } catch (e) {
    return (e as Error).message;
  }
}

test.beforeEach(() => {
  oppdateringer = [];
  bruker = {
    id: "spiller-a",
    name: "Spiller",
    role: "PLAYER",
    dateOfBirth: null,
    requiresGuardianConsent: false,
    preferences: null,
  };
});

test("spiller uten fødselsdato sendes til fødselsdatosiden", async () => {
  assert.equal(await aapnePortal(), "REDIRECT:/auth/fodselsdato");
  assert.equal(await aapneFodselsdato(), "skjema");
});

test("spiller slipper inn i PlayerHQ etter at datoen er lagret", async () => {
  const { setDateOfBirthAndCheckMinor } = await import("@/app/auth/onboarding/actions");
  const svar = await setDateOfBirthAndCheckMinor({ dateOfBirth: "1990-05-17" });
  assert.equal(svar.ok, true);
  assert.equal(await aapnePortal(), "inne");
  assert.equal(await aapneFodselsdato(), "REDIRECT:/portal");
});

test("spiller under 16 må oppgi forelderens e-post før datoen lagres", async () => {
  const { setDateOfBirthAndCheckMinor } = await import("@/app/auth/onboarding/actions");
  const aar = new Date().getUTCFullYear() - 12;
  const uten = await setDateOfBirthAndCheckMinor({ dateOfBirth: `${aar}-01-01` });
  assert.equal(uten.ok, false);
  assert.equal(oppdateringer.length, 0);
  const med = await setDateOfBirthAndCheckMinor({ dateOfBirth: `${aar}-01-01`, guardianEmail: "forelder@eksempel.no" });
  assert.equal(med.ok, true);
  assert.equal(bruker.requiresGuardianConsent, true);
});

test("en satt fødselsdato kan ikke skrives om fra siden", async () => {
  bruker.dateOfBirth = new Date("1990-05-17T00:00:00Z");
  const { setDateOfBirthAndCheckMinor } = await import("@/app/auth/onboarding/actions");
  const svar = await setDateOfBirthAndCheckMinor({ dateOfBirth: "1991-01-01" });
  assert.equal(svar.ok, false);
  assert.equal(oppdateringer.length, 0);
  assert.equal(bruker.dateOfBirth.toISOString().slice(0, 10), "1990-05-17");
});

test("coach, admin og forelder uten fødselsdato berøres ikke", async () => {
  for (const [rolle, hjem] of [["COACH", "/admin"], ["ADMIN", "/admin"], ["PARENT", "/forelder"]]) {
    bruker.role = rolle;
    assert.equal(await aapnePortal(), "inne", rolle);
    assert.equal(await aapneFodselsdato(), `REDIRECT:${hjem}`, rolle);
  }
});
