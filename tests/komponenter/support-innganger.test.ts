import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

mock.module("next/link", { defaultExport: "a" });
mock.module("next/navigation", { namedExports: { useRouter: () => ({ push() {} }) } });
mock.module("@/styles/precision-athletics.css", { defaultExport: {} });
mock.module("@/app/auth/guardian-consent/[token]/actions", { namedExports: { confirmGuardianConsent: async () => { throw new Error("Skal ikke brukes av utløpt lenke"); } } });

test("utløpt foreldresamtykke viser ingen spilleridentitet eller samtykkeskjema", async () => {
  const { GuardianConsentV2 } = await import("@/components/portal/v2/GuardianConsentV2");
  const html = renderToStaticMarkup(createElement(GuardianConsentV2, { state: "expired", playerName: "Syntetisk Hemmelig Navn", playerAge: 14, email: "hemmelig@example.invalid" }));
  assert.doesNotMatch(html, /Syntetisk Hemmelig|hemmelig@example|<form|14 år/);
  assert.match(html, /Lenken er utløpt/);
  assert.match(html, /href="\/kontakt"/);
});

test("eldre kataloginnganger påstår ingen booking, lagring eller barnedata", async () => {
  const { BookingPrecisionFlow } = await import("@/components/marketing/booking/BookingPrecisionFlow");
  const { ForelderPrecisionView } = await import("@/components/forelder/ForelderPrecisionView");
  const booking = renderToStaticMarkup(createElement(BookingPrecisionFlow, { tjenester: [{ slug: "oppdiktet", navn: "Eksempel", coachNavn: "Falsk Coach", pris: 999, enhet: "kr", varighetMin: 40, beskrivelse: null }], lokasjon: "Falskt sted" }));
  const parent = renderToStaticMarkup(createElement(ForelderPrecisionView, { spillerNavn: "Hemmelig Barn", spillerAlder: 13 }));
  assert.match(booking, /href="\/booking"/);
  assert.doesNotMatch(booking, /999|Falsk|<form|Betaling bekreftet/);
  assert.match(parent, /href="\/forelder"/);
  assert.doesNotMatch(parent, /Hemmelig Barn|Sendt|Godkjent|13 år|<form/);
});
