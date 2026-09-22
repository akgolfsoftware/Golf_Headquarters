/**
 * npx tsx --conditions=react-server --experimental-test-module-mocks --test src/lib/agencyos/ak-stigen-data.test.ts
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AK_STIGEN_TRINN, tidsstreng } from "./ak-stigen-data";

describe("AK-stigen: klokkeslett leses i Oslo, ikke UTC", () => {
  // Feilen som ble rettet 22.09.2026: getUTCHours() viste en sommerøkt kl. 18:00
  // som 16:00, fordi Vercel kjører i UTC. Testen holder tidssonen på plass
  // uavhengig av hvilken tidssone testkjøringen har.
  it("sommertid: 18:00 Oslo vises som 18:00", () => {
    const start = new Date("2026-06-16T16:00:00Z"); // 18:00 i Oslo (CEST)
    const slutt = new Date("2026-06-16T17:30:00Z"); // 19:30 i Oslo
    assert.equal(tidsstreng(start, slutt), "tir 18:00–19:30");
  });

  it("vintertid: 18:00 Oslo vises som 18:00", () => {
    const start = new Date("2026-01-13T17:00:00Z"); // 18:00 i Oslo (CET)
    const slutt = new Date("2026-01-13T19:00:00Z"); // 20:00 i Oslo
    assert.equal(tidsstreng(start, slutt), "tir 18:00–20:00");
  });

  it("ukedagen følger Oslo, ikke UTC", () => {
    // 23:30 Oslo mandag er 21:30 UTC samme dag — men 00:30 Oslo tirsdag er
    // 22:30 UTC mandag, og det er der UTC-lesingen bommet på dagen.
    const start = new Date("2026-06-15T22:30:00Z"); // tirsdag 00:30 i Oslo
    const slutt = new Date("2026-06-15T23:30:00Z"); // tirsdag 01:30 i Oslo
    assert.equal(tidsstreng(start, slutt), "tir 00:30–01:30");
  });
});

describe("AK-stigen: Knøtt er ikke et trinn (Anders 22.09.2026)", () => {
  it("stigen har fire trinn", () => {
    assert.equal(AK_STIGEN_TRINN.length, 4);
    assert.deepEqual(
      AK_STIGEN_TRINN.map((t) => t.navn),
      ["Mini", "Basis", "Utvikling", "Elite"],
    );
  });

  it("hvert trinn har en kanonisk gruppe", () => {
    for (const t of AK_STIGEN_TRINN) {
      assert.ok(t.gruppeNavn.length > 0, `${t.navn} mangler gruppenavn`);
    }
  });
});
