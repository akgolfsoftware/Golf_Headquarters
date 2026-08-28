import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  FALLBACK_ANTHROPIC_MODEL,
  FALLBACK_OLLAMA_MODEL,
  velgRutetModell,
  type RuteRad,
} from "./ai-ruting";

const regel = (overstyr: Partial<RuteRad> = {}): RuteRad => ({
  agentName: "plan-revisjon",
  active: true,
  modelActive: true,
  provider: "anthropic",
  modelId: "claude-opus-4-8",
  ...overstyr,
});

describe("velgRutetModell", () => {
  it("bruker aktiv DB-regel når den finnes", () => {
    const v = velgRutetModell({
      agentName: "plan-revisjon",
      regler: [regel()],
      anthropicTilgjengelig: true,
    });
    assert.deepEqual(v, {
      provider: "anthropic",
      modelId: "claude-opus-4-8",
      kilde: "db",
    });
  });

  it("ignorerer inaktiv regel og faller til Anthropic", () => {
    const v = velgRutetModell({
      agentName: "plan-revisjon",
      regler: [regel({ active: false })],
      anthropicTilgjengelig: true,
    });
    assert.equal(v.kilde, "fallback-anthropic");
    assert.equal(v.modelId, FALLBACK_ANTHROPIC_MODEL);
  });

  it("tom tabell faller til Ollama når Anthropic mangler nøkkel", () => {
    const v = velgRutetModell({
      agentName: "social-media",
      regler: [],
      anthropicTilgjengelig: false,
    });
    assert.deepEqual(v, {
      provider: "ollama",
      modelId: FALLBACK_OLLAMA_MODEL,
      kilde: "fallback-ollama",
    });
  });

  it("ukjent provider i DB behandles som anthropic", () => {
    const v = velgRutetModell({
      agentName: "x",
      regler: [regel({ agentName: "x", provider: "ukjent-sky" })],
      anthropicTilgjengelig: false,
    });
    assert.equal(v.provider, "anthropic");
    assert.equal(v.kilde, "db");
  });
});
