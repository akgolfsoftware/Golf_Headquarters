/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/agents/tripletex-maanedsavslutning-agent.test.ts
 *
 * Tester den rene periode-beregningen (Oslo-korrekt "forrige måned").
 * runMaanedsavslutning selv krever Prisma + Tripletex-klient og testes ikke her.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { forrigeManedPeriode } from "./tripletex-maanedsavslutning-agent";

test("forrigeManedPeriode: kjørt i august gir juli-perioden", () => {
  const now = new Date("2026-08-02T05:00:00Z"); // maanedsrapport-cron-tidspunkt
  const { start, sluttEksklusiv } = forrigeManedPeriode(now);
  assert.equal(start.getFullYear(), 2026);
  assert.equal(start.getMonth(), 6); // juli = index 6
  assert.equal(start.getDate(), 1);
  assert.equal(sluttEksklusiv.getMonth(), 7); // august = index 7
  assert.equal(sluttEksklusiv.getDate(), 1);
});

test("forrigeManedPeriode: kjørt i januar gir desember i fjor (årsskifte)", () => {
  const now = new Date("2027-01-02T05:00:00Z");
  const { start, sluttEksklusiv } = forrigeManedPeriode(now);
  assert.equal(start.getFullYear(), 2026);
  assert.equal(start.getMonth(), 11); // desember
  assert.equal(start.getDate(), 1);
  assert.equal(sluttEksklusiv.getFullYear(), 2027);
  assert.equal(sluttEksklusiv.getMonth(), 0); // januar
});

test("forrigeManedPeriode: robust mot UTC-vs-Oslo ved månedsskifte (sen kveld UTC)", () => {
  // 2026-07-31T23:30:00Z er allerede 2026-08-01 i Oslo (sommertid, UTC+2) —
  // "forrige måned" sett fra Oslo skal da være juli, ikke juni.
  const now = new Date("2026-07-31T23:30:00Z");
  const { start } = forrigeManedPeriode(now);
  assert.equal(start.getMonth(), 6); // juli
});
