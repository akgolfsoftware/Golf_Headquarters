import assert from "node:assert/strict";
import { mock, test } from "node:test";
let storageFails = false;
let audio: string | null = "synthetic/audio.webm";
let cleared = false;
let testPhotoPaths: { id: string; storagePath: string }[] = [];
let testPhotoMetadataDeleted = false;
mock.module("@/lib/prisma", { namedExports: { prisma: {
  user: { findUnique: async () => ({ authId: null }) },
  playerSwingVideo: { findMany: async () => [] },
  sessionRecording: {
    findMany: async () => [{ id: "synthetic", audioUrl: audio }],
    updateMany: async () => { cleared = true; audio = null; return { count: 1 }; },
  },
  testSessionPhoto: {
    count: async () => testPhotoPaths.length,
    findMany: async () => testPhotoPaths,
    deleteMany: async () => { testPhotoMetadataDeleted = true; return { count: testPhotoPaths.length }; },
  },
  booking: { updateMany: async () => ({ count: 0 }) },
  subscription: { findMany: async () => [] },
  $queryRaw: async () => [],
} } });
mock.module("@/lib/supabase/admin", { namedExports: { supabaseAdmin: () => ({ storage: {
  from: (bucket: string) => ({ remove: async (paths: string[]) => ({ data: paths, error: storageFails && ["coaching-recordings", "tn-test-photos"].includes(bucket) ? new Error("synthetic storage outage") : null }) }),
} }) } });
mock.module("@/lib/stripe", { namedExports: { stripeKlient: () => { throw new Error("must not contact Stripe"); } } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
test.beforeEach(() => { storageFails = false; audio = "synthetic/audio.webm"; cleared = false; testPhotoPaths = []; testPhotoMetadataDeleted = false; });
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

test("testbildeindeks beholdes ved Storage-feil og slettes ved vellykket nytt forsøk", async () => {
  const { slettEksterneBrukerdata } = await import("./slett-eksterne-data");
  testPhotoPaths = [{ id: "photo-synthetic", storagePath: "synthetic/session/1/photo.webp" }];
  storageFails = true;
  const failed = await slettEksterneBrukerdata("synthetic");
  assert.ok(failed.feil.some((feil) => feil.startsWith("testbilder:")));
  assert.equal(testPhotoMetadataDeleted, false);

  storageFails = false;
  const retried = await slettEksterneBrukerdata("synthetic");
  assert.ok(!retried.feil.some((feil) => feil.startsWith("testbilder:")));
  assert.equal(testPhotoMetadataDeleted, true);
});
