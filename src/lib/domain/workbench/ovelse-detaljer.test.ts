import assert from "node:assert/strict";
import { test } from "node:test";

import {
  belastningFraSted,
  feltForOvelse,
  mengdeTekst,
  OvelseDetaljerSchema,
  omraadeFraArea,
  stedRekkefolge,
  vaskDetaljer,
} from "@/lib/domain/workbench/ovelse-detaljer";
import { parseAkFormel } from "@/lib/domain/workbench/schemas";

test("omraadeFraArea oversetter TEE til TEE_TOTAL og lar resten stå", () => {
  assert.equal(omraadeFraArea("TEE"), "TEE_TOTAL");
  assert.equal(omraadeFraArea("CHIP"), "CHIP");
  assert.equal(omraadeFraArea("BANE"), "BANE");
});

test("Teknikk med Utslag viser læringssteg, teknisk fokus, måleutstyr, treningsmåte og press", () => {
  const f = feltForOvelse("TEK", "TEE");
  assert.equal(f.laeringssteg, true);
  assert.deepEqual([...f.tekniskFokus], ["SIKTE", "STARTRETNING", "KURVE", "TREFFPUNKT"]);
  assert.equal(f.maaleutstyr, true);
  assert.equal(f.treningsmaate, true);
  assert.equal(f.press, true);
  assert.deepEqual([...f.mengde.enheter], ["SLAG"]);
});

test("Læringssteg vises ikke for nærspill, og sandtrinn bare for bunker", () => {
  assert.equal(feltForOvelse("TEK", "CHIP").laeringssteg, false);
  assert.equal(feltForOvelse("TEK", "CHIP").sandTrinn, false);
  assert.equal(feltForOvelse("TEK", "BUNKER").sandTrinn, true);
  assert.equal(feltForOvelse("SLAG", "PUTT_3_5").laeringssteg, false);
});

test("Fysisk viser aldri golffelt og har serier, repetisjoner, vekt, RIR og pause", () => {
  const f = feltForOvelse("FYS", "STYRKE");
  assert.equal(f.laeringssteg, false);
  assert.deepEqual([...f.tekniskFokus], []);
  assert.equal(f.maaleutstyr, false);
  assert.equal(f.treningsmaate, false);
  assert.equal(f.press, false);
  assert.deepEqual([...f.mengde.enheter], ["SERIER"]);
  assert.deepEqual([f.mengde.reps, f.mengde.vekt, f.mengde.rir, f.mengde.pause], [true, true, true, true]);
});

test("Spill og Turnering viser ikke læringssteg, måleutstyr eller treningsmåte, men press", () => {
  for (const pyramid of ["SPILL", "TURN"] as const) {
    const f = feltForOvelse(pyramid, "BANE");
    assert.equal(f.laeringssteg, false);
    assert.equal(f.maaleutstyr, false);
    assert.equal(f.treningsmaate, false);
    assert.equal(f.press, true);
    assert.deepEqual([...f.tekniskFokus], ["SPILLEFORMAT", "STRATEGIOPPGAVE"]);
    assert.deepEqual([...f.mengde.enheter], ["HULL", "MINUTTER"]);
  }
});

test("Putting teller putter, og alle områder kan fortsatt velges under alle pyramidegrener", () => {
  assert.deepEqual([...feltForOvelse("SLAG", "PUTT_10_25").mengde.enheter], ["PUTTER"]);
  assert.doesNotThrow(() => feltForOvelse("FYS", "CHIP"));
  assert.doesNotThrow(() => feltForOvelse("TURN", "STYRKE"));
});

test("hastighet beholdes bare når den passer læringssteget", () => {
  const ok = vaskDetaljer("TEK", "TEE", "AUTO", { hastighetProsent: 100 });
  assert.equal(ok?.hastighetProsent, 100);
  assert.equal(vaskDetaljer("TEK", "TEE", "LAV_HAST", { hastighetProsent: 50 })?.hastighetProsent, 50);
  assert.equal(vaskDetaljer("TEK", "TEE", "AUTO", { hastighetProsent: 50 }), undefined);
  assert.equal(vaskDetaljer("TEK", "TEE", "UTEN_BALL", { hastighetProsent: 25 }), undefined);
  assert.equal(vaskDetaljer("TEK", "TEE", undefined, { hastighetProsent: 25 }), undefined);
  assert.equal(vaskDetaljer("TEK", "CHIP", "LAV_HAST", { hastighetProsent: 25 }), undefined);
  assert.equal(vaskDetaljer("SPILL", "TEE", "LAV_HAST", { hastighetProsent: 25 }), undefined);
});

test("felt fra en annen gren eller et annet område vaskes bort", () => {
  const ut = vaskDetaljer("FYS", "STYRKE", undefined, {
    tekniskFokus: "KURVE",
    maaleutstyr: "MED_TRACKMAN",
    treningsmaate: "BLOKK",
    sandTrinn: "MED_BALL",
    mengde: { enhet: "SERIER", antall: 4, reps: 6, vektKg: 60, rir: 2, pauseSek: 90 },
  });
  assert.deepEqual(ut, { mengde: { enhet: "SERIER", antall: 4, reps: 6, vektKg: 60, rir: 2, pauseSek: 90 } });

  const golf = vaskDetaljer("TEK", "CHIP", undefined, {
    mengde: { enhet: "SLAG", antall: 30, reps: 5, vektKg: 20 },
    tekniskFokus: "LANDINGSPUNKT",
  });
  assert.deepEqual(golf, { tekniskFokus: "LANDINGSPUNKT", mengde: { enhet: "SLAG", antall: 30 } });
});

test("teknisk fokus må passe området, og mengdeenhet må passe området", () => {
  assert.equal(vaskDetaljer("TEK", "CHIP", undefined, { tekniskFokus: "BALLSTART" }), undefined);
  assert.equal(vaskDetaljer("SLAG", "PUTT_3_5", undefined, { mengde: { enhet: "SLAG", antall: 10 } }), undefined);
  assert.equal(vaskDetaljer("SLAG", "PUTT_3_5", undefined, { mengde: { enhet: "PUTTER", antall: 10 } })?.mengde?.antall, 10);
});

test("sted: ukjent delvalg fjernes, Annet tillater fritekst, tomt resultat gir undefined", () => {
  assert.deepEqual(
    vaskDetaljer("TEK", "TEE", undefined, { sted: { hoved: "UTENDORS_TRENINGSOMRAADE", delvalg: "Driving range" } })?.sted,
    { hoved: "UTENDORS_TRENINGSOMRAADE", delvalg: "Driving range" },
  );
  assert.equal(
    vaskDetaljer("TEK", "TEE", undefined, { sted: { hoved: "GOLFBANE", delvalg: "Driving range" } }),
    undefined,
  );
  assert.deepEqual(vaskDetaljer("TEK", "TEE", undefined, { sted: { hoved: "ANNET", delvalg: "Bossum" } })?.sted, {
    hoved: "ANNET",
    delvalg: "Bossum",
  });
  assert.equal(vaskDetaljer("TEK", "TEE", undefined, {}), undefined);
  assert.equal(vaskDetaljer("TEK", "TEE", undefined, undefined), undefined);
});

test("målfelt beholdes, og tomme strenger forsvinner", () => {
  const ut = vaskDetaljer("SLAG", "TEE", undefined, {
    mal: { malemetode: "TrackMan: Launch Direction", resultatkrav: "20 av 30", notat: undefined },
  });
  assert.deepEqual(ut, { mal: { malemetode: "TrackMan: Launch Direction", resultatkrav: "20 av 30" } });
});

test("treningsmiljø utledes fra stedet slik masteren sier", () => {
  assert.equal(belastningFraSted("INNENDORS_GOLF"), "INNENDORS");
  assert.equal(belastningFraSted("GOLFBANE"), "BANE");
  assert.equal(belastningFraSted("UTENDORS_TRENINGSOMRAADE"), "TRENINGSOMRAADE");
  assert.equal(belastningFraSted("HJEMME", "Inne"), "TRENINGSOMRAADE");
  assert.equal(belastningFraSted("ANNET"), "TRENINGSOMRAADE");
  assert.equal(belastningFraSted("FYSISK_TRENINGSSTED", "Styrkerom"), "INNENDORS");
  assert.equal(belastningFraSted("FYSISK_TRENINGSSTED", "Utendørs"), "TRENINGSOMRAADE");
});

test("stedene foreslås i ulik rekkefølge per pyramide, men alle seks er med", () => {
  assert.equal(stedRekkefolge("FYS")[0], "FYSISK_TRENINGSSTED");
  assert.equal(stedRekkefolge("SPILL")[0], "GOLFBANE");
  for (const p of ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const) assert.equal(new Set(stedRekkefolge(p)).size, 6);
});

test("skjemaet avviser hastighet utenfor 25/50/75/100", () => {
  assert.equal(OvelseDetaljerSchema.safeParse({ hastighetProsent: 60 }).success, false);
  assert.equal(OvelseDetaljerSchema.safeParse({ hastighetProsent: 75 }).success, true);
  assert.equal(OvelseDetaljerSchema.safeParse({ maaleutstyr: "FLIGHTSCOPE" }).success, false);
});

test("detaljer overlever lesing av lagret AKFormel", () => {
  const lagret = {
    pyramid: "TEK",
    area: "TEE",
    label: "TEK · Utslag",
    motorikk: "LAV_HAST",
    detaljer: { hastighetProsent: 50, maaleutstyr: "MED_TRACKMAN" },
  };
  assert.deepEqual(parseAkFormel(lagret, "x").detaljer, { hastighetProsent: 50, maaleutstyr: "MED_TRACKMAN" });
  assert.equal(parseAkFormel({ pyramid: "TEK", area: "TEE", label: "gammel" }, "x").detaljer, undefined);
});

test("mengdeTekst er lesbar og tom uten antall", () => {
  assert.equal(mengdeTekst({ enhet: "SLAG", antall: 30 }), "30 slag");
  assert.equal(mengdeTekst({ enhet: "SERIER", antall: 4, reps: 6, vektKg: 60, rir: 2 }), "4 serier · 6 repetisjoner · 60 kg · RIR 2");
  assert.equal(mengdeTekst({ enhet: "SLAG" }), undefined);
  assert.equal(mengdeTekst(undefined), undefined);
});
