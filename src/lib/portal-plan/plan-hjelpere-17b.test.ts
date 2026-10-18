import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggFysiskProgram, fysTestRader, mengdeTekst, type FysRadInn } from "./fysisk-program";
import { byggUke, fasteAvtaler, forekomster } from "./opptatt-uke";
import { periodeTall, timerTekst } from "./periode-ferdig";
import { PLAN_HJELPERE_VIDERESENDING, periodeFerdigHref } from "@/lib/portal/plan-hjelpere-videresending";

const rad = (o: Partial<FysRadInn> = {}): FysRadInn => ({
  navn: "Markløft trapbar", sett: 4, repsMin: 6, repsMax: 6, belastningPst: null, loggBelastningKg: 90, rir: 2,
  hvile: 120, notat: null, intervallSerier: null, intervallMinutter: null, pulssone: null, pause: null, ...o,
});

describe("Fysisk program (pakke 17b)", () => {
  it("skriver mengden som «4 × 6 @ 90 kg · RIR 2», kondisjon med pulssone", () => {
    assert.equal(mengdeTekst(rad()), "4 × 6 @ 90 kg · RIR 2");
    assert.equal(mengdeTekst(rad({ loggBelastningKg: null, belastningPst: 80, repsMin: 5, repsMax: 8, rir: null })), "4 × 5–8 @ 80 % av 1RM");
    assert.equal(mengdeTekst(rad({ intervallSerier: 6, intervallMinutter: 3, pulssone: "S3" })), "6 × 3 min · S3");
  });

  it("teller gjorte økter, finner uka nå og neste økt som ikke er gjort", () => {
    const okt = (id: string, dag: "TIR" | "FRE", gjort: boolean) => ({ id, navn: `Økt ${id}`, dag, type: "styrke", estimertMinutter: 60, gjennomfortAt: gjort ? new Date("2026-09-22T16:00:00Z") : null, rader: [rad()] });
    const p = byggFysiskProgram({
      id: "p", navn: "Underkropp", startDato: new Date("2026-09-21T00:00:00Z"), fraNavn: "Anders Kristiansen",
      uker: [
        { ukeNr: 1, okter: [okt("A1", "TIR", true), okt("B1", "FRE", true)] },
        { ukeNr: 2, okter: [okt("A2", "TIR", true), okt("B2", "FRE", false)] },
        { ukeNr: 3, okter: [okt("A3", "TIR", false), okt("B3", "FRE", false)] },
      ],
    }, new Date("2026-10-06T10:00:00Z"));
    assert.equal(p.gjort, 3);
    assert.equal(p.totalt, 6);
    assert.equal(p.ukeNaa, 3);
    assert.deepEqual(p.uker.map((u) => u.status), ["gjort", "del", "ingen"]);
    assert.deepEqual(p.uker.map((u) => u.iso), [39, 40, 41]);
    assert.equal(p.tidsrom, "Uke 39–41");
    assert.equal(p.dager, "Tirsdag og fredag");
    assert.equal(p.neste?.navn, "Økt A3");
    assert.equal(p.neste?.id, "A3");
    assert.equal(p.neste?.dato, "Tir 6. okt.");
    assert.deepEqual(p.okter.map((o) => o.id), ["A3", "B3"]);
  });

  it("viser siste test per test med endring mot forrige, uten å finne på tall", () => {
    const t = (testId: string, score: number, dato: string) => ({ testId, navn: testId, score, takenAt: new Date(dato), enhet: "kg" });
    const r = fysTestRader([t("Benk", 70, "2026-08-01"), t("Benk", 72.5, "2026-09-14"), t("Mark", 115, "2026-09-14")]);
    assert.deepEqual(r.rader[0], { navn: "Benk", verdi: "72,5 kg", endring: "+2,5", retning: "opp" });
    assert.equal(r.rader[1].endring, null);
  });
});

describe("Opptatt tid (pakke 17b)", () => {
  const fra = new Date("2026-10-04T22:00:00Z"), til = new Date("2026-10-11T22:00:00Z");
  it("gjentar ukentlige avtaler inn i uka", () => {
    const f = forekomster({ startAt: new Date("2026-08-17T06:00:00Z"), endAt: new Date("2026-08-17T13:00:00Z"), recurring: "WEEKLY" }, fra, til);
    assert.equal(f.length, 1);
    assert.equal(f[0].start.toISOString(), "2026-10-05T06:00:00.000Z");
  });

  it("legger avtaler, Google og økter på riktig dag, Google bare som «Opptatt»", () => {
    const uke = byggUke({
      mandag: "2026-10-05", idag: "2026-10-05", fra, til,
      blokker: [{ id: "b", title: "Skole", startAt: new Date("2026-08-17T06:00:00Z"), endAt: new Date("2026-08-17T13:00:00Z"), recurring: "WEEKLY", isPrivate: false }],
      okter: [{ title: "Innspill", startTime: new Date("2026-10-05T13:30:00Z"), pyramidArea: "SLAG" }],
      google: [{ startAt: new Date("2026-10-08T16:00:00Z"), endAt: new Date("2026-10-08T18:00:00Z"), allDay: false }],
    });
    assert.equal(uke[0].idag, true);
    assert.deepEqual(uke[0].blokker.map((b) => b.tekst), ["Skole 08–15", "15:30 Innspill"]);
    assert.equal(uke[0].blokker[1].akse, "SLAG");
    assert.deepEqual(uke[3].blokker, [{ type: "google", akse: null, tekst: "18 Opptatt" }]);
  });

  it("lister ukentlige avtaler først og dropper enkeltavtaler som er over", () => {
    const l = fasteAvtaler([
      { id: "gml", title: "Tannlege", startAt: new Date("2026-09-01T10:00:00Z"), endAt: new Date("2026-09-01T11:00:00Z"), recurring: "NONE", isPrivate: true },
      { id: "ferie", title: "Høstferie", startAt: new Date("2026-10-12T06:00:00Z"), endAt: new Date("2026-10-16T16:00:00Z"), recurring: "NONE", isPrivate: false },
      { id: "skole", title: "Skole", startAt: new Date("2026-08-17T06:00:00Z"), endAt: new Date("2026-08-17T13:00:00Z"), recurring: "WEEKLY", isPrivate: false },
    ], new Date("2026-10-05T12:00:00Z"));
    assert.deepEqual(l.map((a) => a.id), ["skole", "ferie"]);
    assert.equal(l[0].under, "Mandag 08–15 · ukentlig");
  });
});

describe("Perioden er ferdig (pakke 17b)", () => {
  it("regner gjennomført mot planlagt per akse; hoppet over teller i planlagt", () => {
    const t = periodeTall([
      { pyramid: "FYS", durationMinutes: 60, status: "COMPLETED" },
      { pyramid: "TEK", durationMinutes: 90, status: "COMPLETED" },
      { pyramid: "TEK", durationMinutes: 30, status: "SKIPPED" },
      { pyramid: "SLAG", durationMinutes: 45, status: "PUBLISHED" },
    ]);
    assert.deepEqual(t.perAkse.TEK, { gjort: 90, plan: 120 });
    assert.equal(t.gjort, 150);
    assert.equal(t.plan, 225);
    assert.equal(t.pct, 67);
    assert.equal(t.okterGjort, 2);
    assert.equal(t.okterTotalt, 4);
  });

  it("gir ingen prosent uten planlagt tid", () => {
    assert.equal(periodeTall([]).pct, null);
    assert.equal(timerTekst(1025), "17 t 5 min");
    assert.equal(timerTekst(45), "45 min");
  });
});

describe("Videresendinger fra de gamle adressene (pakke 17b)", () => {
  it("sender hver gamle adresse til riktig ny skjerm", () => {
    assert.deepEqual(PLAN_HJELPERE_VIDERESENDING, {
      "/portal/tren/fys-plan": "/portal/planlegge/fysisk",
      "/portal/tren/fys-plan/[planId]": "/portal/planlegge/fysisk",
      "/portal/kalender/opptatt": "/portal/planlegge/opptatt",
      "/portal/tren/feiring/[planId]": "/portal/planlegge/periode-ferdig",
      "/portal/ai/mal-bygger": "/portal/mal/ny",
      "/portal/fysisk": "/portal/planlegge/fysisk",
    });
    assert.equal(periodeFerdigHref("abc"), "/portal/planlegge/periode-ferdig/abc");
  });
});
