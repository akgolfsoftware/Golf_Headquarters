import assert from "node:assert/strict";
import test from "node:test";
import { eskaler, MODELLER, velgModell } from "@/lib/agenticos/modell";
import type { Klassifisering } from "@/lib/agenticos/typer";

function k(over: Partial<Klassifisering> = {}): Klassifisering {
  return {
    intent: "tolk-tall",
    domene: "SG",
    rolle: "SPILLER",
    mindreaarig: false,
    confidence: 0.9,
    ...over,
  };
}

test("planoppgaver får opus — en feil treffer flere uker", () => {
  assert.equal(velgModell(k({ intent: "plan" })).tier, "opus");
});

test("driftsoppgaver får haiku", () => {
  assert.equal(velgModell(k({ intent: "drift" })).tier, "haiku");
});

test("standard er sonnet", () => {
  assert.equal(velgModell(k({ intent: "tolk-tall" })).tier, "sonnet");
  assert.equal(velgModell(k({ intent: "fritekst" })).tier, "sonnet");
});

test("krevLokal overstyrer alt — PII om mindreårig går aldri til sky", () => {
  const valg = velgModell(k({ intent: "plan", mindreaarig: true }), { krevLokal: true });
  assert.equal(valg.tier, "lokal");
  assert.equal(valg.modell, MODELLER.lokal);
});

test("eskalering går ett tier opp", () => {
  assert.equal(eskaler("haiku")?.tier, "sonnet");
  assert.equal(eskaler("sonnet")?.tier, "opus");
});

test("eskalering fra toppen returnerer null — ingen evig opptrapping", () => {
  assert.equal(eskaler("opus"), null);
  assert.equal(eskaler("lokal"), null);
});
