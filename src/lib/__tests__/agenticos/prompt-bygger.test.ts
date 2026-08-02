import assert from "node:assert/strict";
import test from "node:test";
import { byggPrompt, KONTEKST_BUDSJETT, MALER } from "@/lib/agenticos/prompt-bygger";
import { INTENTS, type Klassifisering } from "@/lib/agenticos/typer";

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

test("hver intent har en mal, og id-en matcher nøkkelen", () => {
  for (const intent of INTENTS) {
    const mal = MALER[intent];
    assert.ok(mal, `mangler mal for ${intent}`);
    assert.equal(mal.id, intent);
    assert.ok(mal.versjon >= 1);
  }
});

test("prompten bærer id og versjon — ellers blir loggen ubrukelig", () => {
  const p = byggPrompt(k());
  assert.equal(p.promptId, "tolk-tall");
  assert.equal(p.promptVersjon, MALER["tolk-tall"].versjon);
});

test("invariantene er alltid med", () => {
  for (const intent of INTENTS) {
    const p = byggPrompt(k({ intent }));
    assert.match(p.system, /sperrer aldri/i, `${intent} mangler sperre-invarianten`);
    assert.match(p.system, /hypotese/i, `${intent} mangler SG-hypotese-invarianten`);
    assert.match(p.system, /Drill-banken er tom/i, `${intent} mangler drill-bank-invarianten`);
  }
});

test("kontekstblokker tas med og rapporteres", () => {
  const p = byggPrompt(k(), [
    { kilde: "FASIT", innhold: "APP-bånd 130-150m" },
    { kilde: "SPILLERDATA", innhold: "SG APP -0,42 siste 5 runder" },
  ]);
  assert.match(p.system, /APP-bånd 130-150m/);
  assert.match(p.system, /SG APP -0,42/);
  assert.deepEqual(p.kontekstKilder, ["FASIT", "SPILLERDATA"]);
});

test("tomme blokker hoppes over", () => {
  const p = byggPrompt(k(), [
    { kilde: "FASIT", innhold: "  " },
    { kilde: "RAG", innhold: "noe tekst" },
  ]);
  assert.deepEqual(p.kontekstKilder, ["RAG"]);
});

test("uten kontekst sier prompten eksplisitt at grunnlaget mangler", () => {
  const p = byggPrompt(k());
  assert.deepEqual(p.kontekstKilder, []);
  assert.match(p.system, /mangler grunnlaget/i);
});

test("blokk som sprenger budsjettet kuttes — vi limer aldri inn alt", () => {
  const stor = "x".repeat(KONTEKST_BUDSJETT.RAG + 5000);
  const p = byggPrompt(k(), [{ kilde: "RAG", innhold: stor }]);
  const xer = (p.system.match(/x/g) ?? []).length;
  assert.equal(xer, KONTEKST_BUDSJETT.RAG);
});
