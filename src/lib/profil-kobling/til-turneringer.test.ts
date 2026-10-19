import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { tilTurneringer, turneringsDato } from "./til-turneringer";
import { lesTurneringsresultat } from "@/lib/domain/turneringsresultat";
import type { ProfilTurnering } from "./typer";

// Fiktive turneringer.
const t = (over: Partial<ProfilTurnering> = {}): ProfilTurnering => ({
  tournament_id: 7, turnering: "Testcup", start_date: "2026-06-12", year: 2026, kilde: "olyo", series: null,
  klasse: "G15", plassering: 3, total_score: 150, to_par: 6,
  runder: [{ runde: 1, score: 75, til_par: 3, mot_felt: null }, { runde: 2, score: 75, til_par: 3, mot_felt: null }],
  ...over,
});

describe("tilTurneringer", () => {
  it("gir brutto, plassering og runder gjennom den felles resultatleseren", () => {
    const [rad] = tilTurneringer([t()]);
    const r = lesTurneringsresultat(rad.resultat);
    assert.equal(r.brutto, 150);
    assert.equal(r.plassering, 3);
    assert.deepEqual(r.runder.map((x) => x.brutto), [75, 75]);
    assert.equal(rad.id, "dashboard:7");
    assert.equal(rad.kilde, "OLYO");
  });
  it("tar ut netto-klasser", () => {
    assert.equal(tilTurneringer([t({ klasse: "Herrer netto" }), t({ klasse: "H-N" })]).length, 0);
  });
  it("hopper over rader uten dato og år, bruker året når datoen mangler", () => {
    assert.equal(tilTurneringer([t({ start_date: null, year: null })]).length, 0);
    assert.equal(turneringsDato({ start_date: null, year: 2019 })?.getUTCFullYear(), 2019);
  });
  it("en turnering uten score eller plassering teller ikke som spilt", () => {
    const [rad] = tilTurneringer([t({ plassering: null, total_score: null, to_par: null, runder: null })]);
    assert.equal(rad.resultat.status, "REGISTERED");
  });
});
