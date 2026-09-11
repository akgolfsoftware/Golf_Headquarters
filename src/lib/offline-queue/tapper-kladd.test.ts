import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggKoRad, registrerMislykketForsok, trengerManuellHandling, tilhoererBruker } from "./tapper-kladd";

const NAA = new Date(2026, 6, 11, 12, 0);

describe("byggKoRad", () => {
  it("starter på 0 forsøk med gitt telling og tidspunkt", () => {
    const r = byggKoRad("okt-1", [{ club: "driver", count: 5 }], NAA, "u-1");
    assert.equal(r.sessionId, "okt-1");
    assert.deepEqual(r.counts, [{ club: "driver", count: 5 }]);
    assert.equal(r.forsokAntall, 0);
    assert.equal(r.sistOppdatert, NAA.toISOString());
  });

  it("R-C: stempler raden med brukeren som la den i køen", () => {
    const r = byggKoRad("okt-1", [], NAA, "u-1");
    assert.equal(r.userId, "u-1");
  });
});

describe("registrerMislykketForsok", () => {
  it("øker forsøkstelleren med 1 og oppdaterer tidspunkt", () => {
    const r0 = byggKoRad("okt-1", [], NAA, "u-1");
    const senere = new Date(2026, 6, 11, 12, 5);
    const r1 = registrerMislykketForsok(r0, senere);
    assert.equal(r1.forsokAntall, 1);
    assert.equal(r1.sistOppdatert, senere.toISOString());
  });

  it("er ren — endrer ikke originalobjektet", () => {
    const r0 = byggKoRad("okt-1", [], NAA, "u-1");
    registrerMislykketForsok(r0, NAA);
    assert.equal(r0.forsokAntall, 0);
  });
});

describe("trengerManuellHandling", () => {
  it("false under terskelen", () => {
    let r = byggKoRad("okt-1", [], NAA, "u-1");
    for (let i = 0; i < 4; i++) r = registrerMislykketForsok(r, NAA);
    assert.equal(r.forsokAntall, 4);
    assert.equal(trengerManuellHandling(r), false);
  });

  it("true ved og over terskelen (5)", () => {
    let r = byggKoRad("okt-1", [], NAA, "u-1");
    for (let i = 0; i < 5; i++) r = registrerMislykketForsok(r, NAA);
    assert.equal(trengerManuellHandling(r), true);
  });

  it("fersk rad (0 forsøk) trenger aldri manuell handling", () => {
    assert.equal(trengerManuellHandling(byggKoRad("okt-1", [], NAA, "u-1")), false);
  });
});

describe("tilhoererBruker (R-C: hindrer flush av forrige brukers rad ved brukerbytte)", () => {
  it("true når raden er stemplet med akkurat denne brukeren", () => {
    const rad = byggKoRad("okt-1", [], NAA, "u-1");
    assert.equal(tilhoererBruker(rad, "u-1"), true);
  });

  it("false for en ANNEN bruker enn den som la raden i køen", () => {
    const rad = byggKoRad("okt-1", [], NAA, "u-1");
    assert.equal(tilhoererBruker(rad, "u-2"), false);
  });

  it("false (aldri automatisk flush) for en rad uten userId (eldre appversjon)", () => {
    const rad = { ...byggKoRad("okt-1", [], NAA, "u-1"), userId: undefined };
    assert.equal(tilhoererBruker(rad, "u-1"), false);
  });
});
