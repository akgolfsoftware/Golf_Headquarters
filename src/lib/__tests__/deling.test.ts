import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { vurderDeling } from "@/lib/booking/deling";

const TJENESTE = "svc-2til1";
const ANNEN = "svc-flex50";

// Anders' faste onsdagsøkt: 90 min, to spillere i samme luke.
const start = new Date(2026, 7, 5, 15, 0);
const slutt = new Date(2026, 7, 5, 16, 30);
const ny = { serviceTypeId: TJENESTE, startAt: start, endAt: slutt };

describe("vurderDeling — vanlige økter (kapasitet 1)", () => {
  it("ledig når ingenting overlapper", () => {
    assert.deepEqual(vurderDeling([], ny, 1), { utfall: "ledig" });
  });

  it("kollisjon ved enhver overlapp", () => {
    const eksisterende = [{ serviceTypeId: ANNEN, startAt: start, endAt: slutt }];
    assert.deepEqual(vurderDeling(eksisterende, ny, 1), { utfall: "kollisjon" });
  });

  it("kollisjon selv om det er samme tjeneste og tid", () => {
    const eksisterende = [{ serviceTypeId: TJENESTE, startAt: start, endAt: slutt }];
    assert.deepEqual(vurderDeling(eksisterende, ny, 1), { utfall: "kollisjon" });
  });
});

describe("vurderDeling — 2-til-1 (kapasitet 2)", () => {
  it("spiller nummer to slipper inn i samme luke", () => {
    const eksisterende = [{ serviceTypeId: TJENESTE, startAt: start, endAt: slutt }];
    assert.deepEqual(vurderDeling(eksisterende, ny, 2), { utfall: "ledig" });
  });

  it("spiller nummer tre avvises som fullt", () => {
    const eksisterende = [
      { serviceTypeId: TJENESTE, startAt: start, endAt: slutt },
      { serviceTypeId: TJENESTE, startAt: start, endAt: slutt },
    ];
    assert.deepEqual(vurderDeling(eksisterende, ny, 2), {
      utfall: "fullt",
      antall: 2,
      kapasitet: 2,
    });
  });

  it("annen tjeneste i samme tidsrom er ekte kollisjon", () => {
    const eksisterende = [{ serviceTypeId: ANNEN, startAt: start, endAt: slutt }];
    assert.deepEqual(vurderDeling(eksisterende, ny, 2), { utfall: "kollisjon" });
  });

  it("samme tjeneste men forskjøvet start er ekte kollisjon", () => {
    // 50-minutters time som smyger seg inn i parøkta skal ikke tillates.
    const eksisterende = [
      {
        serviceTypeId: TJENESTE,
        startAt: new Date(2026, 7, 5, 15, 30),
        endAt: slutt,
      },
    ];
    assert.deepEqual(vurderDeling(eksisterende, ny, 2), { utfall: "kollisjon" });
  });

  it("samme tjeneste og start, men annen slutt er ekte kollisjon", () => {
    const eksisterende = [
      {
        serviceTypeId: TJENESTE,
        startAt: start,
        endAt: new Date(2026, 7, 5, 16, 0),
      },
    ];
    assert.deepEqual(vurderDeling(eksisterende, ny, 2), { utfall: "kollisjon" });
  });

  it("én fremmed booking blant flere gyldige gir kollisjon", () => {
    const eksisterende = [
      { serviceTypeId: TJENESTE, startAt: start, endAt: slutt },
      { serviceTypeId: ANNEN, startAt: start, endAt: slutt },
    ];
    assert.deepEqual(vurderDeling(eksisterende, ny, 2), { utfall: "kollisjon" });
  });
});

describe("vurderDeling — robusthet", () => {
  it("kapasitet 0 eller negativ behandles som 1", () => {
    const eksisterende = [{ serviceTypeId: TJENESTE, startAt: start, endAt: slutt }];
    assert.deepEqual(vurderDeling(eksisterende, ny, 0), { utfall: "kollisjon" });
    assert.deepEqual(vurderDeling(eksisterende, ny, -3), { utfall: "kollisjon" });
  });

  it("desimalkapasitet rundes ned", () => {
    const eksisterende = [{ serviceTypeId: TJENESTE, startAt: start, endAt: slutt }];
    // 2.9 → 2 plasser: den andre spilleren slipper inn.
    assert.deepEqual(vurderDeling(eksisterende, ny, 2.9), { utfall: "ledig" });
  });

  it("kapasitet 3 slipper inn tre, avviser fjerde", () => {
    const to = [
      { serviceTypeId: TJENESTE, startAt: start, endAt: slutt },
      { serviceTypeId: TJENESTE, startAt: start, endAt: slutt },
    ];
    assert.deepEqual(vurderDeling(to, ny, 3), { utfall: "ledig" });
    assert.deepEqual(vurderDeling([...to, to[0]], ny, 3), {
      utfall: "fullt",
      antall: 3,
      kapasitet: 3,
    });
  });
});
