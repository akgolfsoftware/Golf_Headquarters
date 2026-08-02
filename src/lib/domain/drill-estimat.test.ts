import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  beregnVarighetsEstimat,
  estimatIMinutter,
  estimatTekst,
  ESTIMAT_VINDU,
} from "./drill-estimat";

describe("beregnVarighetsEstimat", () => {
  test("null uten historikk", () => {
    assert.equal(beregnVarighetsEstimat([]), null);
  });

  test("én gjennomføring gir den verdien", () => {
    assert.equal(beregnVarighetsEstimat([600]), 600);
  });

  test("median ved oddetall", () => {
    assert.equal(beregnVarighetsEstimat([600, 540, 660]), 600);
  });

  test("median ved partall er snittet av de to midterste", () => {
    assert.equal(beregnVarighetsEstimat([600, 540, 660, 720]), 630);
  });

  test("glemt timer drar ikke estimatet opp", () => {
    // Fire normale økter på ~10 min + én der timeren gikk i to timer.
    const estimat = beregnVarighetsEstimat([600, 7200, 570, 630, 600]);
    assert.equal(estimat, 600, "medianen skal ignorere utelig­geren");
  });

  test("bruker kun de siste ESTIMAT_VINDU gjennomføringene", () => {
    // Nyeste først: fem ferske på 300 s, deretter gamle på 1800 s.
    const varigheter = [300, 300, 300, 300, 300, 1800, 1800, 1800];
    assert.equal(beregnVarighetsEstimat(varigheter), 300);
    assert.equal(ESTIMAT_VINDU, 5);
  });

  test("forkaster feilklikk og glemt-på-timer", () => {
    assert.equal(beregnVarighetsEstimat([5, 10, 29]), null, "for korte");
    assert.equal(beregnVarighetsEstimat([5 * 60 * 60]), null, "for lang");
  });

  test("filtrerer bort ugyldige tall", () => {
    assert.equal(beregnVarighetsEstimat([NaN, Infinity, 600]), 600);
  });
});

describe("estimatIMinutter", () => {
  test("runder til nærmeste minutt", () => {
    assert.equal(estimatIMinutter(600), 10);
    assert.equal(estimatIMinutter(630), 11);
  });

  test("aldri under ett minutt", () => {
    assert.equal(estimatIMinutter(35), 1);
  });

  test("null inn gir null ut", () => {
    assert.equal(estimatIMinutter(null), null);
  });
});

describe("estimatTekst", () => {
  test("klarspråk-badge", () => {
    assert.equal(estimatTekst([600, 540, 660]), "Sist: ~10 min");
  });

  test("ingen tekst uten historikk", () => {
    assert.equal(estimatTekst([]), null);
  });
});
