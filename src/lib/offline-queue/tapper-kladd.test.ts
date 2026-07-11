import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggKoRad, registrerMislykketForsok, trengerManuellHandling } from "./tapper-kladd";

const NAA = new Date(2026, 6, 11, 12, 0);

describe("byggKoRad", () => {
  it("starter på 0 forsøk med gitt telling og tidspunkt", () => {
    const r = byggKoRad("okt-1", [{ club: "driver", count: 5 }], NAA);
    assert.equal(r.sessionId, "okt-1");
    assert.deepEqual(r.counts, [{ club: "driver", count: 5 }]);
    assert.equal(r.forsokAntall, 0);
    assert.equal(r.sistOppdatert, NAA.toISOString());
  });
});

describe("registrerMislykketForsok", () => {
  it("øker forsøkstelleren med 1 og oppdaterer tidspunkt", () => {
    const r0 = byggKoRad("okt-1", [], NAA);
    const senere = new Date(2026, 6, 11, 12, 5);
    const r1 = registrerMislykketForsok(r0, senere);
    assert.equal(r1.forsokAntall, 1);
    assert.equal(r1.sistOppdatert, senere.toISOString());
  });

  it("er ren — endrer ikke originalobjektet", () => {
    const r0 = byggKoRad("okt-1", [], NAA);
    registrerMislykketForsok(r0, NAA);
    assert.equal(r0.forsokAntall, 0);
  });
});

describe("trengerManuellHandling", () => {
  it("false under terskelen", () => {
    let r = byggKoRad("okt-1", [], NAA);
    for (let i = 0; i < 4; i++) r = registrerMislykketForsok(r, NAA);
    assert.equal(r.forsokAntall, 4);
    assert.equal(trengerManuellHandling(r), false);
  });

  it("true ved og over terskelen (5)", () => {
    let r = byggKoRad("okt-1", [], NAA);
    for (let i = 0; i < 5; i++) r = registrerMislykketForsok(r, NAA);
    assert.equal(trengerManuellHandling(r), true);
  });

  it("fersk rad (0 forsøk) trenger aldri manuell handling", () => {
    assert.equal(trengerManuellHandling(byggKoRad("okt-1", [], NAA)), false);
  });
});
