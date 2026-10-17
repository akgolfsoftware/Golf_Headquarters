import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  akseFraPyramide,
  erKalenderLag,
  filtrerCoach,
  iCoachKolonne,
  maskerForSeer,
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

describe("kalender-lag · erKalenderLag", () => {
  it("godtar de fem lagene og avviser andre", () => {
    assert.equal(erKalenderLag("BOOKING"), true);
    assert.equal(erKalenderLag("OEKTER"), true);
    assert.equal(erKalenderLag("booking"), false);
    assert.equal(erKalenderLag("GOOGLE"), false);
  });
});

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

// --- AG-05 pakke 3 (natt 17.10): coach, akse og assistant coach -----------------

const coachHendelser: KalenderHendelse[] = [
  { id: "booking-a", lag: "BOOKING", dato: "2026-10-05", tittel: "Kari Prøvesen", undertekst: "Privattime", startMin: 600, sluttMin: 660, heldag: false, coachId: "ass", akse: "tek" },
  { id: "booking-b", lag: "BOOKING", dato: "2026-10-05", tittel: "Ola Testesen", undertekst: "Performance Pro", startMin: 720, sluttMin: 810, heldag: false, coachId: "head", akse: null, href: "/admin/bookinger/b" },
  { id: "okt-g", lag: "OEKTER", dato: "2026-10-05", tittel: "Nærspill", startMin: 960, sluttMin: 1050, heldag: false, coachId: "head", gruppe: true, antallSpillere: 8 },
  { id: "okt-e", lag: "OEKTER", dato: "2026-10-05", tittel: "Wedge 50–90 m", undertekst: "Per Prøve", startMin: 540, sluttMin: 600, heldag: false, coachId: "head" },
  { id: "skole-1", lag: "SKOLE", dato: "2026-10-05", tittel: "Heldagsprøve", startMin: null, sluttMin: null, heldag: true },
];

it("maskerForSeer: head coach ser alt uendret", () => {
  assert.deepEqual(maskerForSeer(coachHendelser, { id: "head", erHeadCoach: true }), coachHendelser);
});

it("maskerForSeer: assistant coach ser egne bookinger, gruppeøkter og lag uten coach", () => {
  const ut = maskerForSeer(coachHendelser, { id: "ass", erHeadCoach: false });
  const ider = ut.map((h) => h.id);
  assert.ok(ider.includes("booking-a"));
  assert.ok(ider.includes("okt-g"));
  assert.ok(ider.includes("skole-1"));
  assert.equal(ut.find((h) => h.id === "booking-a")?.tittel, "Kari Prøvesen");
});

it("maskerForSeer: andre coachers privattime blir «Opptatt» uten navn, tjeneste eller lenke", () => {
  const ut = maskerForSeer(coachHendelser, { id: "ass", erHeadCoach: false });
  const b = ut.find((h) => h.id === "booking-b");
  assert.ok(b);
  assert.equal(b.tittel, "Opptatt");
  assert.equal(b.opptatt, true);
  assert.equal(b.undertekst, undefined);
  assert.equal(b.href, undefined);
  assert.equal(b.startMin, 720);
  assert.ok(!JSON.stringify(b).includes("Ola"));
});

it("maskerForSeer: andre coachers enkeltøkter tas ut for assistant coach", () => {
  const ut = maskerForSeer(coachHendelser, { id: "ass", erHeadCoach: false });
  assert.equal(ut.some((h) => h.id === "okt-e"), false);
});

it("filtrerCoach: bare valgt coach, lag uten coach står", () => {
  assert.deepEqual(filtrerCoach(coachHendelser, "ass").map((h) => h.id), ["booking-a", "skole-1"]);
  assert.equal(filtrerCoach(coachHendelser, null).length, coachHendelser.length);
});

it("iCoachKolonne: bookinger og gruppeøkter, ikke enkeltøkter eller heldag", () => {
  assert.deepEqual(coachHendelser.filter(iCoachKolonne).map((h) => h.id), ["booking-a", "booking-b", "okt-g"]);
});

it("akseFraPyramide: kjente akser, ellers null", () => {
  assert.equal(akseFraPyramide("TEK"), "tek");
  assert.equal(akseFraPyramide("turn"), "turn");
  assert.equal(akseFraPyramide("TULL"), null);
  assert.equal(akseFraPyramide(null), null);
});
