import test from "node:test";
import assert from "node:assert/strict";
import {
  ANALYSE_FANER,
  ANALYSE_STANDARDFANE,
  ANALYSE_STALL_TREND_HREF,
  analyseHref,
  erAnalyseFaneId,
  velgAnalyseFane,
} from "./faner";

/**
 * MASTERPLAN 15.8: tre adresser ble til én. Disse testene låser at
 * fanelogikken aldri utvider tilgangen kildesidene hadde, og at hver fane
 * peker på adressen den erstattet (eller null når den ikke fantes som egen
 * adresse fra før).
 */

test("tre faner, i canvas-rekkefølgen (Spiller · Stall · Etterlevelse)", () => {
  assert.deepEqual(
    ANALYSE_FANER.map((f) => f.id),
    ["spiller", "stall", "etterlevelse"],
  );
});

test("hver fane med en gammel adresse peker på den den erstattet", () => {
  const gamle = ANALYSE_FANER.map((f) => f.gammelHref);
  assert.deepEqual(gamle, [null, "/admin/analyse", "/admin/analysere/compliance"]);
  const ikkeNull = gamle.filter((g): g is string => g !== null);
  assert.equal(new Set(ikkeNull).size, ikkeNull.length, "ingen adresse to ganger");
});

test("«tester» er IKKE en fane — utenfor MASTERPLAN 15.8s kildeliste, se faner.ts", () => {
  assert.equal(
    ANALYSE_FANER.some((f) => (f.id as string) === "tester"),
    false,
  );
});

test("standardfanen er «stall», ikke «spiller» — bevarer eksisterende sitewide lenker (se faner.ts AVVIK)", () => {
  assert.equal(ANALYSE_STANDARDFANE, "stall");
});

test("velgAnalyseFane faller tilbake til standardfanen ved ukjent/manglende verdi", () => {
  assert.equal(velgAnalyseFane(undefined), "stall");
  assert.equal(velgAnalyseFane("noe-ukjent"), "stall");
  assert.equal(velgAnalyseFane("spiller"), "spiller");
  assert.equal(velgAnalyseFane("etterlevelse"), "etterlevelse");
});

test("erAnalyseFaneId skiller gyldige fra ugyldige verdier", () => {
  assert.equal(erAnalyseFaneId("stall"), true);
  assert.equal(erAnalyseFaneId("spiller"), true);
  assert.equal(erAnalyseFaneId("etterlevelse"), true);
  assert.equal(erAnalyseFaneId("tester"), false);
  assert.equal(erAnalyseFaneId(undefined), false);
});

test("analyseHref: standardfanen får ren adresse, andre får ?fane=", () => {
  assert.equal(analyseHref("stall"), "/admin/analyse");
  assert.equal(analyseHref("spiller"), "/admin/analyse?fane=spiller");
  assert.equal(analyseHref("etterlevelse"), "/admin/analyse?fane=etterlevelse");
});

test("stall-trend-lenken peker inn i stall-fanen med nestet visning", () => {
  assert.equal(ANALYSE_STALL_TREND_HREF, "/admin/analyse?fane=stall&visning=trend");
});
