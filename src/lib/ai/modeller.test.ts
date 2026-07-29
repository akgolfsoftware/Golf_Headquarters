import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { modelFor, nivaaFor, MODELL } from "./modeller";

describe("modelFor", () => {
  test("tung analyse går på opus", () => {
    for (const id of [
      "plan-revisjon",
      "sg-analyse-ekspert",
      "peaking-agent",
      "swing-video-analyst",
      "plan-effectiveness-agent",
      "ai-code-reviewer",
    ]) {
      assert.equal(modelFor(id), MODELL.opus, `${id} skal være opus`);
    }
  });

  test("synk og purring går på haiku", () => {
    for (const id of [
      "notion-sync",
      "calendar-sync",
      "wagr-sync",
      "betalings-purring",
      "lead-oppfolging",
    ]) {
      assert.equal(modelFor(id), MODELL.haiku, `${id} skal være haiku`);
    }
  });

  test("monitor-familiene treffer haiku via mønster", () => {
    assert.equal(modelFor("booking-conflict-monitor"), MODELL.haiku);
    assert.equal(modelFor("availability-24-7-monitor"), MODELL.haiku);
  });

  // Kjernen i presedensregelen: uten «eksakt slår mønster» ville meg-familien
  // dratt disse to opp på sonnet, og de hadde kjørt dyrere enn de trenger.
  test("eksakt treff slår mønster — meg-unntakene blir haiku", () => {
    assert.equal(modelFor("meg-loftesjekk"), MODELL.haiku);
    assert.equal(modelFor("meg-crm-nudge"), MODELL.haiku);
  });

  test("resten av meg-familien er sonnet", () => {
    assert.equal(modelFor("meg-morgenbrief"), MODELL.sonnet);
    assert.equal(modelFor("meg-kveldsjournal"), MODELL.sonnet);
    assert.equal(modelFor("meg-wang-agenda"), MODELL.sonnet);
  });

  test("kjente sonnet-agenter og ukjent id faller på sonnet", () => {
    assert.equal(modelFor("caddie"), MODELL.sonnet);
    assert.equal(modelFor("caddie-proactive"), MODELL.sonnet);
    assert.equal(modelFor("daily-brief"), MODELL.sonnet);
    assert.equal(modelFor("live-coach-agent"), MODELL.sonnet);
    assert.equal(modelFor("demand-predictor"), MODELL.sonnet);
    assert.equal(modelFor("en-agent-som-ikke-finnes"), MODELL.sonnet);
  });

  test("nivaaFor speiler modelFor", () => {
    assert.equal(nivaaFor("ai-code-reviewer"), "opus");
    assert.equal(nivaaFor("wagr-sync"), "haiku");
    assert.equal(nivaaFor("caddie"), "sonnet");
  });
});
