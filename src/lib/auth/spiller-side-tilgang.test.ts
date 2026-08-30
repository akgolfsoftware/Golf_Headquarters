/**
 * Regresjon for de to IDOR-funnene fra arkitektur-kartleggingen 30.08.2026:
 * en spiller kunne åpne en hvilken som helst annen spillers profil, og
 * WANG-IUP-siden manglet rollesperre. Rene enhetstester uten DB — de
 * DB-avhengige bitene (coach-scope, ParentRelation) sendes inn som booleans.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { kanSeSpillerprofil, kanSeIup } from "./spiller-side-tilgang";

test("spillerprofil: egen profil er alltid synlig", () => {
  assert.equal(
    kanSeSpillerprofil({ id: "p1", role: "PLAYER" }, "p1", false),
    true,
  );
});

test("spillerprofil: IDOR-kjernen — en annen spiller ser IKKE en fremmed profil", () => {
  assert.equal(
    kanSeSpillerprofil({ id: "p1", role: "PLAYER" }, "p2", false),
    false,
  );
});

test("spillerprofil: coach uten tilgang til nettopp denne spilleren avvises", () => {
  assert.equal(
    kanSeSpillerprofil({ id: "coach-a", role: "COACH" }, "p2", false),
    false,
  );
});

test("spillerprofil: coach MED bekreftet tilgang slipper inn", () => {
  assert.equal(
    kanSeSpillerprofil({ id: "coach-a", role: "COACH" }, "p2", true),
    true,
  );
});

test("spillerprofil: PARENT/GUEST er aldri en gyldig vei inn, uansett flagg", () => {
  assert.equal(
    kanSeSpillerprofil({ id: "x", role: "PARENT" }, "p2", true),
    false,
  );
  assert.equal(
    kanSeSpillerprofil({ id: "x", role: "GUEST" }, "p2", true),
    false,
  );
});

test("iup: ADMIN og COACH ser alle elever", () => {
  assert.equal(kanSeIup({ id: "a1", role: "ADMIN" }, "elev-1", false), true);
  assert.equal(kanSeIup({ id: "c1", role: "COACH" }, "elev-1", false), true);
});

test("iup: eleven ser sin egen IUP", () => {
  assert.equal(
    kanSeIup({ id: "elev-1", role: "PLAYER" }, "elev-1", false),
    true,
  );
});

test("iup: IDOR-kjernen — en annen spiller ser IKKE en fremmed elevs IUP", () => {
  assert.equal(
    kanSeIup({ id: "elev-2", role: "PLAYER" }, "elev-1", false),
    false,
  );
});

test("iup: foresatt uten bekreftet ParentRelation avvises", () => {
  assert.equal(
    kanSeIup({ id: "foresatt-1", role: "PARENT" }, "elev-1", false),
    false,
  );
});

test("iup: foresatt MED bekreftet ParentRelation til nettopp denne eleven slipper inn", () => {
  assert.equal(
    kanSeIup({ id: "foresatt-1", role: "PARENT" }, "elev-1", true),
    true,
  );
});

test("iup: GUEST er aldri en gyldig vei inn", () => {
  assert.equal(kanSeIup({ id: "g1", role: "GUEST" }, "elev-1", true), false);
});
