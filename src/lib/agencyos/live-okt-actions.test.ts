/** Eksporterte handlinger: roller, input, samtidige felt og feilbevaring. */
import assert from "node:assert/strict";
import { before, mock, test } from "node:test";
import type { Prisma } from "@/generated/prisma/client";

let bruker: { id: string; role: string } | null;
let sesjonCoachId: string;
let summary: Record<string, unknown>;
let notes: string;
let skrevet: number;
let failWrite: boolean;
let invalidert: number;

mock.module("next/cache", { namedExports: { revalidatePath: () => { invalidert++; } } });
mock.module("@/lib/error-tracking", { namedExports: { logError: async () => undefined } });
mock.module("@/lib/auth/getCurrentUser", { namedExports: { getCurrentUser: async () => bruker } });
// Simulerer databasegrensen; selve SQL-en prøves separat i isolert PGlite.
mock.module("@/lib/prisma", { namedExports: { prisma: {
  $executeRaw: async (query: Prisma.Sql) => {
    if (failWrite) throw new Error("syntetisk skrivefeil");
    const parameter = (pattern: RegExp) => {
      const match = query.text.match(pattern);
      return match ? query.values[Number(match[1]) - 1] : undefined;
    };
    const id = parameter(/WHERE "id" = \$(\d+)/);
    const coach = parameter(/AND "coachId" = \$(\d+)/);
    if (id !== "okt-1" || (coach !== undefined && coach !== sesjonCoachId)) return 0;
    const value = JSON.parse(String(query.values[0]));
    summary = query.text.includes("jsonb_build_object('coachMessages'")
      ? { ...summary, coachMessages: [...(Array.isArray(summary.coachMessages) ? summary.coachMessages : []), ...value] }
      : { ...summary, ...value };
    const note = parameter(/"notes" = \$(\d+)/);
    if (note !== undefined) notes = String(note);
    skrevet++;
    return 1;
  },
} } });

let actions: typeof import("./live-okt-actions");
before(async () => { actions = await import("./live-okt-actions"); });
test.beforeEach(() => {
  bruker = { id: "coach-a", role: "COACH" };
  sesjonCoachId = "coach-a";
  summary = { liveSummary: { durationSec: 600 }, dineOrd: { tekst: "Spillerens notat" } };
  notes = "Tidligere notat";
  skrevet = 0;
  invalidert = 0;
  failWrite = false;
});
const calls = () => [
  actions.sendLiveMelding("okt-1", "Rytme"),
  actions.sendBriefTilSpiller("okt-1", "Startlinje"),
  actions.lagreCoachVurdering("okt-1", 4, "Nytt notat"),
];

test("alle handlinger avviser uinnlogget, spiller og forelder uten skriving", async () => {
  for (const role of [null, "PLAYER", "PARENT"]) {
    bruker = role ? { id: "annen-bruker", role } : null;
    for (const result of await Promise.all(calls())) assert.deepEqual(result, { ok: false, error: "Ikke tilgang" });
  }
  assert.equal(skrevet, 0);
  assert.equal(invalidert, 0);
});
test("coach uten eierskap avvises av samme skriveoperasjon", async () => {
  sesjonCoachId = "annen-coach";
  for (const result of await Promise.all(calls())) assert.deepEqual(result, { ok: false, error: "Økt ikke funnet" });
  assert.equal(skrevet, 0);
  assert.equal(invalidert, 0);
});
test("administrator beholder eksisterende tilgang til annen coachs økt", async () => {
  bruker = { id: "admin", role: "ADMIN" };
  sesjonCoachId = "annen-coach";
  assert((await Promise.all(calls())).every(result => result.ok));
  assert.equal(skrevet, 3);
  assert.equal(summary.coachRatedById, "admin");
});
test("samtidige meldinger, brief og vurdering beholder alle felt", async () => {
  summary.coachMessages = [{ content: "Tidligere melding" }];
  const results = await Promise.all([...calls(), actions.sendLiveMelding("okt-1", "Balanse")]);
  assert(results.every(result => result.ok));
  assert.deepEqual(summary.liveSummary, { durationSec: 600 });
  assert.deepEqual(summary.dineOrd, { tekst: "Spillerens notat" });
  assert.deepEqual((summary.coachMessages as Array<{ content: string }>).map(x => x.content), ["Tidligere melding", "Rytme", "Balanse"]);
  assert.equal((summary.coachBrief as { melding: string }).melding, "Startlinje");
  assert.equal(summary.coachRating, 4);
  assert.equal(summary.coachRatedById, "coach-a");
  assert.equal(notes, "Nytt notat");
  assert.equal(skrevet, 4);
});
test("blankt vurderingsnotat beholder eksisterende notes", async () => {
  assert.equal((await actions.lagreCoachVurdering("okt-1", 5, "   ")).ok, true);
  assert.equal(notes, "Tidligere notat");
});
test("tom melding, tom brief og ugyldig vurdering lagres ikke", async () => {
  assert.equal((await actions.sendLiveMelding("okt-1", "   ")).ok, false);
  assert.equal((await actions.sendBriefTilSpiller("okt-1", "\n\t")).ok, false);
  for (const rating of [0, 6, 1.5, NaN]) assert.equal((await actions.lagreCoachVurdering("okt-1", rating, "")).ok, false);
  assert.equal(skrevet, 0);
});
test("meldinger trimmes før de lagres", async () => {
  await actions.sendLiveMelding("okt-1", "  Rytme  ");
  assert.equal((summary.coachMessages as Array<{ content: string }>)[0].content, "Rytme");
});
test("databasefeil gir feilstatus og ingen falsk bekreftelse", async () => {
  failWrite = true;
  const before = structuredClone(summary);
  assert((await Promise.all(calls())).every(result => !result.ok));
  assert.deepEqual(summary, before);
  assert.equal(skrevet, 0);
  assert.equal(invalidert, 0);
});
test("ukjent økt avvises uten oppretting", async () => {
  assert.deepEqual(await actions.sendLiveMelding("ukjent", "Hei"), { ok: false, error: "Økt ikke funnet" });
  assert.equal(skrevet, 0);
});
