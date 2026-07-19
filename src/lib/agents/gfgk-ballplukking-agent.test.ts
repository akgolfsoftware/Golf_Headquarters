/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/agents/gfgk-ballplukking-agent.test.ts
 *
 * Tester den rene funksjonen (ingen DB/nettverk): uke-sammenligningen som
 * styrer "er ballplukking bekreftet for denne Oslo-uka?", pluss
 * runBallplukkingSjekk/bekreftBallplukking med mocket Prisma + varsling
 * (samme mock-mønster som resten av agent-testene i repoet).
 */
import test from "node:test";
import assert from "node:assert/strict";
import { harBekreftetIUka } from "./gfgk-ballplukking-agent";

test("harBekreftetIUka: true når bekreftelse finnes samme Oslo-uke", () => {
  // Onsdag 2026-07-22 (sjekk-dagen), bekreftet tirsdag samme uke.
  const now = new Date("2026-07-22T08:00:00Z");
  const bekreftelser = [new Date("2026-07-21T09:00:00Z")];
  assert.equal(harBekreftetIUka(bekreftelser, now), true);
});

test("harBekreftetIUka: false når ingen bekreftelser finnes", () => {
  const now = new Date("2026-07-22T08:00:00Z");
  assert.equal(harBekreftetIUka([], now), false);
});

test("harBekreftetIUka: false når bekreftelsen er fra forrige uke", () => {
  const now = new Date("2026-07-22T08:00:00Z");
  const bekreftelser = [new Date("2026-07-14T09:00:00Z")]; // forrige uke (tirsdag)
  assert.equal(harBekreftetIUka(bekreftelser, now), false);
});

test("harBekreftetIUka: false når bekreftelsen er fra neste uke", () => {
  const now = new Date("2026-07-22T08:00:00Z");
  const bekreftelser = [new Date("2026-07-28T09:00:00Z")]; // neste uke (tirsdag)
  assert.equal(harBekreftetIUka(bekreftelser, now), false);
});

test("harBekreftetIUka: true når minst én av flere bekreftelser er i riktig uke", () => {
  const now = new Date("2026-07-22T08:00:00Z");
  const bekreftelser = [new Date("2026-07-14T09:00:00Z"), new Date("2026-07-20T07:00:00Z")];
  assert.equal(harBekreftetIUka(bekreftelser, now), true);
});

// Eksplisitt grensetilfelle rundt ukeskiftet (mandag = ny uke i Oslo-konvensjonen).
test("harBekreftetIUka: bekreftelse tirsdag, sjekk onsdag samme uke = true", () => {
  const tirsdag = new Date("2026-07-21T10:00:00Z");
  const onsdag = new Date("2026-07-22T08:00:00Z");
  assert.equal(harBekreftetIUka([tirsdag], onsdag), true);
});

test("harBekreftetIUka: bekreftelse forrige onsdag, sjekk denne onsdag = false", () => {
  const forrigeOnsdag = new Date("2026-07-15T08:00:00Z");
  const denneOnsdag = new Date("2026-07-22T08:00:00Z");
  assert.equal(harBekreftetIUka([forrigeOnsdag], denneOnsdag), false);
});

test("harBekreftetIUka: bekreftelse mandag (ny uke) etter forrige søndag telles ikke som samme uke", () => {
  // Søndag 2026-07-19 er slutten av forrige uke, mandag 2026-07-20 er starten
  // på ny uke — sjekk onsdag 2026-07-22 skal KUN telle bekreftelser fra og
  // med mandag 2026-07-20.
  const sondagForrigeUke = new Date("2026-07-19T20:00:00Z");
  const onsdag = new Date("2026-07-22T08:00:00Z");
  assert.equal(harBekreftetIUka([sondagForrigeUke], onsdag), false);

  const mandagDenneUka = new Date("2026-07-20T05:00:00Z");
  assert.equal(harBekreftetIUka([mandagDenneUka], onsdag), true);
});
