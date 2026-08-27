import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  grupperPerDato,
  klokkeslett,
  sorterDag,
  synlige,
  type KalenderHendelse,
  type KalenderLag,
} from "./kalender-lag";

function hendelse(
  id: string,
  lag: KalenderLag,
  dato: string,
  startMin: number | null,
  tittel = id,
): KalenderHendelse {
  return {
    id,
    lag,
    dato,
    tittel,
    startMin,
    sluttMin: startMin === null ? null : startMin + 60,
    heldag: startMin === null,
  };
}

describe("kalender-lag · synlige", () => {
  it("beholder kun hendelser fra synlige lag", () => {
    const hendelser = [
      hendelse("a", "OEKTER", "2026-08-22", 540),
      hendelse("b", "SKOLE", "2026-08-22", 480),
      hendelse("c", "BOOKING", "2026-08-22", 600),
    ];
    const ut = synlige(hendelser, new Set(["OEKTER", "BOOKING"]));
    assert.deepEqual(
      ut.map((h) => h.id),
      ["a", "c"],
    );
  });

  it("tom mengde synlige lag gir tom liste", () => {
    const hendelser = [hendelse("a", "OEKTER", "2026-08-22", 540)];
    assert.equal(synlige(hendelser, new Set()).length, 0);
  });
});

describe("kalender-lag · sorterDag", () => {
  it("sorterer etter starttid", () => {
    const hendelser = [
      hendelse("sen", "OEKTER", "2026-08-22", 900),
      hendelse("tidlig", "SKOLE", "2026-08-22", 480),
    ];
    const ut = sorterDag(hendelser);
    assert.deepEqual(
      ut.map((h) => h.id),
      ["tidlig", "sen"],
    );
  });

  it("heldagshendelser (startMin null) kommer først", () => {
    const hendelser = [
      hendelse("okt", "OEKTER", "2026-08-22", 480),
      hendelse("frist", "TESTER", "2026-08-22", null),
    ];
    const ut = sorterDag(hendelser);
    assert.deepEqual(
      ut.map((h) => h.id),
      ["frist", "okt"],
    );
  });

  it("bevarer originallisten (muterer ikke)", () => {
    const hendelser = [hendelse("b", "OEKTER", "2026-08-22", 900), hendelse("a", "SKOLE", "2026-08-22", 480)];
    const original = [...hendelser];
    sorterDag(hendelser);
    assert.deepEqual(hendelser, original);
  });
});

describe("kalender-lag · grupperPerDato", () => {
  it("grupperer per dato og sorterer innad", () => {
    const hendelser = [
      hendelse("man-sen", "OEKTER", "2026-08-17", 900),
      hendelse("man-tidlig", "SKOLE", "2026-08-17", 480),
      hendelse("tir", "BOOKING", "2026-08-18", 600),
    ];
    const grupper = grupperPerDato(hendelser);
    assert.equal(grupper.size, 2);
    assert.deepEqual(
      grupper.get("2026-08-17")!.map((h) => h.id),
      ["man-tidlig", "man-sen"],
    );
    assert.deepEqual(
      grupper.get("2026-08-18")!.map((h) => h.id),
      ["tir"],
    );
  });

  it("tom liste gir tomt kart", () => {
    assert.equal(grupperPerDato([]).size, 0);
  });
});

describe("kalender-lag · klokkeslett", () => {
  it("formaterer med punktum, ikke kolon", () => {
    assert.equal(klokkeslett(9 * 60), "09.00");
    assert.equal(klokkeslett(14 * 60 + 30), "14.30");
  });

  it("padder enkeltsifret time og minutt", () => {
    assert.equal(klokkeslett(5), "00.05");
  });
});
