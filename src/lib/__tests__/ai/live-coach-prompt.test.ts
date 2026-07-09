// Tester for bygLiveCoachSystemPrompt — system-prompten AI Golf Coach bruker
// under en AKTIV treningsøkt (src/lib/ai-plan/coach-prompt.ts).
//
// Ren funksjonstest — ingen Prisma/Anthropic-mocking nødvendig.
//
// Kjør med:
//   npx tsx --conditions=react-server --test src/lib/__tests__/ai/live-coach-prompt.test.ts

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  bygLiveCoachSystemPrompt,
  type SystemPromptInput,
  type LiveCoachKontext,
} from "@/lib/ai-plan/coach-prompt";

const BASE: SystemPromptInput = {
  mottaker: "spiller-live",
  spillerNavn: "Øyvind Rohjan",
  hcp: 8.4,
  ambition: "Elite",
  homeClub: "Gamle Fredrikstad GK",
  tier: "PERFORMANCE",
  playingYears: 12,
  sisteRunder: [{ dato: "2026-07-01", bane: "Gamle Fredrikstad GK", score: 74, sgTotal: 1.2 }],
  aktivePlaner: [{ navn: "Sommerplan 2026" }],
};

const LIVE: LiveCoachKontext = {
  sessionKind: "session-v2",
  sessionId: "session-9",
  sessionTitle: "Fredagsøkt — driver og nærspill",
  coachBrief: "Fokuser på tempo i nedsvingen.",
  activeDrill: {
    name: "9-3 kontroll",
    lFase: "L2",
    csNivaa: "CS40",
    pyramidArea: "TEK",
    pPosisjoner: ["P4", "P5"],
  },
  drillsRemaining: 2,
};

describe("bygLiveCoachSystemPrompt", () => {
  it("inneholder sessionTitle", () => {
    const prompt = bygLiveCoachSystemPrompt(BASE, LIVE);
    assert.ok(
      prompt.includes(LIVE.sessionTitle),
      "Prompten mangler økt-tittelen",
    );
  });

  it("bruker spillerens fornavn, ikke fullt navn", () => {
    const prompt = bygLiveCoachSystemPrompt(BASE, LIVE);
    assert.ok(prompt.includes("Øyvind"), "Prompten mangler fornavnet");
  });

  it("markerer at spilleren er i en AKTIV treningsøkt", () => {
    const prompt = bygLiveCoachSystemPrompt(BASE, LIVE);
    assert.ok(
      prompt.includes("AKTIV treningsøkt"),
      "Prompten mangler «AKTIV treningsøkt»-markøren",
    );
  });

  it("inneholder aktiv drill og driller igjen", () => {
    const prompt = bygLiveCoachSystemPrompt(BASE, LIVE);
    assert.ok(prompt.includes("9-3 kontroll"));
    assert.ok(prompt.includes("Driller igjen: 2"));
  });

  it("inneholder coach-notat når det finnes", () => {
    const prompt = bygLiveCoachSystemPrompt(BASE, LIVE);
    assert.ok(prompt.includes("Fokuser på tempo i nedsvingen."));
  });

  it("faller tilbake til 'Ingen coach-notat' når coachBrief mangler", () => {
    const utenBrief: LiveCoachKontext = { ...LIVE, coachBrief: null };
    const prompt = bygLiveCoachSystemPrompt(BASE, utenBrief);
    assert.ok(prompt.includes("Ingen coach-notat på denne økta."));
  });

  it("faller tilbake til 'Ingen aktiv drill' når activeDrill mangler", () => {
    const utenDrill: LiveCoachKontext = { ...LIVE, activeDrill: null };
    const prompt = bygLiveCoachSystemPrompt(BASE, utenDrill);
    assert.ok(prompt.includes("Ingen aktiv drill valgt akkurat nå."));
  });

  it("bruker riktig norsk etikett for plan-session vs. session-v2", () => {
    const planSession: LiveCoachKontext = { ...LIVE, sessionKind: "plan-session" };
    const promptPlan = bygLiveCoachSystemPrompt(BASE, planSession);
    const promptV2 = bygLiveCoachSystemPrompt(BASE, LIVE);
    assert.ok(promptPlan.includes("treningsplan-økt"));
    assert.ok(promptV2.includes("økt v2"));
  });

  it("kaster aldri emoji eller utropstegn i selve prompt-instruksene", () => {
    const prompt = bygLiveCoachSystemPrompt(BASE, LIVE);
    assert.ok(
      prompt.includes("Aldri emoji"),
      "Prompten mangler emoji-forbudet i tone-instruksene",
    );
  });
});
