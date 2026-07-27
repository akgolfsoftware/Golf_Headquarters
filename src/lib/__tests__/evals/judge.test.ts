// Tester for LLM-dommeren — mock av Anthropic-klienten (t.mock.module,
// ETT import av modul-under-test, mutérbar mock-tilstand).
import { test } from "node:test";
import assert from "node:assert/strict";

let aiSvar = "";
let aiEnabled = true;

test("judge", async (t) => {
  t.mock.module("@/lib/ai/client", {
    namedExports: {
      AI_MODEL: "test-modell",
      isAiEnabled: () => aiEnabled,
      anthropic: {
        messages: {
          create: async () => ({ content: [{ type: "text", text: aiSvar }] }),
        },
      },
    },
  });

  const { judgeSubject, judgePromptHash, RubrikkSchema } = await import(
    "@/lib/evals/judge"
  );

  await t.test("gyldig rubrikk parses og hash er stabil", async () => {
    aiSvar =
      '{"metodikkTroskap":4,"eksterntFokus":5,"alderstilpasning":3,"sikkerhet":5,"begrunnelse":"Peker på ballflukt, følger pyramiden, ingen risikopåstander."}';
    const res = await judgeSubject({
      subjectType: "plan-action",
      subjectId: "a1",
      innhold: '{"drill":"Gate drill"}',
    });
    assert.ok(res.ok);
    if (res.ok) {
      assert.equal(res.rubrikk.eksterntFokus, 5);
      assert.equal(res.model, "test-modell");
      assert.equal(res.promptHash, judgePromptHash());
      assert.equal(res.promptHash.length, 16);
    }
  });

  await t.test("score utenfor 1–5 avvises av skjemaet", async () => {
    aiSvar =
      '{"metodikkTroskap":6,"eksterntFokus":5,"alderstilpasning":3,"sikkerhet":5,"begrunnelse":"Ugyldig score seks skal avvises av zod."}';
    const res = await judgeSubject({
      subjectType: "plan-action",
      subjectId: "a2",
      innhold: "{}",
    });
    assert.deepEqual(res, { ok: false, error: "invalid-schema" });
  });

  await t.test("ai-disabled håndteres eksplisitt", async () => {
    aiEnabled = false;
    const res = await judgeSubject({
      subjectType: "coach-chat",
      subjectId: "c1",
      innhold: "x",
    });
    assert.deepEqual(res, { ok: false, error: "ai-disabled" });
    aiEnabled = true;
  });

  await t.test("RubrikkSchema krever begrunnelse", () => {
    const uten = RubrikkSchema.safeParse({
      metodikkTroskap: 3,
      eksterntFokus: 3,
      alderstilpasning: 3,
      sikkerhet: 3,
    });
    assert.equal(uten.success, false);
  });
});
