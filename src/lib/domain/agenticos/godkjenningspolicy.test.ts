import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  AGENTICOS_FORBYR_OK_GRONN,
  kreverStartGodkjenning,
  ruteForOppgave,
  type AgenticosOppgave,
} from "./godkjenningspolicy";

function oppgave(overstyr: Partial<AgenticosOppgave> = {}): AgenticosOppgave {
  return {
    runtime: "lokal",
    area: "SPORT",
    writeTargets: "none",
    kind: "research",
    ...overstyr,
  };
}

describe("agenticos · AO-12 A3", () => {
  it("sky-runtime krever start-godkjenning når det skal skrives", () => {
    const o = oppgave({ runtime: "sky", kind: "handling", writeTargets: "note" });
    assert.equal(kreverStartGodkjenning(o), true);
    assert.equal(ruteForOppgave(o), "GODKJENN_START");
  });

  it("ØKONOMI / PERSONLIG / DRIFT krever start-godkjenning", () => {
    assert.equal(ruteForOppgave(oppgave({ area: "OKONOMI", kind: "handling", writeTargets: "note" })), "GODKJENN_START");
    assert.equal(ruteForOppgave(oppgave({ area: "PERSONLIG", kind: "handling", writeTargets: "note" })), "GODKJENN_START");
    assert.equal(ruteForOppgave(oppgave({ area: "DRIFT", kind: "handling", writeTargets: "note" })), "GODKJENN_START");
  });

  it("writeTargets note krever start-godkjenning", () => {
    assert.equal(ruteForOppgave(oppgave({ kind: "handling", writeTargets: "note" })), "GODKJENN_START");
  });
});

describe("agenticos · AO-12 C3", () => {
  it("research uten skriv blir Cockpit-badge, ikke kø", () => {
    const o = oppgave({ runtime: "sky", area: "OKONOMI", writeTargets: "none", kind: "research" });
    assert.equal(kreverStartGodkjenning(o), false);
    assert.equal(ruteForOppgave(o), "COCKPIT_BADGE");
  });
});

describe("agenticos · ingen direkte Workbench-write", () => {
  it("writeTargets workbench er DIREKTE_FORBUDT", () => {
    assert.equal(ruteForOppgave(oppgave({ kind: "handling", writeTargets: "workbench" })), "DIREKTE_FORBUDT");
  });
});

describe("agenticos · B1", () => {
  it("ok-grønn er forbudt i AgenticOS", () => {
    assert.equal(AGENTICOS_FORBYR_OK_GRONN, true);
  });
});
