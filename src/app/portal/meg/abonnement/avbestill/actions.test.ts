/**
 * O06/R8: oppsigelse kaller Stripe før egen database. Feiler Stripe,
 * skrives ingenting lokalt.
 */
import assert from "node:assert/strict";
import { mock, test } from "node:test";

let bruker = { id: "spiller-a", role: "PLAYER" as string };
let stripeFeil = false;
let stripeKalt = 0;
let dbOppdatert = 0;
let sub: {
  id: string;
  kind: string;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: Date | null;
} | null = {
  id: "sub-1",
  kind: "PLAYERHQ",
  stripeSubscriptionId: "sub_stripe_1",
  currentPeriodEnd: new Date("2026-10-01T00:00:00Z"),
};

mock.module("next/cache", { namedExports: { revalidatePath: () => undefined } });
mock.module("next/navigation", {
  namedExports: {
    redirect: (to: string) => {
      throw new Error(`REDIRECT:${to}`);
    },
  },
});
mock.module("@/lib/auth/requireConsentingUser", {
  namedExports: { requireConsentingUser: async () => bruker },
});
mock.module("@/lib/audit", { namedExports: { audit: async () => undefined } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/winback/opprett", {
  namedExports: { opprettWinbackTilbud: async () => undefined },
});
mock.module("@/lib/stripe", {
  namedExports: {
    stripeKlient: () => ({
      subscriptions: {
        update: async (_id: string, data: { cancel_at_period_end?: boolean }) => {
          stripeKalt += 1;
          if (stripeFeil) throw new Error("stripe nede");
          assert.equal(data.cancel_at_period_end, true);
          return { id: _id };
        },
      },
    }),
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      subscription: {
        findFirst: async () => sub,
        update: async () => {
          dbOppdatert += 1;
          return {};
        },
      },
    },
  },
});

async function actions() {
  return import("./actions");
}

test.beforeEach(() => {
  bruker = { id: "spiller-a", role: "PLAYER" };
  stripeFeil = false;
  stripeKalt = 0;
  dbOppdatert = 0;
  sub = {
    id: "sub-1",
    kind: "PLAYERHQ",
    stripeSubscriptionId: "sub_stripe_1",
    currentPeriodEnd: new Date("2026-10-01T00:00:00Z"),
  };
});

test("cancelPro kaller Stripe før lokal status endres", async () => {
  const { cancelPro } = await actions();
  await assert.rejects(() => cancelPro("PLAYERHQ"), /avbestilt=1/);
  assert.equal(stripeKalt, 1);
  assert.equal(dbOppdatert, 1);
});

test("cancelPro rører ikke databasen når Stripe feiler", async () => {
  stripeFeil = true;
  const { cancelPro } = await actions();
  const svar = await cancelPro("PLAYERHQ");
  assert.equal(svar.ok, false);
  assert.match(String(svar.error), /nådde ikke Stripe/);
  assert.equal(stripeKalt, 1);
  assert.equal(dbOppdatert, 0);
});

test("cancelPro uten Stripe-id endrer ingenting", async () => {
  sub = { ...sub!, stripeSubscriptionId: null };
  const { cancelPro } = await actions();
  const svar = await cancelPro("PLAYERHQ");
  assert.equal(svar.ok, false);
  assert.equal(stripeKalt, 0);
  assert.equal(dbOppdatert, 0);
});
