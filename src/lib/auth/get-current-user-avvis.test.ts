/**
 * Avvis-tester for `getCurrentUser` / `getCurrentUserRaw` (steg 4 i
 * `docs/plan-testdekning.md`). Dette er den nest mest brukte auth-modulen i
 * repoet (74 filer), og porten der to låste regler håndheves:
 *
 * 1. GDPR P20 — soft-slettet konto (`deletedAt` satt) skal behandles som
 *    utlogget i hele 30-dagers angrevinduet.
 * 2. GDPR art. 8 (S-13) — mindreårig uten foreldresamtykke skal aldri komme
 *    ut av `getCurrentUser`; den skal redirecte til venterommet.
 *
 * Egen fil fordi denne modulen må mocke `@/lib/supabase/server` og
 * `@/lib/prisma`, mens `guards-avvis.test.ts` mocker `./getCurrentUser` selv —
 * de to mock-oppsettene kan ikke leve i samme prosess uten å overskrive
 * hverandre.
 *
 * NB: `getCurrentUserRaw` er pakket i `react.cache`. I testprosessen finnes
 * ingen request-kontekst, så memoiseringen er verifisert å IKKE slå til på
 * tvers av kallene under (hvert scenario setter ny tilstand og får nytt svar).
 * Slår den til en dag, feiler testene høylytt i stedet for å bli falskt grønne.
 *
 * Kjør med: npm test
 */

import { test, mock } from "node:test";
import assert from "node:assert/strict";
import type { User } from "@/generated/prisma/client";

class RedirectSignal extends Error {
  constructor(public readonly to: string) {
    super(`REDIRECT:${to}`);
  }
}

// Delt tilstand — settes per testtilfelle (samme mønster som guards-avvis.test.ts).
let authBruker: { id: string } | null = null;
let dbBruker: Partial<User> | null = null;

mock.module("@/lib/supabase/server", {
  namedExports: {
    createClient: async () => ({
      auth: { getUser: async () => ({ data: { user: authBruker } }) },
    }),
  },
});

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: {
        findUnique: async () => dbBruker,
        update: async () => dbBruker,
      },
      subscription: { findUnique: async () => null },
      groupMember: { count: async () => 0 },
    },
  },
});

mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new RedirectSignal(to);
    },
  },
});

type Mod = {
  getCurrentUser: typeof import("./getCurrentUser").getCurrentUser;
  getCurrentUserRaw: typeof import("./getCurrentUser").getCurrentUserRaw;
};
let lastet: Mod | null = null;

async function mod(): Promise<Mod> {
  if (lastet) return lastet;
  const m = await import("./getCurrentUser");
  lastet = {
    getCurrentUser: m.getCurrentUser,
    getCurrentUserRaw: m.getCurrentUserRaw,
  };
  return lastet;
}

function dbRad(over: Partial<User> = {}): Partial<User> {
  return {
    id: "u-1",
    authId: "auth-1",
    role: "PLAYER",
    tier: "PRO",
    deletedAt: null,
    lastLoginAt: new Date(),
    createdAt: new Date("2020-01-01"),
    requiresGuardianConsent: false,
    guardianConsentGivenAt: null,
    ...over,
  };
}

test("getCurrentUserRaw: ingen Supabase-sesjon → null", async () => {
  const { getCurrentUserRaw } = await mod();
  authBruker = null;
  dbBruker = dbRad();

  assert.equal(await getCurrentUserRaw(), null);
});

test("getCurrentUserRaw: soft-slettet konto behandles som utlogget (GDPR P20)", async () => {
  const { getCurrentUserRaw } = await mod();
  authBruker = { id: "auth-1" };
  // Gyldig Supabase-sesjon, men kontoen er slettet i angrevinduet.
  dbBruker = dbRad({ deletedAt: new Date("2026-08-01") });

  assert.equal(
    await getCurrentUserRaw(),
    null,
    "en soft-slettet konto slapp inn i appen",
  );
});

test("getCurrentUserRaw: aktiv konto slipper gjennom", async () => {
  const { getCurrentUserRaw } = await mod();
  authBruker = { id: "auth-1" };
  dbBruker = dbRad({ id: "u-aktiv" });

  const u = await getCurrentUserRaw();
  assert.equal(u?.id, "u-aktiv");
});

test("getCurrentUser: mindreårig uten samtykke redirectes til venterom (GDPR art. 8)", async () => {
  const { getCurrentUser } = await mod();
  authBruker = { id: "auth-1" };
  dbBruker = dbRad({
    id: "junior",
    requiresGuardianConsent: true,
    guardianConsentGivenAt: null,
  });

  try {
    const u = await getCurrentUser();
    assert.fail(
      `getCurrentUser returnerte en mindreårig uten samtykke: ${JSON.stringify(u?.id)}`,
    );
  } catch (e) {
    assert.ok(e instanceof RedirectSignal, `uventet feil: ${String(e)}`);
    assert.equal(e.to, "/auth/samtykke-venter");
  }
});

test("getCurrentUser: mindreårig MED samtykke slipper gjennom", async () => {
  const { getCurrentUser } = await mod();
  authBruker = { id: "auth-1" };
  dbBruker = dbRad({
    id: "junior-ok",
    requiresGuardianConsent: true,
    guardianConsentGivenAt: new Date("2026-01-01"),
  });

  const u = await getCurrentUser();
  assert.equal(u?.id, "junior-ok");
});
