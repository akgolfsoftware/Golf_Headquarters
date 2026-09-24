import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  drillSourceId,
  forrigeSourceId,
  malSourceId,
  omraadeKodeTilTrainingArea,
  parseSourceId,
  tekSourceId,
  tekniskOppgaveToSourceItem,
} from "./sources-map";
import type { TekniskPanelOppgave } from "./teknisk-plan-panel-typer";

describe("workbench sources-map", () => {
  it("koder og parser kilde-IDer korrekt", () => {
    assert.equal(drillSourceId("d1"), "drill:d1");
    assert.equal(malSourceId("m1"), "mal:m1");
    assert.equal(forrigeSourceId("s1"), "forrige:s1");
    assert.equal(tekSourceId("t1"), "tek:t1");

    assert.deepEqual(parseSourceId("drill:d1"), { kind: "DRILL", exerciseId: "d1" });
    assert.deepEqual(parseSourceId("mal:m1"), { kind: "MAL", sessionId: "m1" });
    assert.deepEqual(parseSourceId("forrige:s1"), { kind: "FORRIGE", sessionId: "s1" });
    assert.deepEqual(parseSourceId("tek:t1"), { kind: "TEK", taskId: "t1" });

    assert.equal(parseSourceId("ugyldig"), null);
    assert.equal(parseSourceId("drill:"), null);
    assert.equal(parseSourceId("annen:123"), null);
  });

  it("mapper omraadeKode til TrainingArea", () => {
    assert.equal(omraadeKodeTilTrainingArea("TEE_TOTAL"), "TEE");
    assert.equal(omraadeKodeTilTrainingArea("INNSPILL_150"), "INNSPILL_150");
    assert.equal(omraadeKodeTilTrainingArea("CHIP"), "CHIP");
    assert.equal(omraadeKodeTilTrainingArea("PUTT_5_10"), "PUTT_5_10");
    assert.equal(omraadeKodeTilTrainingArea(null), "TEE");
  });

  it("mapper teknisk oppgave til SourceItem med komplett drill-objekt", () => {
    const oppgave: TekniskPanelOppgave = {
      id: "task-42",
      planId: "plan-1",
      tittel: "Flatt venstre håndledd",
      pNummer: "P4.0",
      pNavn: "Topp",
      pHoved: "P4.0",
      hovedfokus: true,
      slagNavn: "7-jern lav fade",
      omraadeKode: "INNSPILL_150",
      omraadeLabel: "Innspill ~150 m",
      koller: ["7-jern"],
      motorikk: "LAV_HAST",
      dimensjon: "TREFFPUNKT",
      maaleutstyr: "TRACKMAN",
      pyramide: "TEK",
      restUtenBall: 0,
      restLavFart: 50,
      restAuto: 30,
      restTotalt: 80,
      repsEnhet: "SLAG",
      undertekst: "7-jern · Innspill ~150 m · Lav hastighet",
    };

    const item = tekniskOppgaveToSourceItem(oppgave);

    assert.equal(item.id, "tek:task-42");
    assert.equal(item.kind, "TEK");
    assert.equal(item.title, "P4.0 · Flatt venstre håndledd");
    assert.ok(item.subtitle?.includes("Rest: 80 slag"));
    assert.equal(item.pyramid, "TEK");
    assert.equal(item.area, "INNSPILL_150");
    assert.equal(item.positionTaskId, "task-42");
    assert.ok(item.tags?.includes("HOVEDFOKUS"));
    assert.ok(item.tags?.includes("P4.0"));
    assert.ok(item.tags?.includes("7-jern"));
    assert.ok(item.tags?.includes("TREFFPUNKT"));

    assert.ok(item.drill);
    assert.equal(item.drill.title, "P4.0 Flatt venstre håndledd");
    assert.equal(item.drill.techniqueFocus, "P4.0");
    assert.equal(item.drill.sourceId, "task-42");
    assert.equal(item.drill.akFormel.pyramid, "TEK");
    assert.equal(item.drill.akFormel.area, "INNSPILL_150");
    assert.equal(item.drill.akFormel.motorikk, "LAV_HAST");
  });
});
