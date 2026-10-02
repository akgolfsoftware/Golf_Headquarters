import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggKoRad, registrerMislykketForsok, trengerManuellHandling, gjenopptaTapper } from "./tapper-kladd";

const NAA = new Date(2026, 6, 11, 12, 0);

describe("byggKoRad", () => {
  it("starter på 0 forsøk med gitt telling og tidspunkt", () => {
    const r = byggKoRad("bruker-a", "okt-1", [{ club: "driver", count: 5 }], NAA);
    assert.equal(r.eierId, "bruker-a");
    assert.equal(r.key, "bruker-a:okt-1");
    assert.equal(r.sessionId, "okt-1");
    assert.deepEqual(r.counts, [{ club: "driver", count: 5 }]);
    assert.equal(r.forsokAntall, 0);
    assert.equal(r.sistOppdatert, NAA.toISOString());
  });
});

describe("registrerMislykketForsok", () => {
  it("øker forsøkstelleren med 1 og oppdaterer tidspunkt", () => {
    const r0 = byggKoRad("bruker-a", "okt-1", [], NAA);
    const senere = new Date(2026, 6, 11, 12, 5);
    const r1 = registrerMislykketForsok(r0, senere);
    assert.equal(r1.forsokAntall, 1);
    assert.equal(r1.sistOppdatert, senere.toISOString());
  });

  it("er ren — endrer ikke originalobjektet", () => {
    const r0 = byggKoRad("bruker-a", "okt-1", [], NAA);
    registrerMislykketForsok(r0, NAA);
    assert.equal(r0.forsokAntall, 0);
  });
});

describe("trengerManuellHandling", () => {
  it("false under terskelen", () => {
    let r = byggKoRad("bruker-a", "okt-1", [], NAA);
    for (let i = 0; i < 4; i++) r = registrerMislykketForsok(r, NAA);
    assert.equal(r.forsokAntall, 4);
    assert.equal(trengerManuellHandling(r), false);
  });

  it("true ved og over terskelen (5)", () => {
    let r = byggKoRad("bruker-a", "okt-1", [], NAA);
    for (let i = 0; i < 5; i++) r = registrerMislykketForsok(r, NAA);
    assert.equal(trengerManuellHandling(r), true);
  });

  it("fersk rad (0 forsøk) trenger aldri manuell handling", () => {
    assert.equal(trengerManuellHandling(byggKoRad("bruker-a", "okt-1", [], NAA)), false);
  });
});


describe("gjenopptak uten gamle serverbilder", () => {
  const base = byggKoRad("owner", "session", [{ club: "driver", count: 5 }], NAA);
  it("venter på bekreftelse selv om siden har et nyere serverbilde", () => {
    assert.deepEqual(gjenopptaTapper({ ...base, revision: 2, synketRevision: 1 }, "2026-10-02T02:00:00.000Z"), base.counts);
  });
  it("bevarer en kvittering som kom etter at serveren tegnet siden", () => {
    assert.deepEqual(gjenopptaTapper({ ...base, revision: 2, synketRevision: 2, serverUpdatedAt: "2026-10-02T02:00:00.000Z" }, "2026-10-02T01:00:00.000Z"), base.counts);
  });
  it("bruker nyere serverresultat fra en annen enhet foran en gammel kvittert kladd", () => {
    assert.equal(gjenopptaTapper({ ...base, revision: 2, synketRevision: 2, serverUpdatedAt: "2026-10-02T01:00:00.000Z" }, "2026-10-02T02:00:00.000Z"), null);
  });
});
