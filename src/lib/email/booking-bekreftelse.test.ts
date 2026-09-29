import assert from "node:assert/strict";
import { test } from "node:test";
import { byggBekreftelse, datoTekst, klokkeTekst, googleKalenderUrl, type BekreftelseInput } from "./booking-bekreftelse";

const start = new Date(Date.UTC(2026, 8, 29, 17, 0));
const slutt = new Date(Date.UTC(2026, 8, 29, 18, 0));
const frist = new Date(Date.UTC(2026, 8, 28, 17, 0));

const base: BekreftelseInput = {
type: "gjest",
fornavn: "Mari",
tjeneste: "Privattime",
varighetMin: 60,
start,
slutt,
sted: "Studio 1",
coach: "Anders Kristiansen",
frist,
prisOre: 95000,
betalingsref: "pi_demo",
referanse: "#abcd1234",
kalenderUrl: "https://calendar.google.com/x",
bookingUrl: "https://akgolf.no/portal/meg/bookinger",
endreUrl: "mailto:post@akgolf.no",
opprettKontoUrl: "https://akgolf.no/auth/signup",
spillerhqTilbud: { tekst: "plan fra coachen", manedNok: null, arNok: null },
};

test("formaterer Oslo-veggklokke uavhengig av serverens tidssone", () => {
  assert.equal(datoTekst(start), "Tirsdag 29.09.2026");
  assert.equal(klokkeTekst(start), "17:00");
});
test("gjest får PlayerHQ-tilbud, pris og betalingsreferanse", () => {
  const { subject, html } = byggBekreftelse(base);
  assert.equal(subject, "Bekreftet: privattime tirsdag 29.09.2026 kl. 17:00");
  assert.ok(html.includes("Fortsett i PlayerHQ"));
  assert.ok(html.includes("950 kr"));
  assert.ok(html.includes("pi_demo"));
  assert.ok(!html.includes("Kostnad:"));
});
test("appbruker får klipp, ingen PlayerHQ-boks og lenke til PlayerHQ", () => {
  const { html } = byggBekreftelse({ ...base, type: "app", prisOre: null, betalingsref: null, spillerhqTilbud: null, opprettKontoUrl: null });
  assert.ok(html.includes("Inkludert i abonnement"));
  assert.ok(html.includes("1 klipp"));
  assert.ok(!html.includes("Fortsett i PlayerHQ"));
  assert.ok(html.includes("Se bookingen i PlayerHQ"));
});
test("manglende verdier vises som tankestrek, ikke gjetning", () => {
  const { html } = byggBekreftelse({ ...base, coach: null, betalingsref: null });
  assert.ok(html.includes(">—<"));
  assert.ok(!html.includes("pi_"));
});
test("escaper navn og bruker natt-palett når bedt om", () => {
  const { html } = byggBekreftelse({ ...base, fornavn: "<b>x</b>", natt: true });
  assert.ok(html.includes("&lt;b&gt;x&lt;/b&gt;"));
  assert.ok(html.includes("#0c0d0c"));
});
test("kalenderlenke bruker Oslo som tidssone", () => {
  const u = googleKalenderUrl({ tjeneste: "T", start, slutt, sted: "S", referanse: "#1" });
  assert.ok(u.includes("ctz=Europe%2FOslo"));
  assert.ok(u.includes("20260929T170000%2F20260929T180000"));
});
