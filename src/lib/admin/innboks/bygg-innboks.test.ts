import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { apneSaker, byggInnboks, iFilter, innboksHaster, sorterInnboks, tellFilter, type InnboksKilder } from "./bygg-innboks";
import { innboksHref, lesInnboksFilter } from "./filter";

const now = new Date("2026-09-29T08:00:00Z");
const timerSiden = (t: number) => new Date(now.getTime() - t * 3_600_000).toISOString();

const tomme: InnboksKilder = { saker: [], godkjenn: [], oppfolging: [], sporsmal: [], epost: [], epostSendt: [], now };

const sporsmal = (id: string, timer: number) => ({ id, spillerId: "s1", spiller: "Test Spiller", tittel: "Spørsmål", tekst: "Tekst", opprettetIso: timerSiden(timer) });
const oppf = (id: string, status: "risk" | "watch" | "check" | "ok") => ({
  id, navn: "Test", epost: "t@example.com", signalTekst: "Ingen aktiv plan", stats: [], tags: [], siden: "aldri innlogget", dagerSidenInnlogging: null, status,
});
const caddie = (id: string, title: string) => ({
  id, actionType: "CADDIE_DRAFT", playerId: "s1", who: "Test", title, detail: "Utkast", signalKind: null, signalValue: null,
  diffPreview: null, when: "i dag", urgent: false, lowRisk: false, kilde: "caddie" as const, opprettetIso: timerSiden(1),
});

describe("Innboks: haster-regelen for bjella", () => {
  it("spørsmål fra spiller haster først etter 24 timer", () => {
    assert.equal(innboksHaster(byggInnboks({ ...tomme, sporsmal: [sporsmal("q1", 20)] })), false);
    const liste = byggInnboks({ ...tomme, sporsmal: [sporsmal("q1", 25)] });
    assert.equal(innboksHaster(liste), true);
    assert.equal(liste[0]!.haster, true);
  });

  it("Risiko i oppfølgingen haster, Følg med og Løst gjør det ikke", () => {
    assert.equal(innboksHaster(byggInnboks({ ...tomme, oppfolging: [oppf("a", "watch"), oppf("b", "ok")] })), false);
    assert.equal(innboksHaster(byggInnboks({ ...tomme, oppfolging: [oppf("a", "risk")] })), true);
  });
});

describe("Innboks: liste og faner", () => {
  it("haster først, deretter nyeste", () => {
    const liste = sorterInnboks(byggInnboks({ ...tomme, sporsmal: [sporsmal("gammel", 30), sporsmal("ny", 1), sporsmal("midt", 5)] }));
    assert.deepEqual(liste.map((p) => p.key), ["sporsmal:gammel", "sporsmal:ny", "sporsmal:midt"]);
  });

  it("Løst vises under Oppfølging, men ikke i Alle eller i tallet", () => {
    const liste = byggInnboks({ ...tomme, oppfolging: [oppf("a", "check"), oppf("b", "ok")] });
    assert.equal(apneSaker(liste), 1);
    assert.equal(liste.filter((p) => iFilter(p, "oppfolging")).length, 2);
  });

  it("mange like Caddie-utkast blir én samlerad i Alle, men hver for seg under Caddie-forslag", () => {
    const liste = byggInnboks({ ...tomme, godkjenn: [caddie("c1", "Melding"), caddie("c2", "Melding"), caddie("c3", "Plan")] });
    assert.equal(liste.filter((p) => iFilter(p, "alle")).length, 2);
    assert.equal(tellFilter(liste, "caddie"), 3);
    assert.equal(tellFilter(liste, "godkjenn"), 3);
  });
});

describe("Innboks: adresser", () => {
  it("gamle filterverdier treffer riktig fane", () => {
    assert.equal(lesInnboksFilter("varsler"), "varsler");
    assert.equal(lesInnboksFilter("meldinger"), "varsler");
    assert.equal(lesInnboksFilter("godkjenninger"), "godkjenn");
    assert.equal(lesInnboksFilter("tull"), "alle");
    assert.equal(lesInnboksFilter(undefined), "alle");
  });

  it("beholder andre søkeparametre når fanen byttes", () => {
    assert.equal(innboksHref("oppfolging", { filter: "x", spiller: "abc" }), "/admin/innboks?spiller=abc&filter=oppfolging");
    assert.equal(innboksHref("alle", {}), "/admin/innboks");
  });
});
