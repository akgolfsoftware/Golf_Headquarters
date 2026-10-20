import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggProfilVisning } from "./visning";
import type { KomplettProfil } from "./komplett";

// Kun fiktive personer og turneringer.
const tur = (id: number, dato: string, klasse: string, plass: number, total: number, par: number, kilde = "olyo") => ({
  tournament_id: id, turnering: `Testcup ${id}`, start_date: dato, year: Number(dato.slice(0, 4)), kilde, series: null, klasse,
  plassering: plass, total_score: total, to_par: par, runder: [{ runde: 1, score: 72, til_par: 0, mot_felt: null }, { runde: 2, score: total - 72, til_par: par, mot_felt: null }],
});
const tomRunder = { antall: 0, snittScore: null, sgTotal: null, sgOtt: null, sgApp: null, sgArg: null, sgPutt: null };
const profil = (over: Partial<KomplettProfil> = {}): KomplettProfil => ({
  relasjon: "AK_COACH", navn: "Pia Egenes",
  resultater: { person: { name: "Pia Egenes", birth_year: 2009 }, sesonger: [], monster: [], runder: [], turneringer: [
    tur(1, "2025-06-02", "Damer", 1, 150, 6, "srixon"), tur(2, "2026-09-13", "G17", 4, 144, 0), tur(3, "2026-05-02", "Herrer netto", 2, 140, -4),
  ] },
  tester: [], runder: tomRunder, iup: null, ...over,
});

describe("byggProfilVisning", () => {
  it("grupperer resultater per år, nyeste først, og tar ut netto-klasser", () => {
    const v = byggProfilVisning(profil());
    assert.deepEqual(v.resultater.aar.map((a) => a.aar), [2026, 2025]);
    assert.equal(v.resultater.aar[0].rader.length, 1);
    assert.equal(v.resultater.aar[0].rader[0].slag, "144 (0)");
    assert.equal(v.resultater.aar[1].rader[0].kilde, "GolfBox");
  });
  it("viser golf-ID bare når profilen har den", () => {
    assert.ok(!byggProfilVisning(profil()).identitet.some((f) => f.etikett === "Golf-ID"));
    const med = profil();
    med.resultater!.golf_id = ["303-579"];
    assert.deepEqual(byggProfilVisning(med).identitet.find((f) => f.etikett === "Golf-ID"), { etikett: "Golf-ID", verdi: "303-579" });
  });
  it("sier fra når resultatprofilen ikke er koblet", () => {
    const v = byggProfilVisning(profil({ resultater: null }));
    assert.match(v.resultater.tom ?? "", /ikke koblet/);
    assert.deepEqual(v.identitet, [{ etikett: "Født", verdi: "—" }]);
  });
  it("tomtilstander for tester, runder og IUP", () => {
    const v = byggProfilVisning(profil());
    assert.equal(v.tester.tom, "Ingen registrerte tester.");
    assert.equal(v.runder.tom, "Ingen runder delt med trener.");
    assert.match(v.iup.tom ?? "", /ikke IUP/);
  });
  it("Team Norway-tester vises uten tall og med henvisning", () => {
    const v = byggProfilVisning(profil({ tester: [{ testId: "tn-v3-x", navn: "Driver", omraade: "TEK", antall: 3, sisteDato: new Date("2026-10-01"), sisteScore: null, erTeamNorway: true }] }));
    assert.equal(v.tester.rader[0].siste, "se Team Norway");
    assert.equal(v.tester.harTeamNorway, true);
  });
  it("IUP-svar som avviker fra kilden får advarsel", () => {
    const v = byggProfilVisning(profil({ iup: { maaltall: null, levert: [{ id: "i", type: "UTVIKLINGSSJEKK", versjon: "1", niva: "D", periodeStart: "2026-09-01", periodeSlutt: "2026-09-28", levert: "2026-09-29T08:00:00Z", revisjon: 1, innhold: null, kildeEllerFormatAvviker: true }] } }));
    assert.equal(v.iup.levert[0].svar, "Utviklingssjekk");
    assert.ok(v.iup.levert[0].advarsel);
  });
  it("runder med fortegn på SG", () => {
    const v = byggProfilVisning(profil({ runder: { antall: 12, snittScore: 74.6, sgTotal: 1.24, sgOtt: -0.11, sgApp: null, sgArg: 0, sgPutt: 0.3 } }));
    assert.equal(v.runder.tall.find((t) => t.etikett === "SG totalt")?.verdi, "+1,24");
    assert.equal(v.runder.tall.find((t) => t.etikett === "SG utslag")?.verdi, "-0,11");
    assert.equal(v.runder.tall.find((t) => t.etikett === "SG innspill")?.verdi, "—");
  });
});
