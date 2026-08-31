import test from "node:test";
import assert from "node:assert/strict";
import { nesteOktLabel, osloDagDiff, prikkForBolk, sisteAktivitetLabel } from "./stall-rad";

/**
 * MASTERPLAN 15.11 (beslutning 6.5): raden viser navn, neste økt, siste
 * aktivitet, én prikk. Etikettene og prikk-mappingen låses her — inkludert
 * Oslo-korrektheten rundt midnatt (Vercel kjører UTC, datomatte-gotchaen).
 */

// 31.08.2026 kl. 21:00 Oslo (CEST, UTC+2) = 19:00Z.
const NAA = new Date("2026-08-31T19:00:00Z");

test("osloDagDiff: Oslo-døgn, ikke UTC-døgn", () => {
  // 23:30 Oslo i kveld = 21:30Z samme UTC-dag; 00:30 Oslo i natt = 22:30Z SAMME UTC-dag,
  // men neste Oslo-dag — det er akkurat dette rå UTC-matte bommer på.
  assert.equal(osloDagDiff(NAA, new Date("2026-08-31T21:30:00Z")), 0);
  assert.equal(osloDagDiff(NAA, new Date("2026-08-31T22:30:00Z")), 1);
});

test("nesteOktLabel: i dag / i morgen / ukedag / ingen", () => {
  assert.equal(nesteOktLabel(null, NAA), "Ingen økt planlagt");
  assert.equal(nesteOktLabel(new Date("2026-08-31T20:00:00Z"), NAA), "Neste: i dag 22.00");
  assert.equal(nesteOktLabel(new Date("2026-09-01T05:30:00Z"), NAA), "Neste: i morgen 07.30");
  // Fredag 4. september kl. 13.00 Oslo.
  assert.equal(nesteOktLabel(new Date("2026-09-04T11:00:00Z"), NAA), "Neste: fre 13.00");
});

test("sisteAktivitetLabel: økt-kilden vinner og navngis ærlig", () => {
  assert.equal(sisteAktivitetLabel(new Date("2026-08-31T06:00:00Z"), 5, NAA), "økt i dag");
  assert.equal(sisteAktivitetLabel(new Date("2026-08-30T15:00:00Z"), null, NAA), "økt i går");
  assert.equal(sisteAktivitetLabel(new Date("2026-08-23T15:00:00Z"), 2, NAA), "økt 8 dg siden");
});

test("sisteAktivitetLabel: uten økt sies innlogging som innlogging", () => {
  assert.equal(sisteAktivitetLabel(null, 0, NAA), "innlogget i dag");
  assert.equal(sisteAktivitetLabel(null, 1, NAA), "innlogget i går");
  assert.equal(sisteAktivitetLabel(null, 8, NAA), "innlogget 8 dg siden");
  assert.equal(sisteAktivitetLabel(null, null, NAA), "aldri aktiv");
});

test("prikkForBolk: trenger=fylt, hviler=åpen, planen=ingen", () => {
  assert.equal(prikkForBolk("trenger"), "fylt");
  assert.equal(prikkForBolk("hviler"), "aapen");
  assert.equal(prikkForBolk("planen"), "ingen");
});
