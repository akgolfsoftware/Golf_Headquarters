/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/agencyos/skall-ia.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AGENCYOS_SKALL_TABS, AGENCYOS_UNDER_MEG } from "./skall-ia";

describe("J-C: Kø-fanen er godkjenningskøen", () => {
  // MASTERPLAN 15.1 (30.08.2026): Kø ble én adresse med faner. Railen pekte
  // tidligere på /admin/godkjenninger, som nå bare er én av fem faner der.
  it("rail Kø peker på /admin/ko", () => {
    const ko = AGENCYOS_SKALL_TABS.find((t) => t.id === "ko");
    assert.equal(ko?.href, "/admin/ko");
  });
});

describe("J-A: /meg er lenket under Meg", () => {
  it("Personlig innboks peker på /meg og er ADMIN-only", () => {
    const rad = AGENCYOS_UNDER_MEG.find((r) => r.id === "jarvis-innboks");
    assert.equal(rad?.href, "/meg");
    assert.equal(rad?.adminOnly, true);
  });
});
