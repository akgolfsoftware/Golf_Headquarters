import { test } from "node:test";
import assert from "node:assert/strict";
import { TpSkjemaSchema, miljoCeller, oppgaveFelt, protokollFelt } from "./tp-skjema";
import { TOMT_SKJEMA, type TpSkjema } from "./tp-visning";

const skjema = (p: Partial<TpSkjema> = {}): TpSkjema => ({
  ...TOMT_SKJEMA, pNummer: "P7.0", tittel: "Hendene foran ballen", omraadeKode: "INNSPILL_150", motorikk: "LAV_HAST",
  belastning: "BANE", press: "ALENE", dimensjon: "STARTRETNING", kolle: "7-jern", maaleutstyr: "TRACKMAN",
  repSteg: { UTEN_BALL: 60, LAV_HAST: 120, AUTO: 0 }, rep: 999, ...p,
});
const gyldig = (p: Partial<TpSkjema> = {}) => TpSkjemaSchema.parse(skjema(p));

test("skjemaet krever posisjon, tittel og område — resten er valgfritt", () => {
  assert.equal(TpSkjemaSchema.safeParse(skjema({ pNummer: null })).success, false);
  assert.equal(TpSkjemaSchema.safeParse(skjema({ tittel: "  " })).success, false);
  assert.equal(TpSkjemaSchema.safeParse(skjema({ omraadeKode: null })).success, false);
  assert.equal(TpSkjemaSchema.safeParse(skjema({ pNummer: "P11.0" })).success, false);
  assert.equal(TpSkjemaSchema.safeParse(skjema({ dimensjon: null, press: null, belastning: null, maaleutstyr: null })).success, true);
});

test("målboksen må ha nedre grense under øvre, og protokollen kan ikke kreve flere treff enn slag", () => {
  assert.equal(TpSkjemaSchema.safeParse(skjema({ tm: [{ id: null, metric: "attack_angle_mean", fra: -3, til: -5 }] })).success, false);
  assert.equal(TpSkjemaSchema.safeParse(skjema({ protokoll: { type: "ROLLING_WINDOW", antall: 10, treff: 12 } })).success, false);
  assert.equal(TpSkjemaSchema.safeParse(skjema({ protokoll: { type: "STREAK", antall: 1, treff: 5 } })).success, true);
});

test("fullsving lagrer rep-mål per læringssteg; ellers ett rep-mål som full fart", () => {
  const f = oppgaveFelt(gyldig());
  assert.deepEqual([f.repsMaalDry, f.repsMaalLav, f.repsMaalFull], [60, 120, 0]);
  const p = oppgaveFelt(gyldig({ omraadeKode: "PITCH", rep: 150, dimensjon: "LENGDEKONTROLL" }));
  assert.deepEqual([p.repsMaalDry, p.repsMaalLav, p.repsMaalFull], [0, 0, 150]);
  assert.equal(p.motorikk, null, "læringssteg lagres ikke utenfor fullsving");
  assert.equal(p.omraade, "Pitch");
});

test("teknisk fokus som ikke hører til området lagres ikke", () => {
  assert.equal(oppgaveFelt(gyldig({ omraadeKode: "PUTT_0_3", dimensjon: "HOYDE" })).dimensjon, null);
  assert.equal(oppgaveFelt(gyldig()).dimensjon, "STARTRETNING");
});

test("rep-mål per miljø blir celler i målmatrisen med oppgavens læringssteg", () => {
  assert.deepEqual(miljoCeller(gyldig({ repMiljo: { INNENDORS: 100, BANE: 0, TRENINGSOMRAADE: 40 } })), [
    { motorikk: "LAV_HAST", belastning: "INNENDORS", maalReps: 100 },
    { motorikk: "LAV_HAST", belastning: "TRENINGSOMRAADE", maalReps: 40 },
  ]);
  assert.equal(miljoCeller(gyldig({ omraadeKode: "CHIP", repMiljo: { BANE: 30 } }))[0].motorikk, "AUTO");
});

test("treffprotokollen tar målboksen fra første TrackMan-mål", () => {
  const p = protokollFelt(gyldig({
    tm: [{ id: null, metric: "face_to_path_mean", fra: -2.5, til: -1 }],
    protokoll: { type: "ROLLING_WINDOW", antall: 20, treff: 16 },
  }), "7-jern");
  assert.deepEqual(p, { metric: "face_to_path_mean", klubb: "7-jern", protocol: "ROLLING_WINDOW", windowSize: 20, requiredHits: 16, targetValue: 16, corridorMin: -2.5, corridorMax: -1 });
  assert.equal(protokollFelt(gyldig({ protokoll: { type: "STREAK", antall: 20, treff: 5 } }), "Driver")?.windowSize, null);
  assert.equal(protokollFelt(gyldig(), "Driver"), null);
});
