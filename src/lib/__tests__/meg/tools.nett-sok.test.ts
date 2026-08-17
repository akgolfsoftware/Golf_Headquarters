// Test for nett_sok-verktøyets definisjon (Perplexity Sonar). Tester det
// unaturlig eksporterte tool-objektet direkte (nettSokTool) — IKKE via
// MEG_ALL_TOOLS/megExecutorsFor, siden hele testsuiten kjører i delt
// prosess og tools.ts (med sin isPerplexityEnabled()-sjekk ved import-tid)
// derfor allerede kan være lastet av en annen testfil før denne kjører.
// Selve nett_sok-utførelsen dekkes av perplexity.test.ts (klienten den
// kaller); den betingede registreringen i MEG_ALL_TOOLS er verifisert ved
// kodegjennomgang (tools.ts: `...(isPerplexityEnabled() ? [nettSokTool] : [])`).
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { nettSokTool } from "@/lib/meg/tools";

describe("nettSokTool", () => {
  it("heter nett_sok og krever sporsmal", () => {
    assert.equal(nettSokTool.name, "nett_sok");
    assert.deepEqual(nettSokTool.input_schema.required, ["sporsmal"]);
  });

  it("beskrivelsen forbyr personnavn på spillere/elever (PII-regel)", () => {
    const beskrivelse = nettSokTool.description ?? "";
    assert.match(beskrivelse.toLowerCase(), /spiller/);
    assert.match(beskrivelse.toLowerCase(), /elev/);
    assert.match(beskrivelse.toLowerCase(), /aldri/);
  });
});
