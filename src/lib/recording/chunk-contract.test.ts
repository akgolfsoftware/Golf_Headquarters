import test from "node:test";
import assert from "node:assert/strict";
import { checkedRecordingChunks, chooseRecordingMime, hasAudioHeader, recordingElapsedMs } from "./chunk-contract";
const chunk = (idx: number) => ({ idx, path: `owner/recording/chunk-${String(idx).padStart(5, "0")}.webm`, size: 100 });
test("manglende lydbit, duplikat, ukjent hale eller fremmed sti kan ikke fullføres", () => {
  assert.equal(checkedRecordingChunks([chunk(0), chunk(2)], "owner", "recording", 3), null);
  assert.equal(checkedRecordingChunks([chunk(0), chunk(0)], "owner", "recording", 2), null);
  assert.equal(checkedRecordingChunks([chunk(0)], "owner", "recording", 2), null);
  assert.equal(checkedRecordingChunks([chunk(0)], "annen", "recording", 1), null);
  assert.equal(checkedRecordingChunks([chunk(0), { ...chunk(1), size: -1 }], "owner", "recording"), null);
  assert.equal(checkedRecordingChunks([chunk(1), chunk(0)], "owner", "recording", 2)?.length, 2);
});
test("opptaksformat velges etter faktisk nettleserstøtte og første filhode kontrolleres", () => {
  assert.equal(chooseRecordingMime(mime => mime === "audio/mp4"), "audio/mp4");
  assert.equal(chooseRecordingMime(() => false), null);
  assert.equal(hasAudioHeader(new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]), "audio/webm"), true);
  assert.equal(hasAudioHeader(new Uint8Array(12), "audio/mp4"), false);
  const mp4 = new Uint8Array([0, 0, 0, 12, 102, 116, 121, 112, 77, 52, 65, 32]);
  assert.equal(hasAudioHeader(mp4, "audio/mp4"), true);
  assert.equal(hasAudioHeader(mp4, "audio/webm"), false);
});
test("pausetid inngår ikke etter gjenopptaking", () => {
  assert.equal(recordingElapsedMs(15000, null, 100000), 15000);
  assert.equal(recordingElapsedMs(15000, 100000, 102000), 17000);
  assert.equal(recordingElapsedMs(15000, 102000, 100000), 15000);
});
