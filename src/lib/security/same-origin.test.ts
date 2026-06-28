import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isSameOrigin } from "./same-origin";

// Testene kjører med NODE_ENV != "production", så localhost og manglende
// origin/referer aksepteres (samme policy som isSameOriginAction deler).
function req(headers: Record<string, string>): Request {
  return new Request("https://akgolf.no/x", { headers });
}

describe("isSameOrigin (CSRF-vern)", () => {
  it("godtar konfigurert prod-origin", () => {
    assert.equal(isSameOrigin(req({ origin: "https://akgolf.no" })), true);
  });

  it("godtar localhost i ikke-produksjon", () => {
    assert.equal(isSameOrigin(req({ origin: "http://localhost:3000" })), true);
  });

  it("avviser fremmed origin", () => {
    assert.equal(isSameOrigin(req({ origin: "https://evil.example.com" })), false);
  });

  it("faller tilbake til referer når origin mangler", () => {
    assert.equal(
      isSameOrigin(req({ referer: "https://akgolf.no/auth/guardian-consent/abc" })),
      true,
    );
  });

  it("avviser fremmed referer", () => {
    assert.equal(
      isSameOrigin(req({ referer: "https://evil.example.com/phish" })),
      false,
    );
  });
});
