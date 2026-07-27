import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  parseGoogleTidspunkt,
  tilNaivVeggklokke,
} from "@/lib/google-calendar-tid";

// Testene leser med lokale getters (getHours/getDate) — det er nettopp
// kontrakten for «naiv veggklokke». Da gir de samme svar enten de kjøres
// lokalt (Oslo) eller i CI/prod (UTC), som er hele poenget.

describe("tilNaivVeggklokke", () => {
  it("oversetter sommertid-instant til Oslo-veggklokke", () => {
    // 13:00Z = 15:00 i Oslo (CEST, +02:00)
    const d = tilNaivVeggklokke(new Date("2026-07-28T13:00:00Z"));
    assert.equal(d.getHours(), 15);
    assert.equal(d.getMinutes(), 0);
    assert.equal(d.getDate(), 28);
    assert.equal(d.getMonth(), 6);
    assert.equal(d.getFullYear(), 2026);
  });

  it("oversetter vintertid-instant til Oslo-veggklokke", () => {
    // 13:00Z = 14:00 i Oslo (CET, +01:00)
    const d = tilNaivVeggklokke(new Date("2026-01-15T13:00:00Z"));
    assert.equal(d.getHours(), 14);
    assert.equal(d.getDate(), 15);
  });

  it("håndterer døgnskille: 23:30Z i juli er neste dag i Oslo", () => {
    const d = tilNaivVeggklokke(new Date("2026-07-28T23:30:00Z"));
    assert.equal(d.getDate(), 29);
    assert.equal(d.getHours(), 1);
    assert.equal(d.getMinutes(), 30);
  });

  it("gir midnatt som 00, ikke 24", () => {
    // 22:00Z i juli = 00:00 neste dag i Oslo
    const d = tilNaivVeggklokke(new Date("2026-07-28T22:00:00Z"));
    assert.equal(d.getHours(), 0);
    assert.equal(d.getDate(), 29);
  });
});

describe("parseGoogleTidspunkt — tidsbestemte hendelser", () => {
  it("parser dateTime med Oslo-offset til riktig veggklokke", () => {
    const res = parseGoogleTidspunkt({
      dateTime: "2026-07-28T15:00:00+02:00",
      timeZone: "Europe/Oslo",
    });
    assert.ok(res);
    assert.equal(res.heldag, false);
    assert.equal(res.tid.getHours(), 15);
    assert.equal(res.tid.getDate(), 28);
  });

  it("parser UTC-dateTime og oversetter til Oslo-veggklokke", () => {
    const res = parseGoogleTidspunkt({ dateTime: "2026-01-15T08:30:00Z" });
    assert.ok(res);
    // Vintertid: 08:30Z = 09:30 Oslo
    assert.equal(res.tid.getHours(), 9);
    assert.equal(res.tid.getMinutes(), 30);
  });

  it("returnerer null for ugyldig dateTime", () => {
    assert.equal(parseGoogleTidspunkt({ dateTime: "ikke-en-dato" }), null);
  });
});

describe("parseGoogleTidspunkt — heldagshendelser", () => {
  it("parser date til lokal midnatt på riktig kalenderdag", () => {
    const res = parseGoogleTidspunkt({ date: "2026-07-28" });
    assert.ok(res);
    assert.equal(res.heldag, true);
    assert.equal(res.tid.getFullYear(), 2026);
    assert.equal(res.tid.getMonth(), 6);
    assert.equal(res.tid.getDate(), 28);
    assert.equal(res.tid.getHours(), 0);
  });

  it("håndterer vinterdato uten forskyvning av dagen", () => {
    const res = parseGoogleTidspunkt({ date: "2026-01-01" });
    assert.ok(res);
    assert.equal(res.tid.getDate(), 1);
    assert.equal(res.tid.getMonth(), 0);
    assert.equal(res.tid.getHours(), 0);
  });

  it("markerer heldag=true slik at visningen kan skjule klokkeslett", () => {
    const res = parseGoogleTidspunkt({ date: "2026-12-24" });
    assert.ok(res);
    assert.equal(res.heldag, true);
  });

  it("returnerer null for ufullstendig datostreng", () => {
    assert.equal(parseGoogleTidspunkt({ date: "2026-07" }), null);
  });
});

describe("parseGoogleTidspunkt — tomme felter", () => {
  it("returnerer null når feltet mangler helt", () => {
    assert.equal(parseGoogleTidspunkt(undefined), null);
  });

  it("returnerer null når verken date eller dateTime er satt", () => {
    assert.equal(parseGoogleTidspunkt({ timeZone: "Europe/Oslo" }), null);
  });
});
