import assert from "node:assert/strict";
import { mock, test } from "node:test";
let storageFails = false;
let audio: string | null = "synthetic/audio.webm";
let cleared = false;
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findUnique: async () => ({ authId: null }) },
  playerSwingVideo: { findMany: async () => [] },
  sessionRecording: {
    findMany: async () => [{ id: "synthetic", audioUrl: audio }],
    updateMany: async () => { cleared = true; audio = null; return { count: 1 }; },
  },
  booking: { updateMany: async () => ({ count: 0 }) },
  subscription: { findMany: async () => [] },
  $queryRaw: async () => [],
} } });
mock.module("@/lib/supabase/admin", { namedExports: { supabaseAdmin: () => ({ storage: {
  from: (bucket: string) => ({ remove: async () => ({ data: [], error: storageFails && bucket === "coaching-recordings" ? new Error("synthetic storage outage") : null }) }),
} }) } });
mock.module("@/lib/stripe", { namedExports: { stripeKlient: () => { throw new Error("must not contact Stripe"); } } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
test.beforeEach(() => { storageFails = false; audio = "synthetic/audio.webm"; cleared = false; });
test("Storage-feil beholder lydreferansen så sletting kan prøves igjen", async () => {
  const { slettEksterneBrukerdata } = await import("./slett-eksterne-data");
  storageFails = true;
  const failed = await slettEksterneBrukerdata("synthetic");
  assert.equal(failed.feil.length, 1); assert.equal(cleared, false);
  storageFails = false;
  const retried = await slettEksterneBrukerdata("synthetic");
  assert.deepEqual(retried.feil, []); assert.equal(cleared, true);
});
test("opptak uten lydfil får også tømt transkripsjon og analyse", async () => {
  const { slettEksterneBrukerdata } = await import("./slett-eksterne-data");
  audio = null;
  await slettEksterneBrukerdata("synthetic");
  assert.equal(cleared, true);
});
