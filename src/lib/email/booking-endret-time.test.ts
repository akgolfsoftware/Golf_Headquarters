/**
 * EP-02 Endret time: innhold, varianter (gjest/appbruker/klipp) og at ingen
 * verdi gjettes. Datoene bygges med lokale getters, som lagret Oslo-veggklokke.
 */
import assert from "node:assert/strict";
import { test } from "node:test";

import { byggEndretTimeEpost, type EndretTimeInput } from "./booking-endret-time";

const grunn: EndretTimeInput = {
  appUrl: "https://akgolf.no",
  bookingId: "bk_demo_1",
  startAt: new Date(2026, 9, 1, 16, 0),
  endAt: new Date(2026, 9, 1, 17, 0),
  oldStartAt: new Date(2026, 8, 29, 17, 0),
  fornavn: "Mari",
  epost: "mari.s@demo.no",
  tjenesteNavn: "Privattime",
  varighetMin: 60,
  stedNavn: "Studio 1",
  stedAdresse: "Borregaard GK",
  coachNavn: "Anders Kristiansen",
  priceOre: 95000,
  erKlipp: false,
  stripePaymentIntentId: "pi_demo",
  harKonto: false,
};

test("gjest: ny og gammel tid, pris, betaling og PlayerHQ-tilbud", () => {
  const { subject, html } = byggEndretTimeEpost(grunn);
  assert.equal(subject, "Endret: ny tid torsdag 01.10.2026 kl. 16:00");
  assert.match(html, /Timen er flyttet/);
  assert.match(html, /Tirsdag 29\.09\.2026 kl\. 17:00–18:00/);
  assert.match(html, /Torsdag 01\.10\.2026 kl\. 16:00–17:00/);
  assert.match(html, /950 kr/);
  assert.match(html, /pi_demo/);
  assert.match(html, /Fortsett i PlayerHQ/);
  assert.match(html, /299 kr per måned eller 2 690 kr per år/);
  assert.match(html, /onsdag 30\.09\.2026 kl\. 16:00/);
  assert.match(html, /Opprett konto med mari\.s@demo\.no/);
  assert.match(html, /\/auth\/signup"/);
  assert.doesNotMatch(html, /signup\?/, "ingen e-post i lenken");
});

test("appbruker med klipp: ingen pris, ingen PlayerHQ-tilbud, lenke til PlayerHQ", () => {
  const { html } = byggEndretTimeEpost({
    ...grunn,
    harKonto: true,
    erKlipp: true,
    stripePaymentIntentId: null,
  });
  assert.match(html, /Inkludert i abonnement/);
  assert.match(html, /1 klipp fra abonnementet/);
  assert.match(html, /Etter det brukes klippet\./);
  assert.match(html, /Se bookingen i PlayerHQ/);
  assert.doesNotMatch(html, /Fortsett i PlayerHQ/);
});

test("manglende verdier vises som tankestrek", () => {
  const { html } = byggEndretTimeEpost({
    ...grunn,
    coachNavn: null,
    stripePaymentIntentId: null,
    fornavn: null,
  });
  assert.match(html, /Coach<\/td><td[^>]*>—<\/td>/);
  assert.match(html, /Betaling<\/td><td[^>]*>—<\/td>/);
  assert.match(html, /Hei der\./);
});

test("verdier escapes i HTML", () => {
  const { html } = byggEndretTimeEpost({ ...grunn, fornavn: "<b>x</b>" });
  assert.doesNotMatch(html, /<b>x<\/b>/);
});

test("kalenderlenken beholder veggklokken uten Z", () => {
  const { html } = byggEndretTimeEpost(grunn);
  assert.match(html, /dates=20261001T160000%2F20261001T170000/);
  assert.match(html, /ctz=Europe%2FOslo/);
});

test("mørk visning i e-postprogram: boks, lenker og knapp overstyres i media-regelen", () => {
  const { html } = byggEndretTimeEpost(grunn);
  const media = html.match(/@media \(prefers-color-scheme:dark\)\{[\s\S]*?\}\}/)?.[0] ?? "";
  assert.match(media, /\.flat\{background:#141513!important/);
  assert.match(media, /a\.lnk\{color:#faf8f3!important/);
  assert.match(media, /\.btn\{background:#faf8f3!important/);
  assert.match(media, /a\.btna\{color:#141413!important/);
  assert.match(html, /class="flat"/);
  assert.match(html, /class="btn"/);
  assert.match(html, /class="lnk"/);
});

test("sted skilles med midtstilt prikk som i tegningen", () => {
  assert.match(byggEndretTimeEpost(grunn).html, /Studio 1 · Borregaard GK/);
});
