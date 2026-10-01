/**
 * npx tsx --conditions=react-server --test src/lib/agencyos/planhub-ovelse.test.ts
 *
 * Låser oversettelsen mellom øvelsesarket i Plan-hub (AG-14) og
 * ExerciseDefinition: aksene går i egne kolonner, resten av de åtte trinnene i
 * parametersJson.akFormelV2.detaljer, og eldre nøkler beholdes.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { DrillParametersSchema } from "@/lib/taxonomy";
import {
  byggParametre,
  formelFor,
  lesDetaljer,
  tilLagring,
  tomtUtkast,
  utkastFraOvelse,
  validerUtkast,
  vaskUtkast,
  type OvelseUtkast,
} from "./planhub-ovelse";

const utkast = (p: Partial<OvelseUtkast>): OvelseUtkast => vaskUtkast({ ...tomtUtkast(), ...p });

test("fullsving i SLAG får læringssteg, belastning fra stedet og press i formelen", () => {
  const u = utkast({ navn: "7-jern mot mål", pyramide: "SLAG", omraade: "INNSPILL_100", motorikk: "LAV_HAST", press: "OBSERVERT" });
  assert.equal(formelFor(u), "SLAG_INNSPILL_100_LAV_HAST_TRENINGSOMRAADE_OBSERVERT");
});

test("putting får aldri læringssteg, og bytte av pyramide rydder området", () => {
  const putt = utkast({ pyramide: "SLAG", omraade: "PUTT_3_5", motorikk: "AUTO" });
  assert.equal(putt.motorikk, null);
  const tek = vaskUtkast({ ...putt, pyramide: "TEK" });
  assert.notEqual(tek.omraade, "PUTT_3_5", "TEK tilbyr ikke putting i tegningen");
  const fys = vaskUtkast({ ...putt, pyramide: "FYS" });
  assert.equal(fys.omraade, "STYRKE");
  assert.equal(fys.press, "ALENE");
  assert.equal(fys.detaljer.mengde?.enhet, "SERIER");
});

test("navn og mengde må fylles ut, ellers lagres ingenting", () => {
  const feil = validerUtkast(utkast({ navn: "  " }));
  assert.ok(feil.navn);
  assert.ok(feil.mengde);
  const ok = validerUtkast(utkast({ navn: "Wedge", detaljer: { mengde: { enhet: "SLAG", antall: 30 } } }));
  assert.deepEqual(ok, {});
});

test("lagring: aksene i kolonner, detaljene i parametersJson, mengden som tekst", () => {
  const u = utkast({
    navn: "Wedge 50–90 m",
    pyramide: "SLAG",
    omraade: "INNSPILL_50",
    motorikk: "AUTO",
    press: "ALENE",
    detaljer: { sted: { hoved: "INNENDORS_GOLF", delvalg: "Simulator" }, maaleutstyr: "MED_TRACKMAN", mengde: { enhet: "SLAG", antall: 30 }, mal: { resultatkrav: "±4 m" } },
  });
  const l = tilLagring(u, null);
  assert.equal(l.omraadeKode, "INNSPILL_50");
  assert.equal(l.motorikk, "AUTO");
  assert.equal(l.belastning, "INNENDORS");
  assert.equal(l.defaultRepsSets, "30 slag");
  assert.ok(DrillParametersSchema.safeParse(l.parametersJson).success, "eldre lesere skal fortsatt kunne lese parametersJson");
  const d = lesDetaljer(l.parametersJson);
  assert.equal(d?.maaleutstyr, "MED_TRACKMAN");
  assert.equal(d?.mal?.resultatkrav, "±4 m");
  assert.equal(d?.sted?.delvalg, "Simulator");
});

test("eldre nøkler i parametersJson beholdes når modusen er den samme", () => {
  const original = { modus: "GOLF", treningsomrade: "PITCH", lFase: "L_BALL", pPosisjoner: ["P6.0"], environment: "RANGE" };
  const p = byggParametre(utkast({ pyramide: "TEK", omraade: "PITCH" }), original);
  assert.deepEqual(p.pPosisjoner, ["P6.0"]);
  assert.equal(p.environment, "RANGE");
  assert.equal(p.treningsomrade, "PITCH");
});

test("en lagret øvelse leses tilbake til samme utkast", () => {
  const u = utkast({ navn: "Knebøy", pyramide: "FYS", omraade: "STYRKE", detaljer: { mengde: { enhet: "SERIER", antall: 4, reps: 6, vektKg: 60 } } });
  const l = tilLagring(u, null);
  const tilbake = utkastFraOvelse({
    id: "x", navn: l.name, pyramide: l.pyramidArea, omraade: l.omraadeKode, motorikk: l.motorikk, belastning: l.belastning, press: l.press,
    mengde: l.defaultRepsSets ?? null, detaljer: lesDetaljer(l.parametersJson), parametre: l.parametersJson,
  });
  assert.equal(tilbake.omraade, "STYRKE");
  assert.equal(tilbake.detaljer.mengde?.antall, 4);
  assert.equal(tilbake.detaljer.mengde?.vektKg, 60);
  assert.equal((l.parametersJson as { sets: number }).sets, 4);
});
