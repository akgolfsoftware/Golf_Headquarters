import assert from "node:assert/strict";
import { mock, test } from "node:test";

const eier = "spiller-a";
const annensTraad = "traad-tilhoerer-spiller-b";
const egenTraad = "traad-tilhoerer-spiller-a";

let updateManyKall: { where: Record<string, unknown> }[] = [];
let opprettet = 0;
let onFerdigFn: ((svar: string) => Promise<void>) | null = null;

mock.module("@/lib/auth/getCurrentUser", {
  namedExports: { getCurrentUser: async () => ({ id: eier, name: "Test", role: "PLAYER", tier: "FULL" }) },
});
mock.module("@/lib/rate-limit", { namedExports: { rateLimit: async () => ({ ok: true }) } });
mock.module("@/lib/anthropic", {
  namedExports: {
    anthropicKlient: () => ({}),
    bygSystemPrompt: () => "system",
    COACH_MODEL: "test",
  },
});
mock.module("@/lib/ai/anonymiser", { namedExports: { pseudonymForId: () => "P" } });
mock.module("@/lib/ai/client", {
  namedExports: {
    streamAnthropicTekst: ({ onFerdig }: { onFerdig: (s: string) => Promise<void> }) => {
      onFerdigFn = onFerdig;
      return new ReadableStream();
    },
  },
});
mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      trainingPlan: { findMany: async () => [] },
      round: { findMany: async () => [] },
      user: { findFirst: async () => ({ id: "coach-1" }) },
      coachingSession: {
        findFirst: async (args: { where: { id: string; userId: string; kind: string } }) =>
          args.where.id === egenTraad && args.where.userId === eier && args.where.kind === "AI"
            ? { id: egenTraad }
            : null,
        create: async () => {
          opprettet += 1;
          return { id: "ny-traad" };
        },
        updateMany: async (args: { where: Record<string, unknown> }) => {
          updateManyKall.push(args);
          return { count: 1 };
        },
      },
    },
  },
});

function req(sessionId: string | null) {
  return new Request("http://localhost/api/coach/ai-chat", {
    method: "POST",
    body: JSON.stringify({ sessionId, messages: [{ role: "user", content: "hei" }] }),
  });
}

test("annen brukers tråd-ID avvises og blir aldri skrevet til", async () => {
  updateManyKall = [];
  opprettet = 0;
  onFerdigFn = null;
  const { POST } = await import("./route");
  const res = await POST(req(annensTraad));
  assert.equal(res.status, 404);
  assert.equal(onFerdigFn, null);
  assert.equal(updateManyKall.length, 0);
  assert.equal(opprettet, 0);
});

test("egen tråd godtas, og lagringen er låst til eier", async () => {
  updateManyKall = [];
  onFerdigFn = null;
  const { POST } = await import("./route");
  const res = await POST(req(egenTraad));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("x-session-id"), egenTraad);
  assert.ok(onFerdigFn);
  await (onFerdigFn as unknown as (s: string) => Promise<void>)("svar");
  assert.equal(updateManyKall.length, 1);
  assert.equal(updateManyKall[0].where.userId, eier);
  assert.equal(updateManyKall[0].where.id, egenTraad);
});

test("uten tråd-ID opprettes ny tråd", async () => {
  opprettet = 0;
  const { POST } = await import("./route");
  const res = await POST(req(null));
  assert.equal(res.status, 200);
  assert.equal(opprettet, 1);
});
