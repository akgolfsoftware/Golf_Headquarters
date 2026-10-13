import assert from "node:assert/strict";
import { before, beforeEach, mock, test } from "node:test";
import { checkedRecordingAudioPath, recordingFragmentFolder, recordingStoragePrefix } from "@/lib/recording/fragment-cleanup-contract";

type Row = { id: string; uploadedById: string; retentionUntil: Date | null; audioUrl: string | null; chunks: { path: string }[];
  transcript: string; aiAnalysis: object };
let rows: Row[] = [];
let listings = new Map<string, { name: string }[]>();
let listCalls: { prefix: string; offset: number }[] = [];
let removeCalls: string[][] = [];
let databaseQueries = 0, databaseWrites = 0, audits = 0;
let listingFails: string | null = null, removeFails = false;
mock.module("@/lib/agents/agent-runner", { namedExports: { runAgent: async (_name: string, _user: null, callback: () => Promise<unknown>) => callback() } });
mock.module("@/lib/audit", { namedExports: { audit: async () => { audits++; } } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => {} } });
mock.module("@/lib/prisma", { namedExports: { prisma: { sessionRecording: {
  findMany: async (args: { where: { retentionUntil: { lt: Date }; id?: { gt: string }; audioUrl?: object }; take: number; orderBy: { id: string } }) => {
    databaseQueries++; assert.equal(args.where.audioUrl, undefined); assert.equal(args.orderBy.id, "asc");
    return rows.filter(row => row.retentionUntil && row.retentionUntil < args.where.retentionUntil.lt
      && (!args.where.id || row.id > args.where.id.gt)).toSorted((a, b) => a.id.localeCompare(b.id)).slice(0, args.take);
  },
  update: async (args: { where: { id: string }; data: { audioUrl: null; chunks: [] } }) => {
    databaseWrites++; assert.deepEqual(Object.keys(args.data).sort(), ["audioUrl", "chunks"]);
    const row = rows.find(row => row.id === args.where.id)!; Object.assign(row, args.data); return row;
  },
} } } });
mock.module("@/lib/supabase/admin", { namedExports: { supabaseAdmin: () => ({ storage: { from: (bucket: string) => {
  assert.equal(bucket, "coaching-recordings");
  return {
    list: async (prefix: string, options: { limit: number; offset: number; sortBy: object }) => {
      listCalls.push({ prefix, offset: options.offset }); assert.equal(options.limit, 1000);
      if (prefix === listingFails) return { data: null, error: new Error("synthetic listing failure") };
      return { data: (listings.get(prefix) ?? []).slice(options.offset, options.offset + options.limit), error: null };
    },
    remove: async (paths: string[]) => { removeCalls.push(paths); return { error: removeFails ? new Error("synthetic remove failure") : null }; },
  };
} } }) } });
let runCleanupRecordings: typeof import("./cleanup-recordings").runCleanupRecordings;
before(async () => { ({ runCleanupRecordings } = await import("./cleanup-recordings")); });
beforeEach(() => {
  rows = []; listings = new Map(); listCalls = []; removeCalls = [];
  databaseQueries = databaseWrites = audits = 0; listingFails = null; removeFails = false;
});
const folder = `chunk-00007-${"a".repeat(64)}-${7 * 1024 * 1024}-3.webm`;
function expired(id = "rec"): Row {
  return { id, uploadedById: "coach", retentionUntil: new Date("2020-01-01"), audioUrl: null, chunks: [],
    transcript: "behold transkript", aiAnalysis: { behold: true } };
}
function fragments(prefix = "coach/rec") {
  listings.set(prefix, [{ name: "fragments" }]);
  listings.set(`${prefix}/fragments`, [{ name: folder }]);
  listings.set(`${prefix}/fragments/${folder}`, [{ name: "part-0.webm" }, { name: "part-2.webm" }]);
}

test("utløpte partialfragmenter uten audioUrl eller ledger slettes og transkript/AI beholdes", async () => {
  const row = expired(); rows = [row]; fragments();
  const result = await runCleanupRecordings();
  assert.deepEqual(removeCalls.flat(), [`coach/rec/fragments/${folder}/part-0.webm`, `coach/rec/fragments/${folder}/part-2.webm`]);
  assert.equal(row.transcript, "behold transkript"); assert.deepEqual(row.aiAnalysis, { behold: true });
  assert.equal(row.retentionUntil?.toISOString(), "2020-01-01T00:00:00.000Z");
  assert.deepEqual(result.output, { totalt: 1, slettet: 1, feilet: 0, oversett: 0, filerSlettet: 2, feilDetaljer: [] });
});

test("abortchunks, foreldreløs canonical lyd og finalfil ryddes bare innen eget opptak", async () => {
  const row = expired(); row.audioUrl = "coach/rec/final-123.webm"; row.chunks = [{ path: "coach/rec/chunk-00000.webm" }]; rows = [row];
  listings.set("coach/rec", [{ name: "chunk-00000.webm" }, { name: "chunk-00001.m4a" }, { name: "final-123.webm" }]);
  await runCleanupRecordings();
  assert.deepEqual(new Set(removeCalls.flat()), new Set(["coach/rec/final-123.webm", "coach/rec/chunk-00000.webm", "coach/rec/chunk-00001.m4a"]));
  assert.equal(row.audioUrl, null); assert.deepEqual(row.chunks, []); assert.equal(databaseWrites, 1); assert.equal(audits, 1);
});

test("opptak før retention-fristen og uten frist røres ikke", async () => {
  rows = [{ ...expired(), retentionUntil: new Date(Date.now() + 86400000) }, { ...expired("without-deadline"), retentionUntil: null }];
  fragments(); const result = await runCleanupRecordings();
  assert.equal(listCalls.length, 0); assert.equal(removeCalls.length, 0); assert.equal(databaseWrites, 0);
  assert.deepEqual(result.output, { totalt: 0, slettet: 0, feilet: 0, oversett: 0, filerSlettet: 0, feilDetaljer: [] });
});

test("listingfeil på fragmenter starter ingen sletting og beholder ledger for retry", async () => {
  const row = expired(); row.chunks = [{ path: "coach/rec/chunk-00000.webm" }]; rows = [row]; fragments();
  listingFails = `coach/rec/fragments/${folder}`;
  const result = await runCleanupRecordings(); assert.equal(removeCalls.length, 0); assert.equal(databaseWrites, 0);
  assert.deepEqual(row.chunks, [{ path: "coach/rec/chunk-00000.webm" }]);
  assert.deepEqual(result.output, { totalt: 1, slettet: 0, feilet: 1, oversett: 0, filerSlettet: 0,
    feilDetaljer: [{ id: "rec", feil: "Kunne ikke liste opptakets lydfiler" }] });
  listingFails = null; await runCleanupRecordings(); assert.equal(databaseWrites, 1);
});

test("removefeil beholder lydhenvisninger og gir en prøvbar feilkvittering", async () => {
  const row = expired(); row.audioUrl = "coach/rec/final.webm"; rows = [row]; fragments(); removeFails = true;
  const result = await runCleanupRecordings(); assert.equal(databaseWrites, 0); assert.equal(audits, 0); assert.equal(row.audioUrl, "coach/rec/final.webm");
  assert.deepEqual(result.output, { totalt: 1, slettet: 0, feilet: 1, oversett: 0, filerSlettet: 0,
    feilDetaljer: [{ id: "rec", feil: "Kunne ikke fjerne opptakets lydfiler" }] });
});

test("fremmede referanser og manipulerte listnavn gir aldri sletting av fremmede filer", async () => {
  const row = expired(); row.audioUrl = "other-coach/rec/final.webm"; rows = [row];
  await runCleanupRecordings(); assert.equal(listCalls.length, 0); assert.equal(removeCalls.length, 0); assert.equal(databaseWrites, 0);
  row.audioUrl = null; fragments();
  listings.get("coach/rec")!.push({ name: "../other/final.webm" }, { name: "other/rec/chunk-00000.webm" });
  listings.get("coach/rec/fragments")!.push({ name: `${folder}/../../other` }, { name: "chunk-99999-invalid-1-4.webm" });
  listings.get(`coach/rec/fragments/${folder}`)!.push({ name: "part-3.webm" }, { name: "part-0.m4a" }, { name: "../part-0.webm" });
  await runCleanupRecordings();
  assert.equal(removeCalls.flat().length, 2); assert.ok(removeCalls.flat().every(path => path.startsWith(`coach/rec/fragments/${folder}/part-`)));
  assert.throws(() => recordingStoragePrefix("coach/other", "rec")); assert.throws(() => checkedRecordingAudioPath("coach/rec", "coach/rec/../other/final.webm"));
  assert.equal(recordingFragmentFolder(folder.replace("-3.webm", "-4.webm")), null);
});

test("alle lagringssider listes før sletting, også fragmentmapper og fragmentdeler", async () => {
  rows = [expired()];
  const junk = Array.from({ length: 1000 }, (_, i) => ({ name: `unrelated-${i}` }));
  listings.set("coach/rec", [...junk, { name: "fragments" }]);
  listings.set("coach/rec/fragments", [...junk, { name: folder }]);
  listings.set(`coach/rec/fragments/${folder}`, [...junk, { name: "part-2.webm" }]);
  await runCleanupRecordings();
  assert.deepEqual(listCalls, ["coach/rec", "coach/rec/fragments", `coach/rec/fragments/${folder}`].flatMap(prefix => [{ prefix, offset: 0 }, { prefix, offset: 1000 }]));
  assert.deepEqual(removeCalls.flat(), [`coach/rec/fragments/${folder}/part-2.webm`]);
});

test("databasepaginering går forbi allerede ryddede opptak til senere partialfragmenter", async () => {
  rows = Array.from({ length: 101 }, (_, i) => expired(`rec-${String(i).padStart(3, "0")}`));
  fragments("coach/rec-100"); const result = await runCleanupRecordings(); assert.equal(databaseQueries, 2);
  assert.deepEqual(result.output, { totalt: 101, slettet: 1, feilet: 0, oversett: 100, filerSlettet: 2, feilDetaljer: [] });
});
