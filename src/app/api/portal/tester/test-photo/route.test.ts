import assert from "node:assert/strict";
import { mock, test } from "node:test";
import sharp from "sharp";
import { TN_VERSION, tnProtocol } from "@/lib/portal-tester/tn-catalog";

let user: { id: string; role: "PLAYER" | "COACH"; requiresGuardianConsent: boolean; guardianConsentGivenAt: Date | null; dateOfBirth?: Date | null } | null = {
  id: "player-synthetic", role: "PLAYER", requiresGuardianConsent: false, guardianConsentGivenAt: null, dateOfBirth: new Date("1995-01-01"),
};
let sessionAvailable = true;
let existingPhoto = false;
let uploaded: { path: string; bytes: Buffer; contentType: string }[] = [];
let removed: string[][] = [];
let uploadThrows = false;
let removeThrows = false;
let signedUrlThrows = false;
let createThrows = false;
const ownerId = "player-synthetic";
const values = Object.fromEntries(tnProtocol("putt-1-3m")!.rows.map((_, i) => [String(i + 1), { strokes: 1 }]));
const scoringData = { version: TN_VERSION, protocolId: "putt-1-3m", count: 25, revision: 1, values, notes: "" };

mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUserRaw: async () => user } });
mock.module("@/lib/prisma", { namedExports: { prisma: {
  testSession: { findFirst: async ({ where }: { where: { userId: string } }) => sessionAvailable && where.userId === ownerId ? { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", testId: "tn-v3-putt-1-3m", scoringData } : null },
  testSessionPhoto: {
    findFirst: async ({ where }: { where: { userId: string } }) => existingPhoto && where.userId === ownerId ? { id: "photo-1", storagePath: "player-synthetic/session/1/photo.webp" } : null,
    findUnique: async () => existingPhoto ? { id: "photo-1" } : null,
    create: async ({ data }: { data: { storagePath: string } }) => { if (createThrows) throw new Error("synthetic database outage"); existingPhoto = true; return { id: "photo-1", storagePath: data.storagePath }; },
    deleteMany: async () => { existingPhoto = false; return { count: 1 }; },
  },
} } });
mock.module("@/lib/rate-limit", { namedExports: { rateLimit: async () => ({ ok: true }) } });
mock.module("@/lib/storage/supabase-storage", { namedExports: { getSignedUrl: async (_bucket: string, path: string) => { if (signedUrlThrows) throw new Error("synthetic signer outage"); return `https://private-storage.invalid/${encodeURIComponent(path)}?signed=short`; }, STORAGE_BUCKETS: { TN_TEST_PHOTOS: "tn-test-photos" } } });
mock.module("@/lib/supabase/admin", { namedExports: { supabaseAdmin: () => ({ storage: { from: () => ({
  upload: async (path: string, bytes: Buffer, options: { contentType: string }) => { if (uploadThrows) throw new Error("synthetic storage outage"); uploaded.push({ path, bytes, contentType: options.contentType }); return { error: null }; },
  remove: async (paths: string[]) => { if (removeThrows) throw new Error("synthetic storage outage"); removed.push(paths); return { error: null }; },
}) } }) } });

function reset() {
  user = { id: "player-synthetic", role: "PLAYER", requiresGuardianConsent: false, guardianConsentGivenAt: null, dateOfBirth: new Date("1995-01-01") };
  sessionAvailable = true; existingPhoto = false; uploaded = []; removed = []; uploadThrows = false; removeThrows = false; signedUrlThrows = false; createThrows = false;
}
async function routes() { return import("./route"); }
function required<T>(value: T | undefined): NonNullable<T> { if (value === undefined) throw new Error("Expected a route handler or response."); return value as NonNullable<T>; }
async function response<T>(value: Promise<T | undefined>): Promise<NonNullable<T>> { return required(await value); }
function bodyRequest(file: File, origin = "http://localhost:3000") {
  const data = new FormData(); data.set("sessionId", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"); data.set("attempt", "1"); data.set("file", file);
  return new Request("http://localhost:3000/api/portal/tester/test-photo", { method: "POST", headers: { origin }, body: data });
}
function deleteRequest() {
  return new Request("http://localhost:3000/api/portal/tester/test-photo", { method: "DELETE", headers: { origin: "http://localhost:3000", "content-type": "application/json" }, body: JSON.stringify({ sessionId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", attempt: 1 }) });
}
async function testImage(mime = "image/png") {
  const bytes = await sharp({ create: { width: 80, height: 60, channels: 3, background: "#3b6" } }).png().toBuffer();
  return new File([bytes], "../../untrusted.html", { type: mime });
}

test("uinnlogget, trener og mindreårig uten foresattesamtykke avvises før lagring", async () => {
  reset(); const POST = required((await routes()).POST);
  user = null; assert.equal((await response(POST(bodyRequest(await testImage())))).status, 401);
  user = { id: "coach-synthetic", role: "COACH", requiresGuardianConsent: false, guardianConsentGivenAt: null, dateOfBirth: new Date("1995-01-01") };
  assert.equal((await response(POST(bodyRequest(await testImage())))).status, 403);
  user = { id: "minor-synthetic", role: "PLAYER", requiresGuardianConsent: true, guardianConsentGivenAt: null };
  assert.equal((await response(POST(bodyRequest(await testImage())))).status, 403);
  assert.equal(uploaded.length, 0);
});

test("avviser andres økt før bildefil sendes til Storage", async () => {
  reset(); sessionAvailable = false; const POST = required((await routes()).POST);
  const result = await response(POST(bodyRequest(await testImage())));
  assert.equal(result.status, 409);
  assert.equal(uploaded.length, 0);
});

test("kryssopprinnelse og oversize multipart avvises før Storage", async () => {
  reset(); const POST = required((await routes()).POST);
  const crossOrigin = await response(POST(bodyRequest(await testImage(), "https://attacker.invalid")));
  assert.equal(crossOrigin.status, 403);
  const attackerOriginAndHost = new Request("https://attacker.invalid/api/portal/tester/test-photo", {
    method: "POST",
    headers: { origin: "https://attacker.invalid" },
    body: (() => { const data = new FormData(); data.set("sessionId", "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"); data.set("attempt", "1"); data.set("file", new File(["not an image"], "payload.jpg")); return data; })(),
  });
  assert.equal((await response(POST(attackerOriginAndHost))).status, 403);
  const largeBody = new ReadableStream<Uint8Array>({ start(controller) { controller.enqueue(new Uint8Array(3 * 1024 * 1024 + 64 * 1024 + 1)); } });
  const oversizedRequest = new Request("http://localhost:3000/api/portal/tester/test-photo", {
    method: "POST", headers: { origin: "http://localhost:3000", "content-type": "multipart/form-data; boundary=unused" }, body: largeBody,
    duplex: "half",
  } as RequestInit & { duplex: "half" });
  const oversized = await response(POST(oversizedRequest));
  assert.equal(oversized.status, 413);
  assert.equal(uploaded.length, 0);
});

test("bytes bestemmer filtype; gyldig bilde normaliseres og får en generert privat nøkkel", async () => {
  reset(); const POST = required((await routes()).POST);
  const result = await response(POST(bodyRequest(await testImage("text/html"))));
  assert.equal(result.status, 200);
  assert.equal(uploaded.length, 1);
  const savedUpload = uploaded[0]; assert.ok(savedUpload);
  assert.equal(savedUpload.contentType, "image/webp");
  assert.match(savedUpload.path, /^player-synthetic\/[a-f0-9-]+\/1\/[a-f0-9-]+\.webp$/);
  const stored = await sharp(savedUpload.bytes).metadata();
  assert.equal(stored.format, "webp");
  assert.equal(stored.exif, undefined);
  const json = await result.json() as { url: string };
  assert.match(json.url, /^https:\/\/private-storage\.invalid\//);
  assert.ok(!json.url.includes("../../untrusted.html"));
});

test("ugyldige bytes avvises og flere bilder per forsøk må slettes først", async () => {
  reset(); const POST = required((await routes()).POST);
  const invalid = await response(POST(bodyRequest(new File(["<html>not image</html>"], "bad.png", { type: "image/png" }))));
  assert.equal(invalid.status, 400); assert.equal(uploaded.length, 0);
  existingPhoto = true;
  const duplicate = await response(POST(bodyRequest(await testImage())));
  assert.equal(duplicate.status, 409); assert.equal(uploaded.length, 0);
});

test("bildet kan bare hentes og slettes på spillerens egen konto", async () => {
  reset(); existingPhoto = true; const GET = required((await routes()).GET); const DELETE = required((await routes()).DELETE);
  user = { id: "other-player", role: "PLAYER", requiresGuardianConsent: false, guardianConsentGivenAt: null, dateOfBirth: new Date("1995-01-01") };
  assert.equal((await response(GET(new Request("http://localhost:3000/api/portal/tester/test-photo?sessionId=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa&attempt=1")))).status, 404);
  const deleted = await response(DELETE(deleteRequest()));
  assert.equal(deleted.status, 404);
  assert.deepEqual(removed, []);

  user = { id: ownerId, role: "PLAYER", requiresGuardianConsent: false, guardianConsentGivenAt: null, dateOfBirth: new Date("1995-01-01") };
  const own = await response(GET(new Request("http://localhost:3000/api/portal/tester/test-photo?sessionId=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa&attempt=1")));
  assert.equal(own.status, 200);
  assert.match((await own.json() as { url: string }).url, /^https:\/\/private-storage\.invalid\//);
  const ownDeleted = await response(DELETE(deleteRequest()));
  assert.equal(ownDeleted.status, 200);
  assert.deepEqual(removed, [["player-synthetic/session/1/photo.webp"]]);
});

test("Storage-unntak returnerer trygg tjenestefeil", async () => {
  reset(); const POST = required((await routes()).POST);
  uploadThrows = true;
  const failed = await response(POST(bodyRequest(await testImage())));
  assert.equal(failed.status, 503);
  assert.deepEqual(await failed.json(), { error: "Bildet kunne ikke lagres akkurat nå." });
  assert.equal(uploaded.length, 0);

  existingPhoto = true; removeThrows = true;
  const DELETE = required((await routes()).DELETE);
  const removedResponse = await response(DELETE(deleteRequest()));
  assert.equal(removedResponse.status, 503);
  assert.deepEqual(await removedResponse.json(), { error: "Bildet kunne ikke slettes akkurat nå." });
});

test("mislykket signering eller metadataopprettelse rydder Storage uten å etterlate en indeks", async () => {
  reset(); const POST = required((await routes()).POST);
  signedUrlThrows = true;
  const signingFailed = await response(POST(bodyRequest(await testImage())));
  assert.equal(signingFailed.status, 503);
  assert.equal(existingPhoto, false);
  assert.equal(removed.length, 1);

  reset(); createThrows = true;
  const metadataFailed = await response(POST(bodyRequest(await testImage())));
  assert.equal(metadataFailed.status, 503);
  assert.equal(existingPhoto, false);
  assert.equal(removed.length, 1);
});
