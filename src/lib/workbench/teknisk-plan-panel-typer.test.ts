import { test } from "node:test";
import assert from "node:assert/strict";
import {
  byggUndertekst,
  filtrerTekniskePanelOppgaver,
  merkelapper,
  tekniskOppgaveTilDrill,
  MAKS_PLAN_REPS,
  type TekniskPanelOppgave,
} from "./teknisk-plan-panel-typer";

function oppgave(over: Partial<TekniskPanelOppgave> = {}): TekniskPanelOppgave {
  return {
    id: "t1", planId: "p1", tittel: "Flatt handledd", pNummer: "P4.0", pNavn: "Topp-posisjon",
    pHoved: "P4.0", hovedfokus: false, slagNavn: null, omraadeKode: "TEE_TOTAL",
    omraadeLabel: "Tee Total", koller: ["Driver"], motorikk: null, dimensjon: null,
    maaleutstyr: null, pyramide: "TEK", restUtenBall: 0, restLavFart: 0, restAuto: 0,
    restTotalt: 0, repsEnhet: "SLAG", undertekst: "Driver · Tee Total", ...over,
  };
}

test("undertekst viser slaget, lengden og læringssteget", () => {
  assert.equal(
    byggUndertekst({ slagNavn: "7-jern lav fade", koller: ["7-jern"], omraadeLabel: "Innspill 150–200 m", motorikk: "LAV_HAST" }),
    "7-jern lav fade · Innspill 150–200 m · Lav hastighet",
  );
  assert.equal(
    byggUndertekst({ slagNavn: null, koller: ["Driver", "3-tre"], omraadeLabel: "Tee Total", motorikk: null }),
    "2 køller · Tee Total",
  );
});

test("filtrene treffer slag, kølle og lengde", () => {
  const liste = [
    oppgave({ id: "a", slagNavn: "7-jern lav fade", koller: ["7-jern"], omraadeKode: "INNSPILL_150" }),
    oppgave({ id: "b", koller: ["Putter"], omraadeKode: "PUTT_5_10", tittel: "Lengdekontroll" }),
    oppgave({ id: "c", koller: ["Driver"], restTotalt: 300 }),
  ];
  assert.deepEqual(filtrerTekniskePanelOppgaver(liste, { slag: "7-jern lav fade" }).map((o) => o.id), ["a"]);
  assert.deepEqual(filtrerTekniskePanelOppgaver(liste, { kolle: "Putter" }).map((o) => o.id), ["b"]);
  assert.deepEqual(filtrerTekniskePanelOppgaver(liste, { omraade: "PUTT_5_10" }).map((o) => o.id), ["b"]);
  assert.deepEqual(filtrerTekniskePanelOppgaver(liste, { kunRest: true }).map((o) => o.id), ["c"]);
  assert.deepEqual(filtrerTekniskePanelOppgaver(liste, { sok: "lengde" }).map((o) => o.id), ["b"]);
  assert.equal(filtrerTekniskePanelOppgaver(liste, {}).length, 3, "uten filter vises alt");
});

test("merkelapper viser teknisk fokus og måleutstyr, ikke tomme verdier", () => {
  assert.deepEqual(merkelapper(oppgave({ dimensjon: "TREFFPUNKT", maaleutstyr: "TRACKMAN" })), ["Treffpunkt", "TrackMan"]);
  assert.deepEqual(merkelapper(oppgave()), []);
});

test("oppgave blir drill med restmål som forslag, klemt til serverens grense", () => {
  const f = tekniskOppgaveTilDrill(
    oppgave({
      tittel: "Flatt håndledd",
      slagNavn: "7-jern lav fade",
      omraadeLabel: "Innspill 150–200 m",
      motorikk: "LAV_HAST",
      pyramide: "TEK",
      restUtenBall: 320,
      restLavFart: 5000,
      restAuto: 0,
    }),
  );
  assert.equal(f.nivaa, "lav", "læringssteget bestemmer hvilket trinn økta starter på");
  assert.equal(f.planRepsUtenBall, 320);
  assert.equal(f.planRepsLavFart, MAKS_PLAN_REPS, "over grensen klemmes, ellers avvises hele økta");
  assert.equal(f.planRepsAuto, null, "trinn uten arbeid igjen sendes ikke");
  assert.equal(f.nyBeskrivelse, "Slag: 7-jern lav fade");
  assert.equal(f.positionTaskId, "t1", "koblingen til oppgaven følger med");
});

test("ukjent pyramide faller tilbake på TEK, og område kuttes til serverens grense", () => {
  const f = tekniskOppgaveTilDrill(oppgave({ pyramide: "TULL", omraadeLabel: "x".repeat(200) }));
  assert.equal(f.nyPyramidArea, "TEK");
  assert.equal(f.nyOmraade.length, 80);
});
