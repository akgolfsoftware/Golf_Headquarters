import { test } from "node:test";
import assert from "node:assert/strict";

import {
  fremdrift,
  fullMatrise,
  prioritetFarge,
  skalVarsleHovedcoach,
  tellMotMatrise,
  type MatriseCelle,
} from "@/lib/domain/teknisk-maalmatrise";

test("full matrise er alltid 12 celler: 3 motorikk × 4 belastning", () => {
  const celler = fullMatrise([]);
  assert.equal(celler.length, 12);
  assert.equal(celler.every((c) => c.maalReps === 0 && c.gjortReps === 0), true);
});

test("reps telles mot riktig celle, ikke bare mot motorikk-totalen", () => {
  // Anders 20.08: UTEN_BALL 500 innendørs + 500 på bane er to ulike mål.
  const maal = [
    { motorikk: "UTEN_BALL" as const, belastning: "INNENDORS" as const, maalReps: 500 },
    { motorikk: "UTEN_BALL" as const, belastning: "BANE" as const, maalReps: 500 },
  ];
  const celler = tellMotMatrise(maal, [
    { motorikk: "UTEN_BALL", belastning: "INNENDORS", reps: 300 },
    { motorikk: "UTEN_BALL", belastning: "INNENDORS", reps: 100 },
    { motorikk: "UTEN_BALL", belastning: "BANE", reps: 50 },
  ]);
  const inne = celler.find((c) => c.motorikk === "UTEN_BALL" && c.belastning === "INNENDORS");
  const bane = celler.find((c) => c.motorikk === "UTEN_BALL" && c.belastning === "BANE");
  assert.equal(inne?.gjortReps, 400);
  assert.equal(bane?.gjortReps, 50);
});

test("logger uten kjent kontekst teller ikke mot noen celle", () => {
  const celler = tellMotMatrise(
    [{ motorikk: "AUTO", belastning: "BANE", maalReps: 100 }],
    [{ motorikk: "AUTO", belastning: null, reps: 60 }],
  );
  const celle = celler.find((c) => c.motorikk === "AUTO" && c.belastning === "BANE");
  assert.equal(celle?.gjortReps, 0);
});

test("telling er rekalkulering — samme logger gir samme tall", () => {
  const maal = [{ motorikk: "LAV_HAST" as const, belastning: "TRENINGSOMRAADE" as const, maalReps: 200 }];
  const logger = [{ motorikk: "LAV_HAST" as const, belastning: "TRENINGSOMRAADE" as const, reps: 75 }];
  const en = tellMotMatrise(maal, logger);
  const to = tellMotMatrise(maal, logger);
  assert.deepEqual(en, to);
});

test("overskudd i én celle dekker ikke over en celle som mangler", () => {
  const f = fremdrift([
    { motorikk: "UTEN_BALL", belastning: "INNENDORS", maalReps: 100, gjortReps: 400 },
    { motorikk: "UTEN_BALL", belastning: "BANE", maalReps: 100, gjortReps: 0 },
  ]);
  assert.equal(f.maalTotalt, 200);
  assert.equal(f.gjortTotalt, 100);
  assert.equal(f.andel, 0.5);
  assert.equal(f.alleMaalNaadd, false);
  assert.equal(f.gjenstaaende.length, 1);
});

test("uten mål er fremdriften 0 — aldri «100 % ferdig» av ingenting", () => {
  const f = fremdrift(fullMatrise([]));
  assert.equal(f.andel, 0);
  assert.equal(f.alleMaalNaadd, false);
});

test("hovedcoach varsles én gang når alle rep-mål er nådd", () => {
  const naadd: MatriseCelle[] = [
    { motorikk: "AUTO", belastning: "BANE", maalReps: 100, gjortReps: 100 },
  ];
  assert.equal(skalVarsleHovedcoach(naadd, null), true);
  // Ikke på nytt ved neste logging.
  assert.equal(skalVarsleHovedcoach(naadd, new Date("2026-08-20T10:00:00Z")), false);

  const ikkeNaadd: MatriseCelle[] = [
    { motorikk: "AUTO", belastning: "BANE", maalReps: 100, gjortReps: 99 },
  ];
  assert.equal(skalVarsleHovedcoach(ikkeNaadd, null), false);
});

test("prioritetsfargen: clay for aktive, grønn for fullført, aldri rød", () => {
  const uferdig = fremdrift([
    { motorikk: "AUTO", belastning: "BANE", maalReps: 100, gjortReps: 10 },
  ]);
  const ferdig = fremdrift([
    { motorikk: "AUTO", belastning: "BANE", maalReps: 100, gjortReps: 100 },
  ]);

  assert.equal(prioritetFarge({ rangering: 0, hviler: false, fremdrift: uferdig }), "CLAY");
  assert.equal(prioritetFarge({ rangering: 5, hviler: false, fremdrift: uferdig }), "BLEKK");
  assert.equal(prioritetFarge({ rangering: 0, hviler: true, fremdrift: uferdig }), "DEMPET");
  assert.equal(prioritetFarge({ rangering: 9, hviler: false, fremdrift: ferdig }), "GRONN");
});

test("i konkurranseblokk vises maks to i clay, resten dempes", () => {
  const f = fremdrift([{ motorikk: "AUTO", belastning: "BANE", maalReps: 100, gjortReps: 0 }]);
  const farge = (rangering: number) =>
    prioritetFarge({ rangering, hviler: false, fremdrift: f, blokkType: "KONKURRANSE" });
  assert.equal(farge(0), "CLAY");
  assert.equal(farge(1), "CLAY");
  assert.equal(farge(2), "DEMPET");
  // Utenfor konkurranseblokk er tredjeplassen fortsatt aktiv — ingen sperre noe sted.
  assert.equal(
    prioritetFarge({ rangering: 2, hviler: false, fremdrift: f, blokkType: "UTVIKLING" }),
    "CLAY",
  );
});
