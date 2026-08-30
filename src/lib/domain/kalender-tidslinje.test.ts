import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  TIDSLINJE_START_MIN,
  TIDSLINJE_SLUTT_MIN,
  tidslinjeKolonner,
  tidslinjeTopp,
  type TidslinjeHendelse,
} from "./kalender-tidslinje";

function min(s: string): number {
  const [h, m] = s.split(":").map(Number);
  return h * 60 + m;
}

function h(id: string, fra: string | null, til: string | null): TidslinjeHendelse {
  return { id, startMin: fra === null ? null : min(fra), sluttMin: til === null ? null : min(til) };
}

describe("kalender-tidslinje · tidslinjeTopp", () => {
  it("gir 0 ved starttid", () => {
    assert.equal(tidslinjeTopp(TIDSLINJE_START_MIN), 0);
  });

  it("klemmer til vinduet — før start blir 0, etter slutt blir maks", () => {
    assert.equal(tidslinjeTopp(TIDSLINJE_START_MIN - 60), 0);
    assert.equal(tidslinjeTopp(TIDSLINJE_SLUTT_MIN + 60), tidslinjeTopp(TIDSLINJE_SLUTT_MIN));
  });

  it("er lineær i minutter (64px per time)", () => {
    const enTime = tidslinjeTopp(TIDSLINJE_START_MIN + 60) - tidslinjeTopp(TIDSLINJE_START_MIN);
    assert.ok(Math.abs(enTime - 64) < 0.01);
  });
});

describe("kalender-tidslinje · tidslinjeKolonner", () => {
  it("ikke-overlappende hendelser får hver sin fulle bredde (avKolonner: 1)", () => {
    const plassert = tidslinjeKolonner([h("a", "09:00", "10:00"), h("b", "11:00", "12:00")]);
    assert.equal(plassert.length, 2);
    for (const p of plassert) {
      assert.equal(p.kolonne, 0);
      assert.equal(p.avKolonner, 1);
    }
  });

  it("to overlappende hendelser side om side (AG-11: Nora Vik + Øyvind Rohjan 09.00)", () => {
    const plassert = tidslinjeKolonner([h("nora", "09:00", "09:27"), h("oyvind", "09:20", "09:32")]);
    assert.equal(plassert.length, 2);
    const kolonner = new Set(plassert.map((p) => p.kolonne));
    assert.deepEqual([...kolonner].sort(), [0, 1]);
    for (const p of plassert) assert.equal(p.avKolonner, 2);
  });

  it("berøring (slutt = neste start) teller ikke som overlapp", () => {
    const plassert = tidslinjeKolonner([h("a", "09:00", "10:00"), h("b", "10:00", "11:00")]);
    for (const p of plassert) assert.equal(p.avKolonner, 1);
  });

  it("tre-veis overlapp får tre kolonner, og en fjerde som ikke overlapper står alene etterpå", () => {
    const plassert = tidslinjeKolonner([
      h("a", "09:00", "10:00"),
      h("b", "09:15", "09:45"),
      h("c", "09:30", "10:15"),
      h("d", "11:00", "11:30"),
    ]);
    const abc = plassert.filter((p) => p.h.id !== "d");
    for (const p of abc) assert.equal(p.avKolonner, 3);
    const d = plassert.find((p) => p.h.id === "d");
    assert.equal(d?.avKolonner, 1);
  });

  it("mangler sluttMin — behandles som 30 min varighet (samme fallback som DagTidslinje)", () => {
    const plassert = tidslinjeKolonner([h("a", "09:00", null), h("b", "09:15", "09:45")]);
    assert.equal(plassert.length, 2);
    assert.ok(plassert.every((p) => p.avKolonner === 2));
  });

  it("gjenbruker en frigjort kolonne i stedet for å åpne en ny (laveste ledige først)", () => {
    // a: 09.00–09.30, b: 09.10–09.40 (overlapper a → kolonne 1), c: 09.35–10.00 (a er ferdig, gjenbruker kolonne 0)
    const plassert = tidslinjeKolonner([h("a", "09:00", "09:30"), h("b", "09:10", "09:40"), h("c", "09:35", "10:00")]);
    const kolonneFor = (id: string) => plassert.find((p) => p.h.id === id)?.kolonne;
    assert.equal(kolonneFor("a"), 0);
    assert.equal(kolonneFor("b"), 1);
    assert.equal(kolonneFor("c"), 0);
  });

  it("tom liste gir tom liste", () => {
    assert.deepEqual(tidslinjeKolonner([]), []);
  });
});
