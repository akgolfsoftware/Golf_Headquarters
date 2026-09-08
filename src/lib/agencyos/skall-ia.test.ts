/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/agencyos/skall-ia.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import {
  AGENCYOS_SKALL_TABS,
  AGENCYOS_UNDER_MEG,
  erAgencyosFullskjerm,
  skallAktivFraPath,
} from "./skall-ia";

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

describe("AX-01 hull: analyse og oppsett lyser fane", () => {
  it("/admin/analyse lyser Stall", () => {
    assert.equal(skallAktivFraPath("/admin/analyse"), "stall");
    assert.equal(skallAktivFraPath("/admin/analyse/stall"), "stall");
    assert.equal(skallAktivFraPath("/admin/analysere"), "stall");
  });

  it("/admin/oppsett lyser Meg", () => {
    assert.equal(skallAktivFraPath("/admin/oppsett"), "meg");
    assert.equal(skallAktivFraPath("/admin/settings"), "meg");
    assert.equal(skallAktivFraPath("/admin/settings/api"), "meg");
  });

  it("eksisterende destinasjoner er uendret", () => {
    assert.equal(skallAktivFraPath("/admin/spillere"), "stall");
    assert.equal(skallAktivFraPath("/admin/plan"), "workbench");
    assert.equal(skallAktivFraPath("/admin/ko"), "ko");
    assert.equal(skallAktivFraPath("/admin/agenticos"), "jarvis");
    assert.equal(skallAktivFraPath("/admin/profile"), "meg");
  });
});

describe("AX-01 hull: live er fullskjerm", () => {
  it("pathname matcher fullskjerm-prefikset og lyser ingen fane", () => {
    assert.equal(erAgencyosFullskjerm("/admin/agencyos/live"), true);
    assert.equal(erAgencyosFullskjerm("/admin/agencyos/live/abc"), true);
    assert.equal(erAgencyosFullskjerm("/admin/agencyos"), false);
    assert.equal(skallAktivFraPath("/admin/agencyos/live"), "");
    assert.equal(skallAktivFraPath("/admin/agencyos/live/abc"), "");
  });

  it("siden ligger i (fullscreen)-gruppen, ikke under agencyos-skallet", () => {
    assert.equal(existsSync("src/app/admin/(fullscreen)/agencyos/live/page.tsx"), true);
    assert.equal(existsSync("src/app/admin/agencyos/live/page.tsx"), false);
  });
});
