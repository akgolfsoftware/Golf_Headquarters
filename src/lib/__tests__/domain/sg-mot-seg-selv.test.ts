import test from "node:test";
import assert from "node:assert/strict";

import {
  sammenlignMedSegSelv,
  MIN_RUNDER_PER_VINDU,
  MIN_MERKBAR_ENDRING,
  SG_AKSER,
  type SgRunde,
} from "@/lib/domain/sg-mot-seg-selv";

/** Runde n dager tilbake i tid, med valgfrie SG-verdier. */
function runde(dagerSiden: number, sg: Partial<Omit<SgRunde, "playedAt">> = {}): SgRunde {
  return {
    playedAt: new Date(2026, 6, 1 + (200 - dagerSiden)),
    sgOtt: sg.sgOtt ?? null,
    sgApp: sg.sgApp ?? null,
    sgArg: sg.sgArg ?? null,
    sgPutt: sg.sgPutt ?? null,
  };
}

/** n runder med samme verdi på alle fire områder, eldst først. */
function serie(n: number, verdi: number, startDagerSiden: number): SgRunde[] {
  return Array.from({ length: n }, (_, i) =>
    runde(startDagerSiden - i, { sgOtt: verdi, sgApp: verdi, sgArg: verdi, sgPutt: verdi }),
  );
}

// ── For lite data ──────────────────────────────────────────────────────────

test("ingen runder: ærlig tomt svar, ingen tall", () => {
  const r = sammenlignMedSegSelv([]);
  assert.equal(r.harSvar, false);
  assert.match(r.grunnlag, /[Ii]ngen runder/);
  assert.equal(r.akser.length, 4);
  assert.ok(r.akser.every((a) => a.nylig === null && a.endring === null));
});

test("for få runder: sier hvor mange som mangler", () => {
  const r = sammenlignMedSegSelv(serie(4, 0.5, 100), MIN_RUNDER_PER_VINDU);
  assert.equal(r.harSvar, false);
  assert.match(r.grunnlag, /4 runder/);
  assert.match(r.grunnlag, /Trenger 2 til/);
});

test("nøyaktig nok runder til minstevinduet: gir svar", () => {
  const r = sammenlignMedSegSelv(serie(6, 0.5, 100), MIN_RUNDER_PER_VINDU);
  assert.equal(r.harSvar, true);
});

test("for lite vindu avvises framfor å gi et tynt tall", () => {
  const r = sammenlignMedSegSelv(serie(20, 0.5, 100), 2);
  assert.equal(r.harSvar, false);
  assert.match(r.grunnlag, /minst 3 runder/);
});

// ── Selve sammenligningen ──────────────────────────────────────────────────

test("regner endring per område mot spillerens egne tidligere runder", () => {
  // Eldste 5: alt på −1,0. Nyeste 5: innspill bedret til −0,4, putting til −1,6.
  const tidligere = serie(5, -1.0, 100);
  const nylige = Array.from({ length: 5 }, (_, i) =>
    runde(50 - i, { sgOtt: -1.0, sgApp: -0.4, sgArg: -1.0, sgPutt: -1.6 }),
  );
  const r = sammenlignMedSegSelv([...tidligere, ...nylige], 5);

  assert.equal(r.harSvar, true);
  const app = r.akser.find((a) => a.akse === "APP")!;
  assert.equal(app.tidligere, -1.0);
  assert.equal(app.nylig, -0.4);
  assert.equal(app.endring, 0.6, "innspill har blitt bedre");

  const putt = r.akser.find((a) => a.akse === "PUTT")!;
  assert.equal(putt.endring, -0.6, "putting har blitt dårligere");

  const ott = r.akser.find((a) => a.akse === "OTT")!;
  assert.equal(ott.endring, 0, "uendret område gir 0, ikke null");
});

test("peker ut største tilbakegang og største fremgang", () => {
  const tidligere = serie(5, -1.0, 100);
  const nylige = Array.from({ length: 5 }, (_, i) =>
    runde(50 - i, { sgOtt: -1.1, sgApp: -0.2, sgArg: -1.0, sgPutt: -1.9 }),
  );
  const r = sammenlignMedSegSelv([...tidligere, ...nylige], 5);

  assert.equal(r.storsteTilbakegang?.akse, "PUTT");
  assert.equal(r.storsteTilbakegang?.endring, -0.9);
  assert.equal(r.storsteFremgang?.akse, "APP");
  assert.equal(r.storsteFremgang?.endring, 0.8);
});

test("bittesmå endringer regnes som støy, ikke som funn", () => {
  // Ekte tilfelle fra prod 30.08: putting endret seg −0,03 på 7 mot 7 runder.
  // Uten støygrensen ville det blitt utropt til spillerens hovedproblem.
  const tidligere = Array.from({ length: 7 }, (_, i) =>
    runde(100 - i, { sgOtt: -0.3, sgApp: -0.02, sgArg: -0.17, sgPutt: -0.06 }),
  );
  const nylige = Array.from({ length: 7 }, (_, i) =>
    runde(50 - i, { sgOtt: 0.15, sgApp: 0.44, sgArg: 0.19, sgPutt: -0.09 }),
  );
  const r = sammenlignMedSegSelv([...tidligere, ...nylige], 7);

  const putt = r.akser.find((a) => a.akse === "PUTT")!;
  assert.equal(putt.endring, -0.03, "tallet vises fortsatt ærlig");
  assert.equal(r.storsteTilbakegang, null, "men det utropes ikke til et funn");
  assert.equal(r.storsteFremgang?.akse, "APP", "ekte fremgang fanges fortsatt");
});

test("endring nøyaktig på støygrensen teller som funn", () => {
  const r = sammenlignMedSegSelv(
    [
      ...Array.from({ length: 5 }, (_, i) => runde(100 - i, { sgApp: 0 })),
      ...Array.from({ length: 5 }, (_, i) => runde(50 - i, { sgApp: -MIN_MERKBAR_ENDRING })),
    ],
    5,
  );
  assert.equal(r.storsteTilbakegang?.akse, "APP");
});

test("kun fremgang: ingen tilbakegang utpekes", () => {
  const r = sammenlignMedSegSelv(
    [...serie(5, -1.0, 100), ...serie(5, -0.2, 50)],
    5,
  );
  assert.equal(r.storsteTilbakegang, null);
  assert.equal(r.storsteFremgang?.endring, 0.8);
});

test("rekkefølgen på input spiller ingen rolle", () => {
  const alle = [...serie(5, -1.0, 100), ...serie(5, -0.3, 50)];
  const stokket = [alle[7], alle[0], alle[9], alle[3], alle[5], alle[1], alle[8], alle[2], alle[6], alle[4]];
  assert.deepEqual(
    sammenlignMedSegSelv(stokket, 5).akser,
    sammenlignMedSegSelv(alle, 5).akser,
  );
});

// ── TruthLayer: aldri fabrikkerte tall ─────────────────────────────────────

test("område uten registrerte verdier blir null, ikke 0", () => {
  const runder = [
    ...Array.from({ length: 5 }, (_, i) => runde(100 - i, { sgOtt: -1.0, sgApp: -1.0 })),
    ...Array.from({ length: 5 }, (_, i) => runde(50 - i, { sgOtt: -0.5, sgApp: -0.5 })),
  ];
  const r = sammenlignMedSegSelv(runder, 5);

  const arg = r.akser.find((a) => a.akse === "ARG")!;
  assert.equal(arg.nylig, null, "nærspill er aldri registrert");
  assert.equal(arg.endring, null);
  assert.equal(arg.nyligAntall, 0);

  const ott = r.akser.find((a) => a.akse === "OTT")!;
  assert.equal(ott.endring, 0.5);
  assert.equal(ott.nyligAntall, 5);
});

test("delvis registrerte områder teller kun rundene som faktisk har tallet", () => {
  const tidligere = serie(5, -1.0, 100);
  // Kun 2 av 5 nye runder har putting registrert.
  const nylige = [
    runde(50, { sgOtt: -1.0, sgApp: -1.0, sgArg: -1.0, sgPutt: -0.4 }),
    runde(49, { sgOtt: -1.0, sgApp: -1.0, sgArg: -1.0, sgPutt: -0.6 }),
    runde(48, { sgOtt: -1.0, sgApp: -1.0, sgArg: -1.0 }),
    runde(47, { sgOtt: -1.0, sgApp: -1.0, sgArg: -1.0 }),
    runde(46, { sgOtt: -1.0, sgApp: -1.0, sgArg: -1.0 }),
  ];
  const r = sammenlignMedSegSelv([...tidligere, ...nylige], 5);

  const putt = r.akser.find((a) => a.akse === "PUTT")!;
  assert.equal(putt.nyligAntall, 2, "grunnlaget er 2 runder, ikke 5");
  assert.equal(putt.nylig, -0.5);
  assert.equal(putt.endring, 0.5);
});

test("runder helt uten slagfordeling: sier hva som mangler", () => {
  const r = sammenlignMedSegSelv(
    Array.from({ length: 10 }, (_, i) => runde(100 - i)),
    5,
  );
  assert.equal(r.harSvar, false);
  assert.match(r.grunnlag, /mangler slagfordeling/);
  assert.equal(r.akser.length, 4);
});

test("grunnlaget oppgir hvor mange runder hvert vindu bygger på", () => {
  const r = sammenlignMedSegSelv([...serie(8, -1.0, 100), ...serie(8, -0.5, 50)], 8);
  assert.equal(r.grunnlag, "Siste 8 runder mot de 8 før.");
});

test("periodene dekker faktiske rundedatoer og overlapper ikke", () => {
  const r = sammenlignMedSegSelv([...serie(5, -1.0, 100), ...serie(5, -0.5, 50)], 5);
  assert.ok(r.nyligPeriode && r.tidligerePeriode);
  assert.ok(
    r.tidligerePeriode!.til.getTime() < r.nyligPeriode!.fra.getTime(),
    "det eldre vinduet slutter før det nyere starter",
  );
});

test("alle fire områder er alltid med, også i tomt svar", () => {
  for (const r of [sammenlignMedSegSelv([]), sammenlignMedSegSelv(serie(20, -1, 100), 5)]) {
    assert.deepEqual(
      r.akser.map((a) => a.akse),
      [...SG_AKSER],
    );
  }
});
