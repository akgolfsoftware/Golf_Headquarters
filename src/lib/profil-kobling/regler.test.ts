import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { byggOppslag, filtrerKandidater, normaliserGolfId, stemmerMedProfil } from "./regler";
import type { Kandidat } from "./typer";

// Kun fiktive personer (AGENTS.md §Data og sikkerhet).
const PIA = { name: "Pia Egenes", dateOfBirth: new Date("2009-04-12T00:00:00Z") };

const kandidat = (over: Partial<Kandidat> = {}): Kandidat => ({
  person_id: 1,
  name: "Pia Marie Egenes",
  birth_year: 2009,
  club: "Testklubb GK",
  tournaments: 3,
  evidence: [],
  ...over,
});

describe("normaliserGolfId", () => {
  it("tåler bindestrek, mellomrom og bokstaver", () => {
    assert.equal(normaliserGolfId("303-579"), "303579");
    assert.equal(normaliserGolfId(" 303 579 "), "303579");
    assert.equal(normaliserGolfId("GID 42-30110"), "4230110");
  });
  it("avviser for kort, for langt og tomt", () => {
    assert.equal(normaliserGolfId("12-3"), null);
    assert.equal(normaliserGolfId("1234567890123"), null);
    assert.equal(normaliserGolfId(""), null);
    assert.equal(normaliserGolfId(null), null);
  });
});

describe("byggOppslag", () => {
  it("henter navn og fødselsår fra profilen, ikke fra klienten", () => {
    const r = byggOppslag(PIA, "");
    assert.deepEqual(r, { ok: true, oppslag: { golfId: null, navn: "Pia Egenes", fodselsaar: 2009 } });
  });
  it("tar med golf-ID når den er oppgitt", () => {
    const r = byggOppslag(PIA, "303-579");
    assert.equal(r.ok && r.oppslag.golfId, "303579");
  });
  it("uten fødselsdato og uten golf-ID gir en beskjed, ikke et gjett", () => {
    const r = byggOppslag({ name: "Pia Egenes", dateOfBirth: null }, "");
    assert.equal(r.ok, false);
  });
  it("uten fødselsdato går det an med golf-ID", () => {
    assert.equal(byggOppslag({ name: "Pia Egenes", dateOfBirth: null }, "303-579").ok, true);
  });
  it("en golf-ID som ikke er gyldig gir en feil, den ignoreres ikke stille", () => {
    const r = byggOppslag(PIA, "12");
    assert.equal(r.ok, false);
  });
});

describe("stemmerMedProfil", () => {
  it("godtar samme fornavn og etternavn, uavhengig av mellomnavn og store bokstaver", () => {
    assert.equal(stemmerMedProfil(PIA, kandidat()), true);
    assert.equal(stemmerMedProfil(PIA, kandidat({ name: "PIA EGENES" })), true);
  });
  it("avviser en kjent golf-ID med et annet navn", () => {
    assert.equal(stemmerMedProfil(PIA, kandidat({ name: "Nils Annen" })), false);
    assert.equal(stemmerMedProfil(PIA, kandidat({ name: "Pia Hansen" })), false);
  });
  it("avviser ulikt fødselsår, men ikke når kandidaten mangler fødselsår", () => {
    assert.equal(stemmerMedProfil(PIA, kandidat({ birth_year: 2011 })), false);
    assert.equal(stemmerMedProfil(PIA, kandidat({ birth_year: null })), true);
  });
  it("avviser ett-ords navn: for lite å gå på", () => {
    assert.equal(stemmerMedProfil({ name: "Pia", dateOfBirth: null }, kandidat({ name: "Pia" })), false);
  });
  it("æ, ø og å sammenlignes riktig", () => {
    const b = { name: "Åse Bjørk", dateOfBirth: null };
    assert.equal(stemmerMedProfil(b, kandidat({ name: "åse bjørk", birth_year: null })), true);
  });
});

describe("filtrerKandidater", () => {
  it("slipper bare gjennom kandidater som stemmer med profilen", () => {
    const ut = filtrerKandidater(PIA, [
      kandidat({ person_id: 1 }),
      kandidat({ person_id: 2, name: "Nils Annen" }),
      kandidat({ person_id: 3, birth_year: 2005 }),
    ]);
    assert.deepEqual(ut.map((k) => k.person_id), [1]);
  });
});
