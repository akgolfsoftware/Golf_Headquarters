import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";
import { MAX_RECORDING_PART_BYTES } from "./chunk-contract";
import { readRecordingChunkFragment, recordingChunkUploadConfirmed, recordingChunkUploadForms } from "./chunk-fragments";
import { tomChunkKo, uploadRecordingChunk, type RecordingChunkRad } from "@/lib/offline-queue/recording-chunk-queue";
import { byggChunkMeta } from "@/lib/offline-queue/recording-chunk-kladd";

afterEach(() => { mock.restoreAll(); });

test("7 MiB transport deler bytes og MIME, men beholder opptak og allerede reserverte indeks", async () => {
  const bytes = Uint8Array.from({ length: 7 * 1024 * 1024 }, (_, i) => i % 251);
  const original = new Blob([bytes], { type: "audio/mp4" });
  const upload = await recordingChunkUploadForms("rec", 7, original);
  assert.equal(upload.forms.length, 3);
  const parts: Blob[] = [];
  for (let i = 0; i < upload.forms.length; i++) {
    const form = upload.forms[i]; const part = form.get("chunk") as Blob;
    assert.equal(form.get("recordingId"), "rec"); assert.equal(form.get("chunkIdx"), "7");
    assert.equal(part.type, original.type); assert.ok(part.size <= MAX_RECORDING_PART_BYTES); parts.push(part);
    const fragment = readRecordingChunkFragment(form, part.size)!;
    assert.equal(fragment.fragmentIdx, i); assert.equal(fragment.fragmentCount, 3);
    assert.equal(fragment.wholeSize, original.size); assert.equal(fragment.wholeSHA256, upload.wholeSHA256);
  }
  assert.deepEqual(new Uint8Array(await new Blob(parts).arrayBuffer()), bytes);
});

test("fragmentmetadata krever alle felt og nøyaktig antall, størrelse og gyldig SHA", async () => {
  const original = new Blob([new Uint8Array(7 * 1024 * 1024)], { type: "audio/webm" });
  const upload = await recordingChunkUploadForms("rec", 0, original);
  const first = upload.forms[0];
  for (const [key, value] of [["fragmentIdx", "-1"], ["fragmentCount", "2"], ["wholeSize", "10485761"], ["wholeSHA256", "bad"]]) {
    const invalid = new FormData(); for (const [k, v] of first) invalid.append(k, v);
    invalid.set(key, value); assert.throws(() => readRecordingChunkFragment(invalid, MAX_RECORDING_PART_BYTES));
  }
  assert.throws(() => readRecordingChunkFragment(first, MAX_RECORDING_PART_BYTES - 1));
  const partial = new FormData(); partial.set("fragmentIdx", "0"); assert.throws(() => readRecordingChunkFragment(partial, 100));
  const ordinary = (await recordingChunkUploadForms("rec", 0, new Blob(["small"], { type: "audio/webm" }))).forms[0];
  assert.equal(readRecordingChunkFragment(ordinary, 5), null);
});

test("transport krever helkvittering med riktig opptak, indeks, størrelse og SHA", async () => {
  const blob = new Blob([new Uint8Array(7 * 1024 * 1024)], { type: "audio/webm" });
  const upload = await recordingChunkUploadForms("rec", 7, blob);
  let calls = 0;
  const fetchMock = mock.method(globalThis, "fetch", async (_url: RequestInfo | URL, init?: RequestInit) => {
    const form = init!.body as FormData; calls++;
    const last = form.get("fragmentIdx") === "2";
    return Response.json({ ok: true, recordingId: "rec", chunkIdx: 7, chunkComplete: last,
      ...(last ? { wholeSHA256: upload.wholeSHA256, wholeSize: blob.size } : {}) }, { status: last ? 200 : 202 });
  });
  assert.deepEqual(await uploadRecordingChunk("rec", 7, blob), { ok: true, chunkComplete: true }); assert.equal(calls, 3);
  fetchMock.mock.mockImplementation(async () => Response.json({ ok: true, recordingId: "rec", chunkIdx: 7, chunkComplete: false }, { status: 202 }));
  assert.deepEqual(await uploadRecordingChunk("rec", 7, blob), { ok: false, chunkComplete: false });
  fetchMock.mock.mockImplementation(async () => Response.json({ ok: true, recordingId: "rec", chunkIdx: 7, chunkComplete: true, wholeSHA256: "wrong", wholeSize: blob.size }));
  assert.deepEqual(await uploadRecordingChunk("rec", 7, blob), { ok: false, chunkComplete: false });
  fetchMock.mock.mockImplementation(async () => Response.json({ ok: true }));
  assert.deepEqual(await uploadRecordingChunk("rec", 7, blob), { ok: false, chunkComplete: false });
});

function installQueue(rows: Map<string, RecordingChunkRad>) {
  const original = Object.getOwnPropertyDescriptor(globalThis, "indexedDB");
  const factory = { open: () => {
    const openRequest = { result: {
      close: () => {}, objectStoreNames: { contains: () => true },
      transaction: () => {
        const tx: { oncomplete?: () => void; objectStore: () => object } = { objectStore: () => {
          const request = (operation: () => unknown) => {
            const req: { result?: unknown; onsuccess?: () => void } = {};
            queueMicrotask(() => { req.result = operation(); req.onsuccess?.(); tx.oncomplete?.(); }); return req;
          };
          return { getAll: () => request(() => [...rows.values()]),
            put: (row: RecordingChunkRad) => request(() => { rows.set(row.key, row); return row.key; }),
            delete: (key: string) => request(() => { rows.delete(key); }) };
        } }; return tx;
      },
    }, onsuccess: undefined as (() => void) | undefined };
    queueMicrotask(() => openRequest.onsuccess?.()); return openRequest;
  } };
  Object.defineProperty(globalThis, "indexedDB", { configurable: true, value: factory });
  return () => {
    if (original) Object.defineProperty(globalThis, "indexedDB", original);
    else Reflect.deleteProperty(globalThis, "indexedDB");
  };
}

test("køen beholder originalblob etter delkvittering og fjerner den bare etter bekreftet hel chunk", async () => {
  const row = { ...byggChunkMeta("coach", "rec", 7, new Date()), dataBase64: Buffer.from("original bytes").toString("base64"), mimeType: "audio/mp4" };
  const foreign = { ...byggChunkMeta("other-coach", "rec", 8, new Date()), dataBase64: "eA==", mimeType: "audio/mp4" };
  const rows = new Map([[row.key, row], [foreign.key, foreign]]); const restore = installQueue(rows);
  try {
    for (const response of [{ ok: true }, { ok: true, chunkComplete: false }, { ok: false, chunkComplete: true }]) {
      assert.equal(recordingChunkUploadConfirmed(response), false);
      assert.equal((await tomChunkKo("coach", "rec", async () => response)).gjenstaar, 1);
      assert.ok(rows.has(row.key)); assert.equal(rows.get(row.key)?.dataBase64, row.dataBase64);
    }
    assert.equal((await tomChunkKo("coach", "rec", async (id, idx, blob) => {
      assert.equal(id, "rec"); assert.equal(idx, 7); assert.equal(blob.type, "audio/mp4"); assert.equal(await blob.text(), "original bytes");
      return { ok: true, chunkComplete: true };
    })).gjenstaar, 0);
    assert.ok(!rows.has(row.key)); assert.ok(rows.has(foreign.key));
  } finally { restore(); }
});
