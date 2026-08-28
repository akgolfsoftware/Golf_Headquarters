import { test } from "node:test";
import assert from "node:assert/strict";
import {
  erForfalt,
  fakturaStatusFraStripe,
  fmtKrNb,
  klippBrukt,
  klippPrikker,
  oreTilKr,
  ytdAvvik,
  ytdAvvikTekst,
  ytdBarPct,
} from "./okonomi-visning";

test("forfalt kommer fra Stripe PAST_DUE eller FAILED — ikke fra gjettet forfallsdato", () => {
  assert.equal(
    fakturaStatusFraStripe({ subscriptionStatus: "PAST_DUE", paymentStatus: "PENDING" }),
    "Forfalt",
  );
  assert.equal(fakturaStatusFraStripe({ paymentStatus: "FAILED" }), "Forfalt");
  assert.equal(fakturaStatusFraStripe({ paymentStatus: "SUCCEEDED" }), "Betalt");
  assert.equal(fakturaStatusFraStripe({ paymentStatus: "PENDING" }), "Sendt");
  assert.equal(fakturaStatusFraStripe({ paymentStatus: "REFUNDED" }), "Betalt");
  assert.equal(fakturaStatusFraStripe({}), "Sendt");
  assert.equal(erForfalt("Forfalt"), true);
  assert.equal(erForfalt("Sendt"), false);
  assert.equal(erForfalt("Betalt"), false);
});

test("fmtKrNb sier mangler for null — aldri 0,00 som gjetning", () => {
  assert.equal(fmtKrNb(null), "mangler");
  assert.equal(fmtKrNb(undefined), "mangler");
  assert.equal(fmtKrNb(0), "0,00 kr");
  assert.match(fmtKrNb(12500), /12[\s\u00a0\u202f]500,00 kr/);
  assert.equal(oreTilKr(1_240_000_00), 1_240_000);
  assert.equal(oreTilKr(null), null);
});

test("YTD-avvik krever både budsjett og resultat", () => {
  assert.equal(ytdAvvik(null, 1_316_400), null);
  assert.equal(ytdAvvik(1_240_000, null), null);
  assert.equal(ytdAvvik(0, 100), null);
  const a = ytdAvvik(1_240_000, 1_316_400);
  assert.ok(a);
  assert.equal(a.kr, 76_400);
  assert.ok(Math.abs(a.pct - 6.16129) < 0.01);
  assert.match(ytdAvvikTekst(a), /over budsjett/);
  assert.equal(ytdAvvikTekst(null), "mangler");
});

test("YTD-bar er null når tak mangler — ingen oppdiktet 94 %", () => {
  assert.equal(ytdBarPct(null, 1_316_400), null);
  assert.equal(ytdBarPct(1_240_000, null), null);
  const pct = ytdBarPct(1_240_000, 1_316_400);
  assert.ok(pct != null && Math.abs(pct - 94.2) < 0.05);
  assert.equal(ytdBarPct(2_000_000, 1_000_000), 100);
});

test("timeklipp: brukt = totalt minus igjen, prikker følger faktisk tak", () => {
  assert.equal(klippBrukt(10, 4), 6);
  assert.equal(klippBrukt(4, 4), 0);
  assert.equal(klippBrukt(0, 0), 0);
  assert.deepEqual(klippPrikker(6, 10).map(Boolean), [
    true, true, true, true, true, true, false, false, false, false,
  ]);
  assert.equal(klippPrikker(2, 4).length, 4);
  assert.equal(klippPrikker(1, 0).length, 0);
});
