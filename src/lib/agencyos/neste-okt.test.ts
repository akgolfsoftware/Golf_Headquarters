/**
 * npx tsx --test src/lib/agencyos/neste-okt.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { akseFraTekst, lagNesteOktKort, type NesteOktBooking } from "./neste-okt";

const booking = (over: Partial<NesteOktBooking> = {}): NesteOktBooking => ({
  id: "b1",
  // 07:00 UTC = 09:00 norsk sommertid
  startAt: new Date(Date.UTC(2026, 9, 5, 7, 0)),
  notes: null,
  guestName: null,
  user: { name: "Øyvind Rohjan" },
  serviceType: { name: "Teknikk" },
  location: { name: "Studio 1" },
  facility: null,
  ...over,
});

describe("neste økt i AgencyOS-menyen", () => {
  it("viser norsk tid, spiller, akse og sted", () => {
    const k = lagNesteOktKort(booking());
    assert.equal(k.tid, "09:00");
    assert.equal(k.time, "09");
    assert.equal(k.minutt, "00");
    assert.equal(k.spiller, "Øyvind Rohjan");
    assert.equal(k.akse, "tek");
    assert.equal(k.meta, "TEK · Teknikk · Studio 1");
    assert.equal(k.href, "/admin/gjennomfore/okter/b1");
  });

  it("gjetter ikke akse når teksten ikke sier den", () => {
    assert.equal(akseFraTekst("Privattime 60 min"), null);
    const k = lagNesteOktKort(booking({ serviceType: { name: "Privattime 60 min" }, location: null }));
    assert.equal(k.akse, null);
    assert.equal(k.meta, "Privattime 60 min");
  });

  it("bruker gjestenavn når spilleren ikke har konto", () => {
    assert.equal(lagNesteOktKort(booking({ user: null, guestName: "Kari Nordmann" })).spiller, "Kari Nordmann");
  });

  it("«Innspill» er SLAG, ikke SPILL", () => {
    assert.equal(akseFraTekst("Innspill 50–80"), "slag");
  });
});
