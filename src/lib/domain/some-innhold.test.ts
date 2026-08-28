/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/domain/some-innhold.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggDemoSoMePoster, parseSoMePoster } from "./some-innhold";

describe("parseSoMePoster", () => {
  it("leser JSON-objekt med poster-array", () => {
    const text = JSON.stringify({
      poster: [
        { plattform: "instagram", tekst: "Kort grep i dag.", vinkel: "tips" },
        { plattform: "facebook", tekst: "Ukas trening.", vinkel: "akademi" },
      ],
    });
    const poster = parseSoMePoster(text);
    assert.equal(poster.length, 2);
    assert.equal(poster[0].plattform, "instagram");
  });

  it("leser fenced JSON", () => {
    const text = "Her er utkastet:\n```json\n{\"poster\":[{\"plattform\":\"instagram\",\"tekst\":\"Hei\",\"vinkel\":\"tips\"}]}\n```";
    const poster = parseSoMePoster(text);
    assert.equal(poster.length, 1);
    assert.equal(poster[0].tekst, "Hei");
  });

  it("ugyldig JSON gir tom liste", () => {
    assert.deepEqual(parseSoMePoster("ingen json her"), []);
  });
});

describe("byggDemoSoMePoster", () => {
  it("lager IG + FB uten å kreve økter", () => {
    const poster = byggDemoSoMePoster([]);
    assert.equal(poster.length, 2);
    assert.deepEqual(
      poster.map((p) => p.plattform).sort(),
      ["facebook", "instagram"],
    );
  });
});
