import test from "node:test";
import assert from "node:assert/strict";
import {
  byggAvbestilling,
  formaterKr,
  osloDag,
  osloDagOgTid,
  osloKlokke,
  refusjonTekst,
  type AvbestillingData,
} from "./avbestilling-mal";

const data: AvbestillingData = {
  mottaker: "gjest",
  fornavn: "Mari",
  tjeneste: "Privattime 60 min",
  dag: "Tirsdag 29.09.2026",
  klokke: "17:00–18:00",
  avbestiltTidspunkt: "Mandag 28.09.2026 kl. 09:14",
  refusjon: { type: "penger", belop: formaterKr(95000) },
  referanse: "re_3QdF1a2LkP9aKG26",
  lenker: { bookNy: "https://akgolf.no/booking", playerhq: "https://akgolf.no/portal" },
};

test("EP-04 gjest: emne, tittel, refusjon og referanse som i tegningen", () => {
  const { subject, html } = byggAvbestilling(data);
  assert.equal(subject, "Avbestilt: privattime tirsdag 29.09.2026");
  assert.match(html, /Timen er avbestilt/);
  assert.match(html, /<s>Tirsdag 29\.09\.2026 kl\. 17:00–18:00<\/s>/);
  assert.match(html, /950 kr til kortet du betalte med/);
  assert.match(html, /re_3QdF1a2LkP9aKG26/);
  assert.match(html, /Book ny time/);
  assert.doesNotMatch(html, /Åpne PlayerHQ/);
});

test("EP-04 app: klipp tilbake og lenke til PlayerHQ", () => {
  const { html } = byggAvbestilling({
    ...data,
    mottaker: "app",
    refusjon: { type: "klipp", igjen: 4, av: 4 },
    referanse: "BK-2026-0917",
  });
  assert.match(html, /Klippet er lagt tilbake · 4 av 4 igjen/);
  assert.match(html, /Åpne PlayerHQ/);
});

test("EP-04: manglende verdi vises som tankestrek, aldri gjetning", () => {
  assert.equal(refusjonTekst({ type: "klipp", igjen: null, av: null }), "Klippet er lagt tilbake");
  const { html } = byggAvbestilling({ ...data, referanse: null, fornavn: "" });
  assert.match(html, />—</);
  assert.match(html, /Hei der\./);
});

test("EP-04: ingen refusjon og feilet refusjon har egen tekst", () => {
  assert.match(refusjonTekst({ type: "ingen" }), /Ingen refusjon/);
  assert.match(refusjonTekst({ type: "feilet" }), /ikke behandles automatisk/);
});

test("EP-04: HTML-tegn i data escapes", () => {
  const { html } = byggAvbestilling({ ...data, fornavn: "<b>x</b>" });
  assert.doesNotMatch(html, /<b>x<\/b>/);
  assert.match(html, /&lt;b&gt;x&lt;\/b&gt;/);
});

test("EP-04: mørk mal bruker mørke tokens", () => {
  const { html } = byggAvbestilling(data, { mork: true });
  assert.match(html, /background:#0c0d0c"/);
});

test("Oslo-tid: sommertid og vintertid uavhengig av server-tidssone", () => {
  const sommer = new Date("2026-09-29T15:00:00Z");
  assert.equal(osloDag(sommer), "Tirsdag 29.09.2026");
  assert.equal(osloKlokke(sommer), "17:00");
  const vinter = new Date("2026-12-15T23:30:00Z");
  assert.equal(osloDagOgTid(vinter), "Onsdag 16.12.2026 kl. 00:30");
});
