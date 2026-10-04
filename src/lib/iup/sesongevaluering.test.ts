import assert from "node:assert/strict";
import { test } from "node:test";
import { hentSesongevalueringKilde, hentSesongsporsmal, lesSesongevaluering, type IupSesongevaluering } from "./sesongevaluering";
import { IUP_VERSJONER, type IupVersjon } from "./utviklingssjekk";

function full(versjon: IupVersjon = "iup-2027"): IupSesongevaluering {
  const sporsmal = hentSesongsporsmal(versjon);
  return {
    versjon, sesongStart: "2025-10-01", sesongSlutt: "2026-09-30", status: "LEVERT",
    fritekst: Object.fromEntries(sporsmal.filter((s) => s.type === "FRITEKST").map((s) => [s.id, "Syntetisk egenvurdering"])),
    vurderinger: Object.fromEntries(sporsmal.filter((s) => s.type === "SKALA").map((s) => [s.id, 3])),
    fordelingFaktisk: { FYS: 20, TEK: 20, SLAG: 20, SPILL: 20, TURN: 20 },
    fordelingPlanlagt: { FYS: 25, TEK: 15, SLAG: 25, SPILL: 25, TURN: 10 },
    forbedringspunkter: ["Bedre øktplanlegging", "Følge opp innspill", "Evaluere gjennomføringen"],
  };
}

test("sesongkildene har tre fritekstsvar og ti vurderinger på originalskala 1–4", () => {
  for (const versjon of IUP_VERSJONER) {
    const sporsmal = hentSesongsporsmal(versjon);
    assert.equal(sporsmal.length, 13);
    assert.equal(sporsmal.filter((s) => s.type === "FRITEKST").length, 3);
    assert.equal(sporsmal.filter((s) => s.type === "SKALA").length, 10);
    assert.deepEqual(hentSesongevalueringKilde(versjon).skala, { min: 1, maks: 4 });
    assert.equal(sporsmal[0].celle, "B2");
    assert.equal(sporsmal[0].tekst, "Hva har du gjort bra denne sesongen?");
    assert.ok(lesSesongevaluering(full(versjon)).ok);
  }
});

test("utkast beholder mangler; tomme svar og fordelinger blir ikke levert som null", () => {
  const data = { ...full(), fritekst: {}, vurderinger: {}, fordelingFaktisk: {}, fordelingPlanlagt: {}, forbedringspunkter: [] };
  const lest = lesSesongevaluering({ ...data, status: "UTKAST" });
  assert.ok(lest.ok);
  assert.equal(lest.mangler.length, 26);
  assert.deepEqual(lest.data.fordelingFaktisk, {});
  assert.equal(lesSesongevaluering(data).ok, false);
});

test("hver av de tre tekstene, ti vurderingene og tre forbedringspunktene kreves", () => {
  const data = full();
  for (const id of Object.keys(data.fritekst)) {
    assert.equal(lesSesongevaluering({ ...data, fritekst: { ...data.fritekst, [id]: "  " } }).ok, false);
  }
  for (const id of Object.keys(data.vurderinger)) {
    const vurderinger = { ...data.vurderinger }; delete vurderinger[id];
    assert.equal(lesSesongevaluering({ ...data, vurderinger }).ok, false);
  }
  assert.equal(lesSesongevaluering({ ...data, forbedringspunkter: ["A", "B", "  "] }).ok, false);
});

test("1–5 fra utviklingssjekken kan ikke brukes i årsevalueringen", () => {
  const data = full(); const id = Object.keys(data.vurderinger)[0];
  for (const verdi of [0, 5, 1.5, "4", null]) {
    assert.equal(lesSesongevaluering({ ...data, vurderinger: { ...data.vurderinger, [id]: verdi } }).ok, false);
  }
  for (const verdi of [1, 4]) assert.ok(lesSesongevaluering({ ...data, vurderinger: { ...data.vurderinger, [id]: verdi } }).ok);
});

test("prosentfordeling krever fem faktiske verdier og separat sum på 100 i hver periode", () => {
  const data = full();
  for (const navn of ["fordelingFaktisk", "fordelingPlanlagt"] as const) {
    for (const TURN of [19.9, 20.1, -1, 101, NaN, Infinity]) {
      assert.equal(lesSesongevaluering({ ...data, [navn]: { FYS: 20, TEK: 20, SLAG: 20, SPILL: 20, TURN } }).ok, false);
    }
    assert.equal(lesSesongevaluering({ ...data, [navn]: { FYS: 25, TEK: 25, SLAG: 25, SPILL: 25 } }).ok, false);
    assert.ok(lesSesongevaluering({ ...data, [navn]: { FYS: 25, TEK: 25, SLAG: 25, SPILL: 25, TURN: 0 } }).ok);
    assert.ok(lesSesongevaluering({ ...data, [navn]: { FYS: 33.3, TEK: 33.3, SLAG: 33.4, SPILL: 0, TURN: 0 } }).ok);
  }
});

test("feil kildeår, ukjent spørsmålstype og ekstra områder avvises", () => {
  assert.equal(lesSesongevaluering({ ...full(), versjon: "iup-2025" }).ok, false);
  assert.equal(lesSesongevaluering({ ...full(), fritekst: { ...full().fritekst, "iup-2027-sesong-b11": "Feil type" } }).ok, false);
  assert.equal(lesSesongevaluering({ ...full(), fordelingFaktisk: { ...full().fordelingFaktisk, ANNEN: 0 } }).ok, false);
  assert.equal(lesSesongevaluering({ ...full(), userId: "annen-spiller" }).ok, false);
});

test("sesongen er eksplisitt og ekte kalenderdatoer kontrolleres", () => {
  for (const data of [
    { ...full(), sesongStart: "2026-10-01" },
    { ...full(), sesongStart: "2025-02-29" },
    { ...full(), sesongSlutt: "2026-09-31" },
    { ...full(), sesongStart: undefined },
  ]) assert.equal(lesSesongevaluering(data).ok, false);
  assert.ok(lesSesongevaluering({ ...full(), sesongStart: "2024-02-29", sesongSlutt: "2024-12-31" }).ok);
});
