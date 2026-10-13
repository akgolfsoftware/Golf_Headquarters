import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";

let viewer: { id: string; role: string } | null;
let consent: boolean[];
let accessible = true;
let downloads = 0, uploads = 0, writes = 0, triggers = 0;
let downloadFails = false, uploadFails = false, writeCount = 1;
const updatedAt = new Date("2026-10-12T10:00:00Z");
let recording: {
  id: string; uploadedById: string; playerId: string; bookingId: null;
  status: string; audioUrl: string | null; updatedAt: Date; chunks: unknown;
};
let final: { path: string; bytes: Buffer; contentType: string } | null;
let saved: Record<string, unknown> | null;
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => viewer } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => accessible } });
mock.module("@/lib/recording/lyd-samtykke", { namedExports: { hentLydSamtykkeStatus: async () => ({ tillatt: consent.length > 1 ? consent.shift() : consent[0] }) } });
mock.module("@/lib/rate-limit", { namedExports: { rateLimit: async () => ({ ok: true }) } });
mock.module("@/lib/audit", { namedExports: { audit: async () => {} } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => {} } });
mock.module("@/lib/prisma", { namedExports: { prisma: { sessionRecording: {
  findUnique: async () => recording,
  updateMany: async (args: { where: Record<string, unknown>; data: Record<string, unknown> }) => {
    writes++; assert.deepEqual(args.where, { id: "rec", status: "RECORDING", updatedAt });
    saved = args.data; return { count: writeCount };
  },
} } } });
mock.module("@/lib/supabase/admin", { namedExports: { supabaseAdmin: () => ({ storage: { from: (bucket: string) => {
  assert.equal(bucket, "coaching-recordings");
  return {
    download: async (path: string) => { downloads++; return downloadFails
      ? { data: null, error: new Error("synthetic download failure") }
      : { data: new Blob([path.endsWith("00000.m4a") ? "first" : "tail"]), error: null }; },
    upload: async (path: string, bytes: Buffer, options: { contentType: string }) => {
      uploads++; final = { path, bytes, contentType: options.contentType };
      return { error: uploadFails ? new Error("synthetic upload failure") : null };
    },
  };
} } }) } });
let POST: typeof import("@/app/api/recording/complete/route").POST;
before(async () => { ({ POST } = await import("@/app/api/recording/complete/route")); });
beforeEach(() => {
  viewer = { id: "coach", role: "COACH" }; consent = [true]; accessible = true;
  downloads = uploads = writes = triggers = 0; downloadFails = uploadFails = false; writeCount = 1;
  final = saved = null;
  recording = { id: "rec", uploadedById: "coach", playerId: "player", bookingId: null,
    status: "RECORDING", audioUrl: null, updatedAt, chunks: [0, 1].map(idx => ({
      idx, path: `coach/rec/chunk-${String(idx).padStart(5, "0")}.m4a`, size: idx === 0 ? 5 : 4, mimeType: "audio/mp4",
    })) };
  mock.method(globalThis, "fetch", async () => { triggers++; return new Response("{}", { status: 200 }); });
});
const request = (body: object = { recordingId: "rec", expectedChunks: 2, durationSec: 17 }) =>
  new Request("http://127.0.0.1:3300/api/recording/complete", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });

test("fullføring lagrer hele mp4-strømmen og bekrefter først etter databaselagring", async () => {
  const response = await POST(request());
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), { ok: true, recordingId: "rec" });
  assert.equal(downloads, 2); assert.equal(uploads, 1); assert.equal(writes, 1); assert.equal(triggers, 1);
  assert.equal(final?.bytes.toString(), "firsttail"); assert.equal(final?.contentType, "audio/mp4");
  assert.match(final?.path ?? "", /^coach\/rec\/final-\d+\.m4a$/);
  assert.equal(saved?.durationSec, 17); assert.equal(saved?.status, "PROCESSING");
});
test("manglende forventet antall eller ventende del kan ikke gi ferdigbekreftelse", async () => {
  assert.equal((await POST(request({ recordingId: "rec" }))).status, 400);
  assert.equal((await POST(request({ recordingId: "rec", expectedChunks: 3 }))).status, 409);
  assert.equal(downloads + uploads + writes + triggers, 0);
});
test("manglende lagret lydbit og lagringsfeil beholder opptaket ufullført", async () => {
  downloadFails = true; assert.equal((await POST(request())).status, 500);
  assert.equal(writes + triggers, 0);
  downloadFails = false; uploadFails = true; assert.equal((await POST(request())).status, 500);
  assert.equal(writes + triggers, 0);
});
test("tilbaketrukket samtykke under lagring gir ingen fullføring eller AI-utløsing", async () => {
  consent = [true, false]; assert.equal((await POST(request())).status, 403);
  assert.equal(uploads, 1); assert.equal(writes + triggers, 0);
});
test("endret opptak under sammensetting gir konflikt fremfor falsk ferdigbekreftelse", async () => {
  writeCount = 0; assert.equal((await POST(request())).status, 409);
  assert.equal(writes, 1); assert.equal(triggers, 0);
});
test("gjentatt fullføring av allerede lagret opptak er idempotent og krever fortsatt samtykke", async () => {
  recording.status = "PROCESSING"; recording.audioUrl = "coach/rec/final.m4a";
  assert.equal((await POST(request())).status, 200); assert.equal(downloads + uploads + writes + triggers, 0);
  consent = [false]; assert.equal((await POST(request())).status, 403);
});
test("andre spillere, andre coacher og mistet spillertilgang kan ikke fullføre opptaket", async () => {
  viewer = null; assert.equal((await POST(request())).status, 401);
  viewer = { id: "player", role: "PLAYER" }; assert.equal((await POST(request())).status, 403);
  viewer = { id: "other-coach", role: "COACH" }; assert.equal((await POST(request())).status, 403);
  viewer = { id: "coach", role: "COACH" }; accessible = false; assert.equal((await POST(request())).status, 403);
  assert.equal(downloads + uploads + writes + triggers, 0);
});
test("avbrutt opptak blir ikke gjenopplivet av gjentatt fullføring", async () => {
  recording.status = "ABORTED"; assert.equal((await POST(request())).status, 409);
  assert.equal(downloads + uploads + writes + triggers, 0);
});
