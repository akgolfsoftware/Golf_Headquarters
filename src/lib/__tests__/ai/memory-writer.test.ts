// Tester for memory-writer: idempotens og skjema-validering.
// Følger repoets t.mock.module-mønster (ETT import av modul-under-test per fil,
// mutérbar mock-tilstand for flere scenarioer).
import { test } from "node:test";
import assert from "node:assert/strict";

// Mutérbar mock-tilstand
let eksisterendeMinner = 0;
let thread: { messages: unknown } | null = null;
let skrevet: unknown[] = [];
let aiSvar = "";

test("memory-writer", async (t) => {
  t.mock.module("@/lib/prisma", {
    namedExports: {
      prisma: {
        aiMemory: { count: async () => eksisterendeMinner },
        coachingSession: { findUnique: async () => thread },
      },
    },
  });
  t.mock.module("@/lib/ai/client", {
    namedExports: {
      AI_MODEL: "test-modell",
      isAiEnabled: () => true,
      anthropic: {
        messages: {
          create: async () => ({ content: [{ type: "text", text: aiSvar }] }),
        },
      },
    },
  });
  t.mock.module("@/lib/ai/memory-store", {
    namedExports: {
      writeMemories: async (entries: unknown[]) => {
        skrevet.push(...entries);
        return entries.length;
      },
    },
  });

  const { summarizeSessionToMemories } = await import("@/lib/ai/memory-writer");

  await t.test("idempotent: hopper over allerede oppsummert økt", async () => {
    eksisterendeMinner = 1;
    const res = await summarizeSessionToMemories({ userId: "u1", sessionId: "s1" });
    assert.deepEqual(res, { written: 0, skipped: "already-summarized" });
    assert.equal(skrevet.length, 0);
  });

  await t.test("gyldig LLM-svar → minner skrives med provenans", async () => {
    eksisterendeMinner = 0;
    thread = {
      messages: [
        { role: "user", content: "Sliter med startlinjen på 7-jern", ts: "t" },
        { role: "assistant", content: "Hva tror du selv om utgangsposisjonen?", ts: "t" },
      ],
    };
    aiSvar = '{"minner":[{"innhold":"Spilleren jobbet med startlinje på 7-jern og responderte godt på selvevaluering.","kind":"EPISODIC"}]}';
    const res = await summarizeSessionToMemories({
      userId: "u1",
      sessionId: "s2",
      spillerVurdering: { kvalitet: 4, nesteFokus: "startlinje" },
    });
    assert.equal(res.written, 1);
    const første = skrevet[0] as { sourceType: string; sourceId: string; kind: string };
    assert.equal(første.sourceType, "coaching-session");
    assert.equal(første.sourceId, "s2");
    assert.equal(første.kind, "EPISODIC");
  });

  await t.test("ugyldig skjema fra LLM → ingenting skrives", async () => {
    skrevet = [];
    eksisterendeMinner = 0;
    aiSvar = '{"minner":[{"innhold":"x","kind":"FEIL"}]}';
    const res = await summarizeSessionToMemories({ userId: "u1", sessionId: "s3" });
    assert.equal(res.written, 0);
    assert.equal(res.skipped, "invalid-schema");
    assert.equal(skrevet.length, 0);
  });
});
