/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/agents/tripletex-lonn-agent.test.ts
 *
 * Tester de rene funksjonene (ingen DB/nettverk): Oslo-dato-beregningen som
 * styrer "er dette den 3./6.?", og purre-logikken (bekreftet vs. ikke).
 * runLonnSjekkliste/runLonnPurring/bekreftLonn krever Prisma + varsling og
 * testes ikke her.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { osloDagIManeden, osloManedTekst, harBekreftetIManeden } from "./tripletex-lonn-agent";

test("osloDagIManeden leser norsk kalenderdag, ikke UTC-dag", () => {
  // 2026-07-02T23:30:00Z er sommertid i Oslo (UTC+2) → 2026-07-03T01:30 lokalt.
  // En rå date.getUTCDate() ville gitt 2 — den kjente UTC-vs-Oslo-fellen
  // (se .claude/rules/gotchas.md "Tidssone").
  const d = new Date("2026-07-02T23:30:00Z");
  assert.equal(osloDagIManeden(d), 3);
});

test("osloDagIManeden gir 6 midt på dagen (ingen tvil om tidssone)", () => {
  const d = new Date("2026-07-06T12:00:00Z");
  assert.equal(osloDagIManeden(d), 6);
});

test("osloDagIManeden håndterer vintertid (UTC+1) korrekt", () => {
  // 2026-01-05T22:30:00Z er vintertid i Oslo (UTC+1) → 2026-01-05T23:30 lokalt,
  // fortsatt 5. — men 23:00Z ville vippet over til 6. i sommertid, så testen
  // dekker at offset-valget faktisk brukes (ikke en hardkodet +1 eller +2).
  const d = new Date("2026-01-05T22:30:00Z");
  assert.equal(osloDagIManeden(d), 5);
});

test("osloManedTekst formaterer norsk måned+år", () => {
  const d = new Date("2026-07-15T10:00:00Z");
  assert.equal(osloManedTekst(d), "juli 2026");
});

test("harBekreftetIManeden: true når bekreftelse finnes samme Oslo-måned", () => {
  const now = new Date("2026-07-06T08:00:00Z");
  const bekreftelser = [new Date("2026-07-04T09:00:00Z")];
  assert.equal(harBekreftetIManeden(bekreftelser, now), true);
});

test("harBekreftetIManeden: false når ingen bekreftelser finnes", () => {
  const now = new Date("2026-07-06T08:00:00Z");
  assert.equal(harBekreftetIManeden([], now), false);
});

test("harBekreftetIManeden: false når bekreftelsen er fra forrige måned", () => {
  const now = new Date("2026-07-06T08:00:00Z");
  const bekreftelser = [new Date("2026-06-04T09:00:00Z")];
  assert.equal(harBekreftetIManeden(bekreftelser, now), false);
});

test("harBekreftetIManeden: false når bekreftelsen er fra neste måned", () => {
  const now = new Date("2026-07-06T08:00:00Z");
  const bekreftelser = [new Date("2026-08-01T09:00:00Z")];
  assert.equal(harBekreftetIManeden(bekreftelser, now), false);
});

test("harBekreftetIManeden: true når minst én av flere bekreftelser er i riktig måned", () => {
  const now = new Date("2026-07-06T08:00:00Z");
  const bekreftelser = [new Date("2026-06-20T09:00:00Z"), new Date("2026-07-01T00:30:00Z")];
  assert.equal(harBekreftetIManeden(bekreftelser, now), true);
});

// Presist grensetilfelle: en bekreftelse skrevet 2026-06-30T23:00:00Z er ekte
// Oslo-klokke 2026-07-01T01:00 (sommertid, UTC+2) — altså allerede juli i
// Oslo, selv om UTC-datoen fortsatt viser 30. juni. En instant-range-sjekk
// bygget på "naiv lokal midnatt" (uke-helpers.ts startOfMonth/endOfMonth)
// ville bommet på nøyaktig dette tilfellet (se commit-historikk) — denne
// testen beviser at den ekte Oslo-kalender-sammenligningen ikke gjør det.
test("harBekreftetIManeden: bekreftelse rett etter ekte Oslo-midnatt (UTC-dato fortsatt forrige dag) telles som ny måned", () => {
  const now = new Date("2026-07-06T08:00:00Z");
  const bekreftelser = [new Date("2026-06-30T23:00:00Z")]; // = 2026-07-01T01:00 Oslo
  assert.equal(harBekreftetIManeden(bekreftelser, now), true);
});

test("harBekreftetIManeden: bekreftelse rett før ekte Oslo-midnatt (fortsatt forrige måned) telles ikke", () => {
  const now = new Date("2026-07-06T08:00:00Z");
  const bekreftelser = [new Date("2026-06-30T21:00:00Z")]; // = 2026-06-30T23:00 Oslo — fortsatt juni
  assert.equal(harBekreftetIManeden(bekreftelser, now), false);
});
