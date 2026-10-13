import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import { createHash } from "node:crypto";
import { recordingChunkUploadForms } from "@/lib/recording/chunk-fragments";
import type { RecordingChunk } from "@/lib/recording/chunk-contract";

let viewer: { id: string; role: string } | null;
let consent: boolean[];
let accessible = true;
let recording: { id: string; uploadedById: string; playerId: string; status: string; chunks: RecordingChunk[] };
let objects: Map<string, Blob>;
let ledgerWrites = 0, canonicalWrites = 0, storageWrites = 0;
let lockHeld = false, failLedger = false, failUpload = false, revokeOnCanonical = false;
let removed: string[] = [];
let transactionTail = Promise.resolve();
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => viewer } });
mock.module("@/lib/auth/coached", { namedExports: { harCoachTilgangTilSpiller: async () => accessible } });
mock.module("@/lib/recording/lyd-samtykke", { namedExports: { hentLydSamtykkeStatus: async () => ({ tillatt: consent.length > 1 ? consent.shift() : consent[0] }) } });
mock.module("@/lib/rate-limit", { namedExports: { rateLimit: async () => ({ ok: true }) } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => {} } });
mock.module("@/generated/prisma/client", { namedExports: { Prisma: { sql: (strings: TemplateStringsArray, ...values: unknown[]) => ({ text: strings.join("?"), values }) } } });
const database = {
  findUnique: async () => structuredClone(recording),
  update: async (args: { where: { id: string }; data: { chunks: RecordingChunk[] } }) => {
    assert.ok(lockHeld); assert.equal(args.where.id, "rec");
    if (failLedger) throw new Error("synthetic write failure");
    ledgerWrites++; recording.chunks = args.data.chunks; return recording;
  },
};
mock.module("@/lib/prisma", { namedExports: { prisma: {
  sessionRecording: database,
  $transaction: async (callback: (tx: object) => Promise<unknown>) => {
    const previous = transactionTail; let release = () => {};
    transactionTail = new Promise<void>(resolve => { release = resolve; });
    await previous;
    try { return await callback({ sessionRecording: database, $queryRaw: async (sql: { text: string; values: unknown[] }) => {
      assert.match(sql.text, /FOR UPDATE/); assert.deepEqual(sql.values, ["rec"]); lockHeld = true;
    } }); }
    finally { lockHeld = false; release(); }
  },
} } });
mock.module("@/lib/supabase/admin", { namedExports: { supabaseAdmin: () => ({ storage: { from: (bucket: string) => {
  assert.equal(bucket, "coaching-recordings");
  return {
    upload: async (path: string, bytes: Buffer, options: { contentType: string }) => {
      assert.ok(lockHeld); assert.match(path, /^coach\/rec\//); storageWrites++;
      if (failUpload) return { error: new Error("synthetic upload failure") };
      if (!path.includes("/fragments/")) canonicalWrites++;
      if (revokeOnCanonical && !path.includes("/fragments/")) consent = [false];
      objects.set(path, new Blob([Uint8Array.from(bytes)], { type: options.contentType })); return { error: null };
    },
    download: async (path: string) => {
      assert.ok(lockHeld); assert.match(path, /^coach\/rec\//);
      return objects.has(path) ? { data: objects.get(path), error: null } : { data: null, error: new Error("not found") };
    },
    remove: async (paths: string[]) => {
      assert.ok(lockHeld);
      for (const path of paths) { assert.match(path, /^coach\/rec\/fragments\//); objects.delete(path); removed.push(path); }
      return { error: null };
    },
  };
} } }) } });
let POST: typeof import("./route").POST;
before(async () => { ({ POST } = await import("./route")); });
beforeEach(() => {
  viewer = { id: "coach", role: "COACH" }; consent = [true]; accessible = true;
  recording = { id: "rec", uploadedById: "coach", playerId: "player", status: "RECORDING", chunks: [] };
  objects = new Map(); ledgerWrites = canonicalWrites = storageWrites = 0; removed = [];
  lockHeld = failLedger = failUpload = revokeOnCanonical = false; transactionTail = Promise.resolve();
});
const request = (form: FormData) => new Request("http://127.0.0.1:3300/api/recording/upload-chunk", { method: "POST", body: form });
function audio(size = 7 * 1024 * 1024) {
  const bytes = Uint8Array.from({ length: size }, (_, i) => i % 251);
  bytes.set([0x1a, 0x45, 0xdf, 0xa3]); return new Blob([bytes], { type: "audio/webm;codecs=opus" });
}

test("7 MiB i tre fragmenter lagres byteidentisk som én original chunk etter helbekreftelse", async () => {
  const original = audio(); const upload = await recordingChunkUploadForms("rec", 0, original);
  assert.equal(upload.forms.length, 3);
  for (let i = 0; i < 3; i++) {
    const response = await POST(request(upload.forms[i])); const body = await response.json();
    assert.equal(response.status, i === 2 ? 200 : 202); assert.equal(body.chunkComplete, i === 2);
    if (i < 2) { assert.equal(ledgerWrites, 0); assert.equal(canonicalWrites, 0); }
    else { assert.equal(body.wholeSize, original.size); assert.equal(body.wholeSHA256, upload.wholeSHA256); }
  }
  assert.equal(recording.chunks.length, 1); assert.equal(recording.chunks[0].idx, 0); assert.equal(ledgerWrites, 1);
  const stored = objects.get("coach/rec/chunk-00000.webm")!;
  assert.equal(stored.type, "audio/webm");
  assert.deepEqual(new Uint8Array(await stored.arrayBuffer()), new Uint8Array(await original.arrayBuffer()));
  assert.equal(removed.length, 3); assert.equal(objects.size, 1);
});

test("manglende fragment og endrede bytes gir ingen canonical chunk eller ledger", async () => {
  const upload = await recordingChunkUploadForms("rec", 0, audio());
  await POST(request(upload.forms[0]));
  const response = await POST(request(upload.forms[2]));
  assert.equal(response.status, 202); assert.equal((await response.json()).chunkComplete, false);
  const firstPath = [...objects.keys()].find(path => path.endsWith("part-0.webm"))!;
  const firstBytes = new Uint8Array(await objects.get(firstPath)!.arrayBuffer()); firstBytes[100] ^= 1;
  objects.set(firstPath, new Blob([firstBytes], { type: "audio/webm" }));
  const tampered = await POST(request(upload.forms[1]));
  assert.equal(tampered.status, 409); assert.equal((await tampered.json()).chunkComplete, false);
  assert.equal(canonicalWrites, 0); assert.equal(ledgerWrites, 0); assert.equal(recording.chunks.length, 0);
});

test("parallelle retry og mistet siste svar bevarer én chunk og opprinnelige indekser", async () => {
  const first = audio(100); await POST(request((await recordingChunkUploadForms("rec", 0, first)).forms[0]));
  const original = audio(); const upload = await recordingChunkUploadForms("rec", 1, original);
  await POST(request(upload.forms[0])); await POST(request(upload.forms[1]));
  const responses = await Promise.all([POST(request(upload.forms[2])), POST(request(upload.forms[2]))]);
  assert.ok((await Promise.all(responses.map(res => res.json()))).every(body => body.chunkComplete === true));
  const retry = await POST(request(upload.forms[0])); assert.equal((await retry.json()).chunkComplete, true);
  assert.deepEqual(recording.chunks.map(chunk => chunk.idx), [0, 1]); assert.equal(ledgerWrites, 2); assert.equal(canonicalWrites, 2);
});

test("fremmed bruker, trukket samtykke og ferdig status skriver ingen fragmenter", async () => {
  const form = (await recordingChunkUploadForms("rec", 0, audio())).forms[0];
  viewer = { id: "fremmed-coach", role: "COACH" }; assert.equal((await POST(request(form))).status, 403);
  viewer = { id: "coach", role: "COACH" }; consent = [true, false]; assert.equal((await POST(request(form))).status, 403);
  consent = [true]; recording.status = "PROCESSING"; assert.equal((await POST(request(form))).status, 409);
  recording.status = "ABORTED"; assert.equal((await POST(request(form))).status, 409);
  recording.status = "RECORDING"; accessible = false; assert.equal((await POST(request(form))).status, 403);
  assert.equal(storageWrites, 0); assert.equal(ledgerWrites, 0);
});

test("uvaliderte fragmentfelt og falskt første filhode kan ikke gi helbekreftelse", async () => {
  const upload = await recordingChunkUploadForms("rec", 0, audio());
  const wrongCount = new FormData(); for (const [key, value] of upload.forms[0]) wrongCount.append(key, value);
  wrongCount.set("fragmentCount", "99"); assert.equal((await POST(request(wrongCount))).status, 400); assert.equal(storageWrites, 0);
  const bytes = new Uint8Array(await audio().arrayBuffer()); bytes.set([0, 0, 0, 0]);
  const invalidHeader = await recordingChunkUploadForms("rec", 0, new Blob([bytes], { type: "audio/webm" }));
  let status = 0;
  for (const form of invalidHeader.forms) status = (await POST(request(form))).status;
  assert.equal(status, 415); assert.equal(ledgerWrites, 0); assert.equal(canonicalWrites, 0);
});

test("manglende ledgerkvittering kan prøves igjen uten å miste de lagrede bytes", async () => {
  const upload = await recordingChunkUploadForms("rec", 0, audio());
  await POST(request(upload.forms[0])); await POST(request(upload.forms[1])); failLedger = true;
  assert.equal((await POST(request(upload.forms[2]))).status, 500); assert.equal(recording.chunks.length, 0);
  assert.equal(removed.length, 0); failLedger = false;
  const retry = await POST(request(upload.forms[2])); assert.equal((await retry.json()).chunkComplete, true);
  assert.equal(recording.chunks.length, 1); assert.equal(ledgerWrites, 1);
  assert.equal(createHash("sha256").update(Buffer.from(await objects.get("coach/rec/chunk-00000.webm")!.arrayBuffer())).digest("hex"), upload.wholeSHA256);
});

test("vanlig multipart bevarer tidligere oppførsel og svarer med eksplisitt helkvittering", async () => {
  const original = audio(100); const upload = await recordingChunkUploadForms("rec", 0, original);
  const response = await POST(request(upload.forms[0])); assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true, recordingId: "rec", chunkIdx: 0, chunkComplete: true,
    wholeSHA256: upload.wholeSHA256, wholeSize: original.size });
  const duplicate = await POST(request(upload.forms[0])); assert.equal((await duplicate.json()).chunkComplete, true);
  assert.equal(ledgerWrites, 1); assert.equal(storageWrites, 1);
});

test("samtykke trukket under sammensetting eller siste lagring gir aldri helkvittering", async () => {
  const upload = await recordingChunkUploadForms("rec", 0, audio());
  await POST(request(upload.forms[0])); await POST(request(upload.forms[1]));
  consent = [true, true, false];
  const withdrawn = await POST(request(upload.forms[2])); assert.equal(withdrawn.status, 403);
  assert.equal((await withdrawn.json()).chunkComplete, false); assert.equal(canonicalWrites, 0); assert.equal(ledgerWrites, 0);
  consent = [true]; revokeOnCanonical = true;
  const duringUpload = await POST(request(upload.forms[2])); assert.equal(duringUpload.status, 403);
  assert.equal((await duringUpload.json()).chunkComplete, false); assert.equal(ledgerWrites, 0); assert.equal(removed.length, 0);
});

test("eldre serverlagret chunk uten SHA bekreftes med samme sti og indeks uten ny lydskriving", async () => {
  const original = audio(); const path = "coach/rec/chunk-00000.webm";
  recording.chunks = [{ idx: 0, path, size: original.size }]; objects.set(path, original);
  const upload = await recordingChunkUploadForms("rec", 0, original);
  const response = await POST(request(upload.forms[0]));
  assert.equal(response.status, 200); assert.equal((await response.json()).chunkComplete, true);
  assert.equal(storageWrites, 0); assert.equal(ledgerWrites, 1);
  assert.deepEqual(recording.chunks, [{ idx: 0, path, size: original.size, mimeType: "audio/webm", sha256: upload.wholeSHA256 }]);
  assert.equal(objects.get(path), original);
});
