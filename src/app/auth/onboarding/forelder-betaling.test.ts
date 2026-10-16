/**
 * Beslutning 15.10.2026 (§INNLOGGING BARE MED GOOGLE OG PASSORD, punkt 2): forelderoppstarten
 * lagrer bare kort som betalingsmåte. Vipps og faktura avvises, og ukjente felt lagres ikke.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let oppdateringer: Array<Record<string, unknown>> = [];

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new Error(`REDIRECT:${to}`);
    },
  },
});
mock.module("@/lib/auth/getCurrentUser", {
  namedExports: {
    getCurrentUserRaw: async () => ({ id: "forelder-a", name: "Forelder", role: "PARENT", dateOfBirth: null, requiresGuardianConsent: false, preferences: null }),
  },
});
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
          return {};
        },
      },
    },
  },
});

test.beforeEach(() => {
  oppdateringer = [];
});

test("kort lagres som betalingsmåte", async () => {
  const { saveForelderOnboardingStep } = await import("./actions");
  await saveForelderOnboardingStep({ paymentMethod: "KORT", parentRelation: "MOR" });
  const prefs = oppdateringer[0]?.preferences as { forelderOnboarding: Record<string, unknown> };
  assert.equal(prefs.forelderOnboarding.paymentMethod, "KORT");
});

for (const metode of ["VIPPS", "FAKTURA"]) {
  test(`${metode} avvises og lagres ikke`, async () => {
    const { saveForelderOnboardingStep } = await import("./actions");
    await assert.rejects(() => saveForelderOnboardingStep({ paymentMethod: metode as "KORT" }));
    assert.equal(oppdateringer.length, 0);
  });
}

test("ukjente felt lagres ikke", async () => {
  const { saveForelderOnboardingStep } = await import("./actions");
  await assert.rejects(() => saveForelderOnboardingStep({ paymentMethod: "KORT", rolle: "ADMIN" } as never));
  assert.equal(oppdateringer.length, 0);
});
