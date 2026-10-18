import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggFysOkt, gjortTekst, lesTall, tilLoggRader, type FysOktRadInn } from "./fysisk-okt";

const rad = (o: Partial<FysOktRadInn> = {}): FysOktRadInn => ({
  id: "r1", navn: "Markløft trapbar", sett: 4, repsMin: 6, repsMax: 6, belastningPst: null, loggBelastningKg: 90, rir: 2,
  hvile: 120, notat: null, intervallSerier: null, intervallMinutter: null, pulssone: null, pause: null,
  loggSett: null, loggRepsPerSett: null, loggRir: null, loggSettData: null, ...o,
});
const okt = (rader: FysOktRadInn[], gjort: Date | null = null) => byggFysOkt({
  id: "o1", navn: "Økt A", dag: "TIR", type: "styrke", estimertMinutter: 45, gjennomfortAt: gjort, faktiskMinutter: null, rader,
}, "Underkropp");

describe("Føring av fysisk økt (PH-06)", () => {
  it("fyller seriene fra planen når ingenting er ført, og deler styrke fra kondisjon", () => {
    const o = okt([rad(), rad({ id: "r2", navn: "Sykkel", intervallSerier: 6, intervallMinutter: 3, pulssone: "S3" })]);
    assert.equal(o.styrke.length, 1);
    assert.equal(o.styrke[0].mengde, "4 × 6 @ 90 kg · RIR 2");
    assert.equal(o.styrke[0].hvile, "Hvile 2 min");
    assert.deepEqual(o.styrke[0].sett[0], { reps: 6, kg: 90, rir: 2, ok: false });
    assert.equal(o.styrke[0].sett.length, 4);
    assert.deepEqual(o.kondisjon.map((k) => k.mengde), ["6 × 3 min · S3"]);
    assert.equal(o.under, "Tirsdag · styrke");
    assert.equal(o.gjennomfort, null);
  });

  it("viser det som er ført når loggSettData finnes", () => {
    const o = okt([rad({ loggSettData: [{ vekt: 92.5, reps: 5, rir: 1 }, { vekt: 0, reps: 8 }, { foo: 1 }] })], new Date("2026-10-06T16:00:00Z"));
    assert.deepEqual(o.styrke[0].sett, [{ reps: 5, kg: 92.5, rir: 1, ok: true }, { reps: 8, kg: null, rir: null, ok: true }]);
    assert.equal(o.gjennomfort, "6. okt.");
  });

  it("sender bare registrerte serier med reps, med høyeste kilo og siste RIR", () => {
    const o = okt([rad(), rad({ id: "r3", navn: "Hofteløft" })]);
    o.styrke[0].sett = [
      { reps: 6, kg: 90, rir: 3, ok: true }, { reps: 6, kg: 92.5, rir: 2, ok: true },
      { reps: null, kg: 95, rir: null, ok: true }, { reps: 6, kg: 95, rir: 1, ok: false },
    ];
    const [a, b] = tilLoggRader(o.styrke);
    assert.deepEqual(a, {
      radId: "r1", loggSett: 2, loggRepsPerSett: "6, 6", loggBelastningKg: 92.5, loggRir: 2,
      settData: [{ vekt: 90, reps: 6, rir: 3 }, { vekt: 92.5, reps: 6, rir: 2 }],
    });
    assert.deepEqual(b, { radId: "r3", loggSett: 0, loggRepsPerSett: undefined, loggBelastningKg: undefined, loggRir: undefined, settData: [] });
    assert.equal(gjortTekst(o.styrke[0]), "2 × 6 @ 92,5 kg · RIR 2");
    assert.equal(gjortTekst(o.styrke[1]), "Hoppet over");
  });

  it("godtar komma og punktum i tallfeltene", () => {
    assert.equal(lesTall("92,5"), 92.5);
    assert.equal(lesTall("92.5"), 92.5);
    assert.equal(lesTall(""), null);
    assert.equal(lesTall("x"), null);
  });
});
