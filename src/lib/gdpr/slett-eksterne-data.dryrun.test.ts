/**
 * dryRun skal aldri kalle eksterne tjenester.
 * Vi stubber prisma + sjekker at plan fylles og destruktive flagg er false.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn().mockResolvedValue({ authId: "auth-1" }),
    },
    playerSwingVideo: {
      findMany: vi.fn().mockResolvedValue([{ id: "v1" }]),
    },
    sessionRecording: {
      count: vi.fn().mockResolvedValue(2),
      findMany: vi.fn(),
      updateMany: vi.fn(),
    },
    booking: { updateMany: vi.fn() },
    subscription: {
      findUnique: vi.fn().mockResolvedValue({
        stripeCustomerId: "cus_x",
        stripeSubscriptionId: "sub_x",
      }),
    },
  },
}));

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: vi.fn(() => {
    throw new Error("supabaseAdmin skal ikke kalles i dryRun");
  }),
}));

vi.mock("@/lib/stripe", () => ({
  stripeKlient: vi.fn(() => {
    throw new Error("stripe skal ikke kalles i dryRun");
  }),
}));

vi.mock("@/lib/error-tracking", () => ({
  logError: vi.fn(),
}));

import { slettEksterneBrukerdata } from "./slett-eksterne-data";

describe("slettEksterneBrukerdata dryRun", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returnerer plan uten å kalle Auth/Storage/Stripe", async () => {
    const r = await slettEksterneBrukerdata("user-1", { dryRun: true });
    expect(r.dryRun).toBe(true);
    expect(r.authSlettet).toBe(false);
    expect(r.stripeKundeSlettet).toBe(false);
    expect(r.storageFilerFjernet).toBe(0);
    expect(r.plan?.length).toBeGreaterThan(0);
    expect(r.plan?.some((l) => /Stripe/i.test(l))).toBe(true);
    expect(r.plan?.some((l) => /Auth/i.test(l))).toBe(true);
  });
});
