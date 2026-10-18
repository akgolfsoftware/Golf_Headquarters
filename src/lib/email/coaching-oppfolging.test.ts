import assert from "node:assert/strict";
import { test } from "node:test";
import { byggCoachingOppfolging, type CoachingOppfolgingInput } from "./coaching-oppfolging";
const input: CoachingOppfolgingInput = { status: "COMPLETED", fornavn: "Syntetisk", coach: "Syntetisk Coach", tjeneste: "Coachingtime", startAt: new Date("2026-11-12T16:30:00Z"), coachTekst: "Mitt godkjente notat", bookingUrl: "https://example.test/booking" };
test("begge oppfølgingsmaler bruker faktisk coachtekst og én hovedhandling", () => {
  for (const kind of ["takk", "oppfolging"] as const) {
    const mail = byggCoachingOppfolging(kind, input);
    assert.match(mail.html, /Mitt godkjente notat/); assert.match(mail.html, /Syntetisk Coach/); assert.match(mail.html, /16:30/);
    assert.equal((mail.html.match(/class="btna"/g) ?? []).length, 1);
    assert.doesNotMatch(mail.html, /Eng8|#booking|289|299|score|senterballtreff/);
  }
});
test("uferdig økt, falsk invitasjonslenke og HTML i coachtekst er kontrollert", () => {
  assert.throws(() => byggCoachingOppfolging("takk", { ...input, status: "PENDING" } as unknown as CoachingOppfolgingInput));
  assert.throws(() => byggCoachingOppfolging("takk", { ...input, bookingUrl: "javascript:alert(1)" }));
  const mail = byggCoachingOppfolging("takk", { ...input, coachTekst: "<script>alert(1)</script>" });
  assert.match(mail.html, /&lt;script&gt;/); assert.doesNotMatch(mail.html, /<script>/);
});
