import assert from "node:assert/strict";
import test from "node:test";

import {
  byggPaaminnelse,
  formaterKr,
  type PaaminnelseData,
} from "./paaminnelse-mal";

const data: PaaminnelseData = {
  mottaker: "gjest",
  fornavn: "Mari",
  tjeneste: "Privattime",
  varighetMin: 60,
  dag: "Tirsdag 29.09.2026",
  start: "17:00",
  klokke: "17:00–18:00",
  sted: "Studio 1 · Borregaard GK",
  coach: "Anders Kristiansen",
  pris: "950 kr",
  betaling: { tekst: "pi_test", mono: true },
  referanse: "BK-2026-0917",
  frist: "mandag 28.09.2026 kl. 17:00",
  fristPassert: true,
  lenker: {
    veibeskrivelse: "https://kart.test/?a=1&b=2",
    bookingIApp: "https://x.test/portal",
    endre: "https://x.test/endre",
  },
};

test("emne følger tegningen", () => {
  assert.equal(
    byggPaaminnelse(data).subject,
    "I morgen kl. 17:00: privattime med Anders",
  );
});
test("gjest får endre-lenke, appbruker får PlayerHQ-lenke", () => {
  assert.ok(byggPaaminnelse(data).html.includes("Endre eller avbestill"));
  const app = byggPaaminnelse({ ...data, mottaker: "app" }).html;
  assert.ok(app.includes("Se bookingen i PlayerHQ"));
  assert.ok(!app.includes("Endre eller avbestill"));
});
test("passert frist gir tegningens tekst, ellers frist", () => {
  assert.ok(
    byggPaaminnelse(data).html.includes(
      "Gratis avbestilling er ikke lenger mulig",
    ),
  );
  assert.ok(
    byggPaaminnelse({ ...data, fristPassert: false }).html.includes(
      "Gratis avbestilling til <b>mandag",
    ),
  );
});
test("manglende verdi blir tankestrek og ingen coach i emnet", () => {
  const r = byggPaaminnelse({
    ...data,
    coach: null,
    betaling: { tekst: null, mono: true },
  });
  assert.equal(r.subject, "I morgen kl. 17:00: privattime");
  assert.ok(r.html.includes(">—<"));
});
test("escaper tekst og lenker", () => {
  const html = byggPaaminnelse({ ...data, fornavn: "<b>x" }).html;
  assert.ok(html.includes("&lt;b&gt;x"));
  assert.ok(html.includes("a=1&amp;b=2"));
});
test("bruker tegningens farger og mørk mal", () => {
  assert.ok(byggPaaminnelse(data).html.includes("#141413"));
  assert.ok(
    byggPaaminnelse(data, { mork: true }).html.includes("background:#0c0d0c"),
  );
});
test("viser varighet i tjenesteraden", () => {
  assert.ok(byggPaaminnelse(data).html.includes("Privattime 60 min"));
  assert.ok(
    !byggPaaminnelse({ ...data, varighetMin: null }).html.includes(" min<"),
  );
});
test("formaterer kroner", () => assert.equal(formaterKr(295000), "2 950 kr"));
