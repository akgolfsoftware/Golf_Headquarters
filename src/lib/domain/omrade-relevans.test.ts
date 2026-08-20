import { test } from "node:test";
import assert from "node:assert/strict";

import { OMRAADE_KODER } from "@/lib/domain/ak-formel-v2";
import {
  dimensjonerFor,
  erGyldigDimensjon,
  gjelder,
  relevansFor,
  vaskMotRelevans,
} from "@/lib/domain/omrade-relevans";

test("motorikk gjelder KUN de fem fullsving-områdene", () => {
  const medMotorikk = OMRAADE_KODER.filter((k) => relevansFor(k).motorikk);
  assert.deepEqual(medMotorikk, [
    "TEE_TOTAL",
    "INNSPILL_200",
    "INNSPILL_150",
    "INNSPILL_100",
    "INNSPILL_50",
  ]);
  // Anders 20.08: heller ikke chip/pitch/lob — det var førsteutkastets feil.
  assert.equal(gjelder("CHIP", "motorikk"), false);
  assert.equal(gjelder("PITCH", "motorikk"), false);
  assert.equal(gjelder("LOB", "motorikk"), false);
  assert.equal(gjelder("BUNKER", "motorikk"), false);
  assert.equal(gjelder("PUTT_0_3", "motorikk"), false);
  assert.equal(gjelder("BANE", "motorikk"), false);
});

test("sandtrinnet finnes kun på bunker", () => {
  const medSand = OMRAADE_KODER.filter((k) => relevansFor(k).sandTrinn);
  assert.deepEqual(medSand, ["BUNKER"]);
});

test("FYS har verken motorikk, dimensjon eller synlig press", () => {
  for (const kode of ["STYRKE", "KONDISJON", "BEVEGELIGHET"] as const) {
    const r = relevansFor(kode);
    assert.equal(r.motorikk, false, kode);
    assert.equal(r.dimensjon, false, kode);
    assert.equal(r.press, false, kode);
    assert.equal(r.belastning, false, kode);
    assert.equal(r.fysParametere, true, kode);
    assert.deepEqual(dimensjonerFor(kode), []);
  }
});

test("alle seks puttebånd har de fire puttingdimensjonene", () => {
  const putt = OMRAADE_KODER.filter((k) => k.startsWith("PUTT_"));
  assert.equal(putt.length, 6);
  for (const kode of putt) {
    const dims = [...dimensjonerFor(kode)].sort();
    assert.deepEqual(dims, ["BALLSTART", "GREENLESING", "LENGDEKONTROLL", "SIKTE"], kode);
  }
  // Vektingen ligger i rekkefølgen: kort putt starter på ballstart, lang på lengde.
  assert.equal(dimensjonerFor("PUTT_0_3")[0], "BALLSTART");
  assert.equal(dimensjonerFor("PUTT_40_PLUSS")[0], "LENGDEKONTROLL");
});

test("hvert ikke-FYS-område har minst én dimensjon å velge", () => {
  for (const kode of OMRAADE_KODER) {
    const antall = dimensjonerFor(kode).length;
    if (relevansFor(kode).dimensjon) assert.ok(antall > 0, kode);
    else assert.equal(antall, 0, kode);
  }
});

test("vask fjerner motorikk når området ikke har den", () => {
  const vasket = vaskMotRelevans({
    omraade: "PUTT_5_10" as const,
    motorikk: "AUTO",
    belastning: "BANE",
    press: "OBSERVERT",
    dimensjon: "GREENLESING" as const,
    sandTrinn: "MED_BALL",
  });
  assert.equal(vasket.motorikk, null);
  assert.equal(vasket.sandTrinn, null);
  assert.equal(vasket.dimensjon, "GREENLESING");
  assert.equal(vasket.belastning, "BANE");
});

test("vask forkaster en dimensjon som ikke hører til området", () => {
  // SANDINNGANG er bunkerens dimensjon — den skal ikke overleve på en putt-drill.
  const vasket = vaskMotRelevans({
    omraade: "PUTT_0_3" as const,
    dimensjon: "SANDINNGANG" as const,
  });
  assert.equal(vasket.dimensjon, null);
  assert.equal(erGyldigDimensjon("PUTT_0_3", "SANDINNGANG"), false);
  assert.equal(erGyldigDimensjon("BUNKER", "SANDINNGANG"), true);
});

test("FYS får defaultverdier i stedet for tomme akser", () => {
  const vasket = vaskMotRelevans({
    omraade: "STYRKE" as const,
    motorikk: "AUTO",
    press: "TURNERING",
    belastning: "KONKURRANSE",
    dimensjon: "SIKTE" as const,
  });
  assert.equal(vasket.motorikk, null);
  assert.equal(vasket.dimensjon, null);
  assert.equal(vasket.press, "ALENE");
  assert.equal(vasket.belastning, "INNENDORS");
});
