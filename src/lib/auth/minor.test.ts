import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  FORELDER_FRIST_DAGER,
  GDPR_SAMTYKKE_ALDER,
  calculateAge,
  forelderFrist,
  isAwaitingGuardianConsent,
  isMinor,
  maaHaForesattSamtykke,
  sekstenaarsdag,
  venterPaaForelder,
  vurderEgenFodselsdato,
} from "./minor";

// GDPR art. 8 (S-13): isAwaitingGuardianConsent er beslutningen getCurrentUser
// håndhever sentralt. En bruker der den er true skal blokkeres fra
// data-mutasjoner (redirect til venterommet); false slipper gjennom.
describe("isAwaitingGuardianConsent (GDPR-gate)", () => {
  it("blokkerer mindreårig som trenger, men mangler, samtykke", () => {
    assert.equal(
      isAwaitingGuardianConsent({
        requiresGuardianConsent: true,
        guardianConsentGivenAt: null,
      }),
      true,
    );
  });

  it("slipper gjennom mindreårig der samtykke ER gitt", () => {
    assert.equal(
      isAwaitingGuardianConsent({
        requiresGuardianConsent: true,
        guardianConsentGivenAt: new Date("2026-01-01"),
      }),
      false,
    );
  });

  it("slipper gjennom voksen (ingen samtykke-krav)", () => {
    assert.equal(
      isAwaitingGuardianConsent({
        requiresGuardianConsent: false,
        guardianConsentGivenAt: null,
      }),
      false,
    );
  });

  it("slipper gjennom voksen selv om et samtykke-tidspunkt finnes", () => {
    assert.equal(
      isAwaitingGuardianConsent({
        requiresGuardianConsent: false,
        guardianConsentGivenAt: new Date("2026-01-01"),
      }),
      false,
    );
  });
});

describe("isMinor (16-årsgrense)", () => {
  const naa = new Date("2026-09-13T12:00:00Z");

  it("holder 16, ikke 13", () => {
    assert.equal(GDPR_SAMTYKKE_ALDER, 16);
  });

  it("er true for under 16 år", () => {
    const tiAarSiden = new Date();
    tiAarSiden.setFullYear(tiAarSiden.getFullYear() - 10);
    assert.equal(isMinor(tiAarSiden), true);
  });

  it("er false for over 16 år", () => {
    const tjueAarSiden = new Date();
    tjueAarSiden.setFullYear(tjueAarSiden.getFullYear() - 20);
    assert.equal(isMinor(tjueAarSiden), false);
  });

  it("skifter på bursdagen, ikke 365,25-døgn", () => {
    assert.equal(isMinor(new Date("2010-09-14"), naa), true);
    assert.equal(isMinor(new Date("2010-09-13"), naa), false);
    assert.equal(calculateAge(new Date("2010-09-13"), naa), 16);
  });

  it("antar voksen når fødselsdato mangler", () => {
    assert.equal(isMinor(null), false);
    assert.equal(isMinor(undefined), false);
  });
});

describe("maaHaForesattSamtykke", () => {
  const naa = new Date("2026-09-13T12:00:00Z");

  it("krever foresatt når fødselsdato er under 16 selv uten flagg", () => {
    assert.equal(
      maaHaForesattSamtykke(
        { requiresGuardianConsent: false, dateOfBirth: new Date("2012-01-01") },
        naa,
      ),
      true,
    );
  });

  it("krever foresatt når flagget er satt selv om fødselsdato sier voksen", () => {
    assert.equal(
      maaHaForesattSamtykke(
        { requiresGuardianConsent: true, dateOfBirth: new Date("1990-01-01") },
        naa,
      ),
      true,
    );
  });

  // D-63/TA-03: ukjent alder er ikke voksen (fail-closed).
  it("krever foresatt når både flagg og fødselsdato mangler", () => {
    assert.equal(
      maaHaForesattSamtykke({ requiresGuardianConsent: false, dateOfBirth: null }, naa),
      true,
    );
  });
});

describe("sekstenaarsdag", () => {
  it("gir samme kalenderdag 16 år senere", () => {
    assert.equal(
      sekstenaarsdag(new Date("2010-03-15T00:00:00Z"))?.toISOString(),
      "2026-03-15T00:00:00.000Z",
    );
  });

  it("29. februar gir 29. februar 16 år senere", () => {
    assert.equal(
      sekstenaarsdag(new Date("2008-02-29T00:00:00Z"))?.toISOString(),
      "2024-02-29T00:00:00.000Z",
    );
    assert.equal(
      sekstenaarsdag(new Date("2012-02-29T00:00:00Z"))?.toISOString(),
      "2028-02-29T00:00:00.000Z",
    );
  });

  it("null uten fødselsdato", () => {
    assert.equal(sekstenaarsdag(null), null);
  });
});

// D-63 (Anders): under 16 må forelder godkjenne innen sju dager etter at
// kontoen er opprettet. Full bruk de sju dagene, deretter låst. Deling og
// opptak er sperret hele tiden til forelder har godkjent.
describe("D-63: sju-dagersfristen", () => {
  const opprettet = new Date("2026-10-01T10:00:00Z");
  const dag = 24 * 60 * 60 * 1000;
  const barn = {
    requiresGuardianConsent: true,
    guardianConsentGivenAt: null,
    dateOfBirth: new Date("2013-05-05T00:00:00Z"),
    createdAt: opprettet,
    role: "PLAYER",
  };

  it("fristen er sju døgn etter opprettelse", () => {
    assert.equal(FORELDER_FRIST_DAGER, 7);
    assert.equal(forelderFrist(opprettet).toISOString(), "2026-10-08T10:00:00.000Z");
  });

  it("åpen dag 0 til like før dag 7, låst akkurat ved dag 7", () => {
    assert.equal(isAwaitingGuardianConsent(barn, opprettet), false);
    assert.equal(isAwaitingGuardianConsent(barn, new Date(opprettet.getTime() + 7 * dag - 1)), false);
    assert.equal(isAwaitingGuardianConsent(barn, new Date(opprettet.getTime() + 7 * dag)), true);
    assert.equal(isAwaitingGuardianConsent(barn, new Date(opprettet.getTime() + 30 * dag)), true);
  });

  it("godkjent forelder låser opp, enten via samtykkelenken eller godkjent kobling", () => {
    const etter = new Date(opprettet.getTime() + 10 * dag);
    assert.equal(
      isAwaitingGuardianConsent({ ...barn, guardianConsentGivenAt: new Date("2026-10-09T00:00:00Z") }, etter),
      false,
    );
    assert.equal(isAwaitingGuardianConsent({ ...barn, harGodkjentForelder: true }, etter), false);
    assert.equal(isAwaitingGuardianConsent({ ...barn, harGodkjentForelder: false }, etter), true);
  });

  it("fødselsdato under 16 låser selv når flagget mangler", () => {
    const etter = new Date(opprettet.getTime() + 8 * dag);
    assert.equal(isAwaitingGuardianConsent({ ...barn, requiresGuardianConsent: false }, etter), true);
  });

  it("uten opprettelsestidspunkt regnes fristen som passert (fail-closed)", () => {
    assert.equal(
      isAwaitingGuardianConsent({ requiresGuardianConsent: true, guardianConsentGivenAt: null }),
      true,
    );
  });

  it("spiller uten fødselsdato låses ikke, men deling og opptak er sperret", () => {
    const ukjent = {
      requiresGuardianConsent: false,
      guardianConsentGivenAt: null,
      dateOfBirth: null,
      createdAt: opprettet,
      role: "PLAYER",
    };
    const etter = new Date(opprettet.getTime() + 30 * dag);
    assert.equal(isAwaitingGuardianConsent(ukjent, etter), false);
    assert.equal(venterPaaForelder(ukjent, etter), true);
  });

  it("deling og opptak er sperret også de sju første dagene", () => {
    assert.equal(isAwaitingGuardianConsent(barn, opprettet), false);
    assert.equal(venterPaaForelder(barn, opprettet), true);
    assert.equal(venterPaaForelder({ ...barn, harGodkjentForelder: true }, opprettet), false);
    assert.equal(
      venterPaaForelder({ ...barn, guardianConsentGivenAt: opprettet }, opprettet),
      false,
    );
  });

  it("voksen spiller og coach uten fødselsdato sperres ikke", () => {
    const voksen = {
      requiresGuardianConsent: false,
      guardianConsentGivenAt: null,
      dateOfBirth: new Date("1990-01-01T00:00:00Z"),
      createdAt: opprettet,
      role: "PLAYER",
    };
    assert.equal(venterPaaForelder(voksen, opprettet), false);
    assert.equal(isAwaitingGuardianConsent(voksen, new Date(opprettet.getTime() + 30 * dag)), false);
    assert.equal(venterPaaForelder({ ...voksen, dateOfBirth: null, role: "COACH" }, opprettet), false);
  });
});

describe("D-63: grensen ved 16-årsdagen", () => {
  // Fødselsdato satt av coach (flagget ikke satt): fødselsdatoen avgjør alene.
  const spiller = {
    requiresGuardianConsent: false,
    guardianConsentGivenAt: null,
    dateOfBirth: new Date("2010-10-09T00:00:00Z"),
    createdAt: new Date("2026-01-01T00:00:00Z"),
    role: "PLAYER",
  };
  const dagenFor = new Date("2026-10-08T12:00:00Z");
  const bursdagen = new Date("2026-10-09T12:00:00Z");

  it("dagen før 16-årsdagen: låst og sperret", () => {
    assert.equal(isAwaitingGuardianConsent(spiller, dagenFor), true);
    assert.equal(venterPaaForelder(spiller, dagenFor), true);
  });

  it("på 16-årsdagen: verken låst eller sperret", () => {
    assert.equal(isAwaitingGuardianConsent(spiller, bursdagen), false);
    assert.equal(venterPaaForelder(spiller, bursdagen), false);
  });

  it("flagget fra oppstarten gjelder fortsatt etter 16 (nullstilles aldri automatisk)", () => {
    assert.equal(
      venterPaaForelder({ ...spiller, requiresGuardianConsent: true }, bursdagen),
      true,
    );
  });
});

describe("D-63/TP-02: spilleren kan ikke endre fødselsdatoen", () => {
  const satt = new Date("2012-03-04T00:00:00Z");

  it("første gang kan datoen settes", () => {
    assert.equal(vurderEgenFodselsdato(null, satt), "sett");
  });

  it("samme dato igjen er uendret", () => {
    assert.equal(vurderEgenFodselsdato(satt, new Date("2012-03-04T00:00:00Z")), "uendret");
  });

  it("ingen ny dato er uendret", () => {
    assert.equal(vurderEgenFodselsdato(satt, null), "uendret");
    assert.equal(vurderEgenFodselsdato(satt, undefined), "uendret");
  });

  it("en annen dato avvises", () => {
    assert.equal(vurderEgenFodselsdato(satt, new Date("1990-03-04T00:00:00Z")), "avvist");
    assert.equal(vurderEgenFodselsdato(satt, new Date("2012-03-05T00:00:00Z")), "avvist");
  });
});
