/**
 * dryRun skal aldri kalle eksterne tjenester.
 * Mønster: t.mock.module + dynamisk import (som progress.test.ts).
 * Kjør: npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";

test("slettEksterneBrukerdata dryRun — plan uten Auth/Storage/Stripe", async (t) => {
  let stripeKalt = false;
  let supabaseKalt = false;

  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        user: {
          findUnique: async () => ({ authId: "auth-1" }),
        },
        playerSwingVideo: {
          findMany: async () => [{ id: "v1" }],
        },
        sessionRecording: {
          count: async () => 2,
          findMany: async () => [],
          updateMany: async () => ({ count: 0 }),
        },
        booking: { updateMany: async () => ({ count: 0 }) },
        subscription: {
          findUnique: async () => ({
            stripeCustomerId: "cus_x",
            stripeSubscriptionId: "sub_x",
          }),
        },
      },
      Prisma: { DbNull: null },
    },
  });

  t.mock.module("@/lib/supabase/admin", {
    namedExports: {
      supabaseAdmin: () => {
        supabaseKalt = true;
        throw new Error("supabaseAdmin skal ikke kalles i dryRun");
      },
    },
  });

  t.mock.module("@/lib/stripe", {
    namedExports: {
      stripeKlient: () => {
        stripeKalt = true;
        throw new Error("stripe skal ikke kalles i dryRun");
      },
    },
  });

  t.mock.module("@/lib/error-tracking", {
    namedExports: {
      logError: async () => {},
    },
  });

  // server-only er no-op under --conditions=react-server
  const { slettEksterneBrukerdata } = await import("./slett-eksterne-data");

  const r = await slettEksterneBrukerdata("user-1", { dryRun: true });

  assert.equal(r.dryRun, true);
  assert.equal(r.authSlettet, false);
  assert.equal(r.stripeKundeSlettet, false);
  assert.equal(r.storageFilerFjernet, 0);
  assert.ok(r.plan && r.plan.length > 0, "plan skal være fylt");
  assert.ok(r.plan!.some((l) => /Stripe/i.test(l)), "plan skal nevne Stripe");
  assert.ok(r.plan!.some((l) => /Auth/i.test(l)), "plan skal nevne Auth");
  assert.equal(stripeKalt, false, "stripeKlient skal ikke kalles");
  assert.equal(supabaseKalt, false, "supabaseAdmin skal ikke kalles");
});
