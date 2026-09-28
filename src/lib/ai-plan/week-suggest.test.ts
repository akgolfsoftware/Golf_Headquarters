import assert from "node:assert/strict";
import { mock, test } from "node:test";

// Personvern: spillerens navn skal aldri stå i teksten som sendes til Anthropic
// (beslutninger.md §SKJERMENE … RUNDE 8, punkt 3).
const NAVN = "Tobias Lindvik";
const sendtTekst: string[] = [];

mock.module("@/lib/prisma", {
  namedExports: {
    prisma: {
      user: { findUnique: async () => ({ name: NAVN, hcp: 12 }) },
      tournamentEntry: { findFirst: async () => null },
      signal: { findMany: async () => [] },
      trainingSessionV2: { count: async () => 0 },
    },
  },
});
mock.module("@/lib/plan-engine/load-signals", {
  namedExports: { hentPlayerSignals: async () => ({}) },
});
// Falsk modell som fanger alt som ville blitt sendt, og stopper kallet der.
const fangeModell = {
  specificationVersion: "v2",
  provider: "test",
  modelId: "test",
  supportedUrls: {},
  doGenerate: async (opts: { prompt: unknown }) => {
    sendtTekst.push(JSON.stringify(opts.prompt));
    throw new Error("stopp etter at prompten er fanget");
  },
};
mock.module("@/lib/ai/client", {
  namedExports: { anthropicProvider: () => () => fangeModell },
});
mock.module("@/lib/error-tracking", {
  namedExports: { logError: async () => undefined },
});

test("ukeforslaget sender ikke spillerens navn til AI", async () => {
  process.env.ANTHROPIC_API_KEY = "test";
  const { generateWeekSuggestions } = await import("./week-suggest");
  await generateWeekSuggestions("spiller-1", new Date(Date.UTC(2026, 8, 28)));

  assert.ok(sendtTekst.length >= 1, "AI-kallet ble ikke nådd");
  for (const tekst of sendtTekst) {
    assert.ok(!tekst.includes("Tobias"), "fornavnet sendt til AI");
    assert.ok(!tekst.includes("Lindvik"), "etternavnet sendt til AI");
  }
});
