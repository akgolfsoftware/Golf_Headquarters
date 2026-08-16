/**
 * Enhetstester for delingssamtykke-reglene (plan T8): nyeste-rad-vinner,
 * tilbaketrekking, FORESATT-kravet for mindreårige, og per-gruppe-filtreringen
 * ekstern-leser-scopet bygger på. Kjøres av `npm test` (node:test via tsx).
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  harGyldigSamtykke,
  velgSamtykkedeSpillerePerGruppe,
  erDelingScope,
  DELING_SAMTYKKE_TEKST,
  DELING_SCOPES,
  DELING_SAMTYKKE_ROLLER,
  SAMTYKKE_TEKST_VERSJON,
  type DelingSamtykkeRad,
  type SamtykkeKandidat,
} from "./samtykke-regler";

function rad(overstyr: Partial<DelingSamtykkeRad>): DelingSamtykkeRad {
  return {
    scope: "TEST_RESULTATER",
    mottakerGruppeId: "gruppe-a",
    gitt: true,
    gittAvRolle: "SELV",
    createdAt: new Date("2026-08-01T10:00:00Z"),
    ...overstyr,
  };
}

const KRAV_VOKSEN = {
  scope: "TEST_RESULTATER" as const,
  mottakerGruppeId: "gruppe-a",
  kreverForesatt: false,
};

describe("harGyldigSamtykke", () => {
  it("ingen rader = ikke samtykket", () => {
    assert.equal(harGyldigSamtykke([], KRAV_VOKSEN), false);
  });

  it("gitt-rad gir samtykke", () => {
    assert.equal(harGyldigSamtykke([rad({})], KRAV_VOKSEN), true);
  });

  it("nyeste rad vinner: trekk etter gi stopper delingen", () => {
    const rader = [
      rad({ gitt: true, createdAt: new Date("2026-08-01T10:00:00Z") }),
      rad({ gitt: false, createdAt: new Date("2026-08-02T10:00:00Z") }),
    ];
    assert.equal(harGyldigSamtykke(rader, KRAV_VOKSEN), false);
  });

  it("nyeste rad vinner: nytt samtykke etter trekk åpner igjen", () => {
    const rader = [
      rad({ gitt: false, createdAt: new Date("2026-08-02T10:00:00Z") }),
      rad({ gitt: true, createdAt: new Date("2026-08-03T10:00:00Z") }),
      rad({ gitt: true, createdAt: new Date("2026-08-01T10:00:00Z") }),
    ];
    // Radene kommer i vilkårlig rekkefølge — nyeste (03.08, gitt) skal vinne.
    assert.equal(harGyldigSamtykke(rader, KRAV_VOKSEN), true);
  });

  it("samtykke mot gruppe A gjelder ikke gruppe B", () => {
    const rader = [rad({ mottakerGruppeId: "gruppe-a" })];
    assert.equal(
      harGyldigSamtykke(rader, { ...KRAV_VOKSEN, mottakerGruppeId: "gruppe-b" }),
      false,
    );
  });

  it("samtykke for TEST_RESULTATER gjelder ikke STATS", () => {
    const rader = [rad({ scope: "TEST_RESULTATER" })];
    assert.equal(harGyldigSamtykke(rader, { ...KRAV_VOKSEN, scope: "STATS" }), false);
  });

  it("mindreårig: SELV-rad teller aldri, uansett gitt=true", () => {
    const rader = [rad({ gittAvRolle: "SELV", gitt: true })];
    assert.equal(
      harGyldigSamtykke(rader, { ...KRAV_VOKSEN, kreverForesatt: true }),
      false,
    );
  });

  it("mindreårig: FORESATT-rad gir samtykke", () => {
    const rader = [rad({ gittAvRolle: "FORESATT", gitt: true })];
    assert.equal(
      harGyldigSamtykke(rader, { ...KRAV_VOKSEN, kreverForesatt: true }),
      true,
    );
  });

  it("mindreårig: nyere SELV-rad skygger ikke for foresatt-trekk", () => {
    // Foresatt trakk 02.08; spilleren selv «ga» 03.08. FORESATT-kravet gjør
    // at kun foresatt-raden teller — delingen forblir stengt.
    const rader = [
      rad({ gittAvRolle: "FORESATT", gitt: false, createdAt: new Date("2026-08-02T10:00:00Z") }),
      rad({ gittAvRolle: "SELV", gitt: true, createdAt: new Date("2026-08-03T10:00:00Z") }),
    ];
    assert.equal(
      harGyldigSamtykke(rader, { ...KRAV_VOKSEN, kreverForesatt: true }),
      false,
    );
  });

  it("voksen: SELV-rad teller", () => {
    const rader = [rad({ gittAvRolle: "SELV", gitt: true })];
    assert.equal(harGyldigSamtykke(rader, KRAV_VOKSEN), true);
  });

  it("voksen: nyeste rad vinner på tvers av roller", () => {
    const rader = [
      rad({ gittAvRolle: "FORESATT", gitt: true, createdAt: new Date("2026-08-01T10:00:00Z") }),
      rad({ gittAvRolle: "SELV", gitt: false, createdAt: new Date("2026-08-02T10:00:00Z") }),
    ];
    assert.equal(harGyldigSamtykke(rader, KRAV_VOKSEN), false);
  });
});

describe("velgSamtykkedeSpillerePerGruppe", () => {
  function kandidat(overstyr: Partial<SamtykkeKandidat>): SamtykkeKandidat {
    return {
      userId: "spiller-1",
      kreverForesatt: false,
      gruppeIder: ["gruppe-a"],
      samtykkeRader: [rad({})],
      ...overstyr,
    };
  }

  it("spiller med samtykke havner under riktig gruppe", () => {
    const resultat = velgSamtykkedeSpillerePerGruppe([kandidat({})], "TEST_RESULTATER");
    assert.deepEqual(resultat.get("gruppe-a"), ["spiller-1"]);
  });

  it("spiller uten samtykke er ikke med", () => {
    const resultat = velgSamtykkedeSpillerePerGruppe(
      [kandidat({ samtykkeRader: [] })],
      "TEST_RESULTATER",
    );
    assert.equal(resultat.get("gruppe-a"), undefined);
  });

  it("samtykke mot gruppe A åpner aldri gruppe B — selv med medlemskap i begge", () => {
    const resultat = velgSamtykkedeSpillerePerGruppe(
      [
        kandidat({
          gruppeIder: ["gruppe-a", "gruppe-b"],
          samtykkeRader: [rad({ mottakerGruppeId: "gruppe-a" })],
        }),
      ],
      "TEST_RESULTATER",
    );
    assert.deepEqual(resultat.get("gruppe-a"), ["spiller-1"]);
    assert.equal(resultat.get("gruppe-b"), undefined);
  });

  it("mindreårig uten foresatt-rad er ikke med; med foresatt-rad er hen med", () => {
    const uten = velgSamtykkedeSpillerePerGruppe(
      [kandidat({ kreverForesatt: true, samtykkeRader: [rad({ gittAvRolle: "SELV" })] })],
      "TEST_RESULTATER",
    );
    assert.equal(uten.get("gruppe-a"), undefined);

    const med = velgSamtykkedeSpillerePerGruppe(
      [kandidat({ kreverForesatt: true, samtykkeRader: [rad({ gittAvRolle: "FORESATT" })] })],
      "TEST_RESULTATER",
    );
    assert.deepEqual(med.get("gruppe-a"), ["spiller-1"]);
  });

  it("scope-filtrering: STATS-samtykke gir ikke TEST_RESULTATER-innsyn", () => {
    const resultat = velgSamtykkedeSpillerePerGruppe(
      [kandidat({ samtykkeRader: [rad({ scope: "STATS" })] })],
      "TEST_RESULTATER",
    );
    assert.equal(resultat.get("gruppe-a"), undefined);
  });

  it("flere spillere fordeles riktig per gruppe", () => {
    const resultat = velgSamtykkedeSpillerePerGruppe(
      [
        kandidat({ userId: "spiller-1", gruppeIder: ["gruppe-a"] }),
        kandidat({
          userId: "spiller-2",
          gruppeIder: ["gruppe-b"],
          samtykkeRader: [rad({ mottakerGruppeId: "gruppe-b" })],
        }),
        kandidat({ userId: "spiller-3", samtykkeRader: [rad({ gitt: false })] }),
      ],
      "TEST_RESULTATER",
    );
    assert.deepEqual(resultat.get("gruppe-a"), ["spiller-1"]);
    assert.deepEqual(resultat.get("gruppe-b"), ["spiller-2"]);
  });
});

describe("scope-kanon", () => {
  it("erDelingScope godtar kun de to kjente scopene", () => {
    assert.equal(erDelingScope("TEST_RESULTATER"), true);
    assert.equal(erDelingScope("STATS"), true);
    assert.equal(erDelingScope("TRENINGSPLAN"), false);
    assert.equal(erDelingScope(""), false);
  });

  it("alle scopes har samtykketekst med tittel, forklaring og punkter", () => {
    for (const scope of DELING_SCOPES) {
      const tekst = DELING_SAMTYKKE_TEKST[scope];
      assert.ok(tekst.tittel.length > 0);
      assert.ok(tekst.forklaring.length > 0);
      assert.ok(tekst.punkter.length > 0);
    }
  });
});

/**
 * Kanttilfeller som sto udekket etter T8 (kartlagt 2026-08-16). De handler om
 * RANDSONEN av samtykkereglene — der en feil ikke gir et rart svar, men gir
 * feil person innsyn i data om et barn.
 */
describe("kanttilfeller (lagt til 2026-08-16)", () => {
  it("ukjent scope-streng i en rad teller aldri med", () => {
    // `DelingSamtykkeRad.scope` er `string`, ikke `DelingScope` — radene kommer
    // fra DB der kolonnen er fritekst. En rad med et scope vi ikke kjenner
    // (gammelt navn, skrivefeil i en migrasjon) skal ignoreres, ikke tolkes.
    assert.equal(
      harGyldigSamtykke([rad({ scope: "TEST_RESULTATER_GAMMEL" })], KRAV_VOKSEN),
      false,
    );
  });

  it("ukjent gittAvRolle teller ikke som foresatt-samtykke", () => {
    assert.equal(
      harGyldigSamtykke([rad({ gittAvRolle: "TRENER" })], {
        ...KRAV_VOKSEN,
        kreverForesatt: true,
      }),
      false,
      "Kun FORESATT kan samtykke på vegne av en mindreårig (GDPR art. 8)",
    );
  });

  it("kandidat uten gruppemedlemskap gir ingen oppføringer", () => {
    const kart = velgSamtykkedeSpillerePerGruppe(
      [{ userId: "s1", kreverForesatt: false, gruppeIder: [], samtykkeRader: [rad({})] }],
      "TEST_RESULTATER",
    );
    assert.equal(kart.size, 0);
  });

  it("kartet får ingen tom liste for en gruppe uten samtykke", () => {
    // Subtil forskjell verdt å låse: `eksternLeserSpillerIderPerGruppe`
    // pre-seeder tomme arrays per gruppe, denne funksjonen gjør det ikke.
    // Blandes de to, ser en gruppe uten samtykke ut som «finnes ikke» i det
    // ene laget og «finnes, men tom» i det andre.
    const kart = velgSamtykkedeSpillerePerGruppe(
      [{ userId: "s1", kreverForesatt: false, gruppeIder: ["gruppe-b"], samtykkeRader: [] }],
      "TEST_RESULTATER",
    );
    assert.equal(kart.has("gruppe-b"), false);
  });

  /**
   * KARAKTERISERING — dette er ikke en velsignelse av oppførselen.
   *
   * `harGyldigSamtykke` sammenligner med streng `>`, så to rader med IDENTISK
   * createdAt avgjøres av rekkefølgen i arrayet — altså av `orderBy` i den
   * Prisma-spørringen som tilfeldigvis hentet dem. Prisma kan skrive to rader
   * i samme transaksjon med samme tidsstempel, så tilfellet er reelt.
   *
   * GDPR art. 7-3 tilsier at et TREKK bør vinne uansett rekkefølge. Å endre
   * det er en beslutning for Anders, ikke noe denne testen avgjør — men uten
   * denne testen kan en `orderBy`-endring snu svaret uten at noe blir rødt.
   */
  it("likt tidsstempel: første rad i listen vinner (rekkefølgeavhengig)", () => {
    const samtidig = new Date("2026-08-10T12:00:00Z");
    assert.equal(
      harGyldigSamtykke(
        [rad({ gitt: false, createdAt: samtidig }), rad({ gitt: true, createdAt: samtidig })],
        KRAV_VOKSEN,
      ),
      false,
    );
    assert.equal(
      harGyldigSamtykke(
        [rad({ gitt: true, createdAt: samtidig }), rad({ gitt: false, createdAt: samtidig })],
        KRAV_VOKSEN,
      ),
      true,
      "Samme to rader, motsatt rekkefølge, motsatt svar — se kommentaren over",
    );
  });
});

describe("samtykke-kanon", () => {
  it("SAMTYKKE_TEKST_VERSJON er en sorterbar ISO-dato", () => {
    // Versjonen lagres på hver samtykkerad som bevis for HVILKEN ordlyd
    // brukeren sa ja til. Er den ikke sorterbar, kan vi ikke svare på
    // «hvem samtykket til den gamle teksten?» når teksten endres.
    assert.match(SAMTYKKE_TEKST_VERSJON, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(!Number.isNaN(new Date(SAMTYKKE_TEKST_VERSJON).getTime()));
  });

  it("rollene er nøyaktig SELV og FORESATT", () => {
    // harGyldigSamtykke sammenligner mot strengen "FORESATT" direkte. Døpes
    // rollen om i konstanten uten å rette funksjonen, faller foresatt-kravet
    // stille bort og mindreåriges data deles på et SELV-samtykke.
    assert.deepEqual([...DELING_SAMTYKKE_ROLLER], ["SELV", "FORESATT"]);
  });

  it("hvert scope har tekst, og hver tekst hører til et scope", () => {
    assert.deepEqual(
      Object.keys(DELING_SAMTYKKE_TEKST).sort(),
      [...DELING_SCOPES].sort(),
      "Et scope uten samtykketekst gir en tom samtykkedialog",
    );
  });
});
