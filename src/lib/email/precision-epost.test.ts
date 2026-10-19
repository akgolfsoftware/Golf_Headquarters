import test from "node:test";
import assert from "node:assert/strict";
import { bookingUtkastHtml, kortDag, tidskortHtml } from "./precision-epost";

test("kortDag gir «Tor 8. okt» fra UTC- og lokale felt", () => {
  assert.equal(kortDag(new Date(Date.UTC(2026, 9, 8, 17)), "utc"), "Tor 8. okt");
  assert.equal(kortDag(new Date(2026, 9, 8, 17), "local"), "Tor 8. okt");
});

test("tidskort viser gammel tid gjennomstreket og escaper tekst", () => {
  const h = tidskortHtml({ dag: "Fre 9. okt", tid: "15:00–16:00", linjer: ["<b>x</b>"], gammel: "Før: tor 8. okt kl. 17:00" });
  assert.ok(h.includes("line-through"));
  assert.ok(h.includes("&lt;b&gt;x&lt;/b&gt;"));
});

test("utkast fra Innboks blir avsnitt i bookingmalen, med lenker og uten rå HTML", () => {
  const h = bookingUtkastHtml("Takk for timen", "Hei Jon,\n\nTakk <i>for</i> timen.\n\nKonto: https://akgolf.no/auth/signup");
  assert.ok(h.startsWith("<!DOCTYPE html>"));
  assert.ok(h.includes("&lt;i&gt;for&lt;/i&gt;"));
  assert.ok(h.includes('href="https://akgolf.no/auth/signup"'));
  assert.ok(h.includes("max-width:100%"));
});
