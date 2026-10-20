import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { avgjorRelasjon, synlighet } from "./tilgang-regler";

const base = { betrakterId: "u1", spillerId: "u2", betrakterRolle: "COACH", erCoachetAvBetrakter: false, harGjeldendeDeling: false };

describe("synlighet", () => {
  it("spilleren selv ser profilen, men ikke golf-ID", () => {
    assert.deepEqual(synlighet("SELV"), { kanSe: true, kanSeGolfId: false });
  });
  it("trenere ser profil og golf-ID", () => {
    assert.deepEqual(synlighet("AK_COACH"), { kanSe: true, kanSeGolfId: true });
    assert.deepEqual(synlighet("ORG_TRENER"), { kanSe: true, kanSeGolfId: true });
  });
  it("ingen relasjon gir ingenting", () => {
    assert.deepEqual(synlighet("INGEN"), { kanSe: false, kanSeGolfId: false });
  });
});

describe("avgjorRelasjon", () => {
  it("egen profil er SELV", () => {
    assert.equal(avgjorRelasjon({ ...base, betrakterId: "u2", betrakterRolle: "PLAYER" }), "SELV");
  });
  it("forelder med samme id-sammenfall får ikke SELV", () => {
    assert.equal(avgjorRelasjon({ ...base, betrakterId: "u2", betrakterRolle: "PARENT" }), "INGEN");
  });
  it("coachet spiller gir AK_COACH", () => {
    assert.equal(avgjorRelasjon({ ...base, erCoachetAvBetrakter: true }), "AK_COACH");
  });
  it("organisasjonstrener trenger gjeldende deling", () => {
    assert.equal(avgjorRelasjon(base), "INGEN");
    assert.equal(avgjorRelasjon({ ...base, harGjeldendeDeling: true }), "ORG_TRENER");
  });
  it("deling gir ikke tilgang til andre roller enn trener", () => {
    assert.equal(avgjorRelasjon({ ...base, betrakterRolle: "PLAYER", harGjeldendeDeling: true }), "INGEN");
    assert.equal(avgjorRelasjon({ ...base, betrakterRolle: "PARENT", harGjeldendeDeling: true }), "INGEN");
  });
});
