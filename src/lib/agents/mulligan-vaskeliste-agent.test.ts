/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/agents/mulligan-vaskeliste-agent.test.ts
 *
 * Tester den rene funksjonen (ingen DB/nettverk): uke-sammenligningen som
 * styrer "er vaskelista bekreftet for denne Oslo-uka?". Mocket
 * Prisma+runVaskelisteSjekk/bekreftVaskeliste-testene ligger i
 * src/lib/__tests__/agents/mulligan-vaskeliste-agent.test.ts (samme
 * to-deling som gfgk-ballplukking-agent).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { harBekreftetIUka } from "./mulligan-vaskeliste-agent";

test("harBekreftetIUka: true når bekreftelse finnes samme Oslo-uke", () => {
  // Mandag 2026-07-20 (sjekk-dagen), bekreftet samme uke.
  const now = new Date("2026-07-20T08:00:00Z");
  const bekreftelser = [new Date("2026-07-21T09:00:00Z")];
  assert.equal(harBekreftetIUka(bekreftelser, now), true);
});

test("harBekreftetIUka: false når ingen bekreftelser finnes", () => {
  const now = new Date("2026-07-20T08:00:00Z");
  assert.equal(harBekreftetIUka([], now), false);
});

test("harBekreftetIUka: false når bekreftelsen er fra forrige uke", () => {
  const now = new Date("2026-07-20T08:00:00Z");
  const bekreftelser = [new Date("2026-07-14T09:00:00Z")]; // forrige uke (tirsdag)
  assert.equal(harBekreftetIUka(bekreftelser, now), false);
});

test("harBekreftetIUka: false når bekreftelsen er fra neste uke", () => {
  const now = new Date("2026-07-20T08:00:00Z");
  const bekreftelser = [new Date("2026-07-28T09:00:00Z")]; // neste uke (tirsdag)
  assert.equal(harBekreftetIUka(bekreftelser, now), false);
});

test("harBekreftetIUka: true når minst én av flere bekreftelser er i riktig uke", () => {
  const now = new Date("2026-07-20T08:00:00Z");
  const bekreftelser = [new Date("2026-07-14T09:00:00Z"), new Date("2026-07-22T07:00:00Z")];
  assert.equal(harBekreftetIUka(bekreftelser, now), true);
});

// Eksplisitt grensetilfelle rundt ukeskiftet (mandag = ny uke i Oslo-konvensjonen).
test("harBekreftetIUka: bekreftelse mandag, sjekk mandag samme uke = true", () => {
  const mandag = new Date("2026-07-20T10:00:00Z");
  assert.equal(harBekreftetIUka([mandag], mandag), true);
});

test("harBekreftetIUka: bekreftelse forrige mandag, sjekk denne mandag = false", () => {
  const forrigeMandag = new Date("2026-07-13T08:00:00Z");
  const denneMandag = new Date("2026-07-20T08:00:00Z");
  assert.equal(harBekreftetIUka([forrigeMandag], denneMandag), false);
});

test("harBekreftetIUka: bekreftelse søndag (forrige uke) telles ikke som samme uke som mandagen etter", () => {
  // Søndag 2026-07-19 er slutten av forrige uke, mandag 2026-07-20 er starten
  // på ny uke — sjekk mandag 2026-07-20 skal KUN telle bekreftelser fra og
  // med mandag 2026-07-20.
  const sondagForrigeUke = new Date("2026-07-19T20:00:00Z");
  const mandag = new Date("2026-07-20T08:00:00Z");
  assert.equal(harBekreftetIUka([sondagForrigeUke], mandag), false);

  const mandagDenneUka = new Date("2026-07-20T05:00:00Z");
  assert.equal(harBekreftetIUka([mandagDenneUka], mandag), true);
});
