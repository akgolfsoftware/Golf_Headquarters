import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseOllamaContent } from "@/lib/meg/ollama";

describe("parseOllamaContent", () => {
  it("henter ut message.content", () => {
    assert.equal(
      parseOllamaContent({ message: { content: '{"kind":"sleep"}' } }),
      '{"kind":"sleep"}',
    );
  });

  it("trimmer whitespace", () => {
    assert.equal(parseOllamaContent({ message: { content: "  hei  " } }), "hei");
  });

  it("returnerer null for tomt, manglende eller feil format", () => {
    assert.equal(parseOllamaContent({ message: { content: "   " } }), null);
    assert.equal(parseOllamaContent({ message: {} }), null);
    assert.equal(parseOllamaContent({}), null);
    assert.equal(parseOllamaContent(null), null);
    assert.equal(parseOllamaContent({ message: { content: 42 } }), null);
  });
});
