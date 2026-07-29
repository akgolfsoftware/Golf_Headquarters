// Tester for VTG-påmeldingsparseren.
//
// PERSONVERN: testdataene er OPPDIKTET. En ekte påmeldingsliste inneholder
// navn, adresse, telefon og e-post til mindreårige, og skal aldri sjekkes inn
// i repoet. Fixturene under gjenskaper derimot HVER svakhet som faktisk
// forekommer i eksporten fra klubbens påmeldingssystem (verifisert mot en
// reell fil 2026-07-28), slik at testene fanger de samme feilene:
//
//   - semikolon som skilletegn og innledende mellomrom i « Faktura bet»
//   - norske datoer (DD.MM.YYYY)
//   - barn oppført med foresattes e-post og telefon som sin egen
//   - toppdomene-tastefeil («@gmail.co» i stedet for «@gmail.com»)
//   - foresattes e-post som skiller ett tegn fra deltakerens
//   - nesten like e-poster på tvers av rader
//   - postnummer som mangler
//   - telefon med 0047-prefiks blandet med 8-sifrede numre
//   - kommentarfelt med praktisk informasjon treneren må se
//
// Kjør med: npm test

import { test } from "node:test";
import assert from "node:assert/strict";

import {
  parseVtgPamelding,
  parseNorskDato,
  alderPa,
  normaliserTelefon,
  splittPostnrSted,
  avstand,
} from "./parse-pamelding";

const HEADER =
  "OrdreID;Status;Medlnr; Faktura bet;Aktivitet;Navn;Født;E-post;Adresse;Postnr/sted;Telefon;Innmeldt;Foresatt;F.telefon;F.e-post;Annen info;Kommentarer";

/** Bygger en rad i samme kolonnerekkefølge som den ekte eksporten. */
function rad(felt: {
  navn: string;
  fodt: string;
  epost?: string;
  adresse?: string;
  postnrSted?: string;
  telefon?: string;
  foresatt?: string;
  fTelefon?: string;
  fEpost?: string;
  kommentar?: string;
}): string {
  return [
    "",
    "OK",
    "",
    "",
    "Veien til golf 27.06.2026",
    felt.navn,
    felt.fodt,
    felt.epost ?? "",
    felt.adresse ?? "Testveien 1",
    felt.postnrSted ?? "1600 Fredrikstad",
    felt.telefon ?? "40000001",
    "JA",
    felt.foresatt ?? "",
    felt.fTelefon ?? "",
    felt.fEpost ?? "",
    "",
    felt.kommentar ?? "",
  ].join(";");
}

function csv(...rader: string[]): string {
  return [HEADER, ...rader].join("\n");
}

/** Fast referansedato så alderstestene ikke råtner med kalenderen. */
const REF = new Date(Date.UTC(2026, 6, 28)); // 28.07.2026

test("parseNorskDato leser DD.MM.YYYY og avviser tull", () => {
  assert.deepEqual(parseNorskDato("13.11.2012"), new Date(Date.UTC(2012, 10, 13)));
  assert.deepEqual(parseNorskDato("01.03.2007"), new Date(Date.UTC(2007, 2, 1)));
  assert.equal(parseNorskDato("31.02.2010"), null, "31. februar finnes ikke");
  assert.equal(parseNorskDato("2012-11-13"), null, "ISO er ikke formatet fra eksporten");
  assert.equal(parseNorskDato(null), null);
});

test("alderPa teller fylte år, ikke årsdifferanse", () => {
  // Bursdag ikke passert på referansedatoen.
  assert.equal(alderPa(new Date(Date.UTC(2012, 10, 13)), REF), 13);
  // Bursdag passert.
  assert.equal(alderPa(new Date(Date.UTC(2009, 6, 15)), REF), 17);
  // Bursdag akkurat i dag → fylt.
  assert.equal(alderPa(new Date(Date.UTC(2008, 6, 28)), REF), 18);
  // Dagen før 18-årsdagen → fortsatt 17.
  assert.equal(alderPa(new Date(Date.UTC(2008, 6, 29)), REF), 17);
});

test("normaliserTelefon samler 8-siffer, 0047 og +47 til ett format", () => {
  assert.equal(normaliserTelefon("95931799"), "+4795931799");
  assert.equal(normaliserTelefon("004795931799"), "+4795931799");
  assert.equal(normaliserTelefon("+47 959 31 799"), "+4795931799");
  assert.equal(normaliserTelefon(null), null);
});

test("splittPostnrSted skiller postnummer fra sted, og tåler at det mangler", () => {
  assert.deepEqual(splittPostnrSted("1679 Kråkerøy"), {
    postnr: "1679",
    poststed: "Kråkerøy",
  });
  // Reelt tilfelle: postnummeret mangler helt og feltet inneholder rusk.
  assert.deepEqual(splittPostnrSted("Y Gamle Fredrikstad"), {
    postnr: null,
    poststed: "Y Gamle Fredrikstad",
  });
});

test("avstand finner nesten like strenger", () => {
  assert.equal(avstand("kari@eksempel.no", "kari@eksempel.no"), 0);
  assert.equal(avstand("kari@eksempel.no", "kori@eksempel.no"), 1);
  assert.ok(avstand("kari@eksempel.no", "heltannen@annet.no") > 2);
});

test("mindreårig får kursinfo til foresatt, ikke til barnet", () => {
  const resultat = parseVtgPamelding(
    csv(
      rad({
        navn: "Barn Testesen",
        fodt: "13.11.2012", // 13 år
        // Barnet er oppført med forelderens adresse som sin egen — vanlig i
        // ekte lister, og nettopp derfor må mottakeren avgjøres av alder.
        epost: "forelder@eksempel.no",
        telefon: "40000002",
        foresatt: "Forelder Testesen",
        fTelefon: "40000002",
        fEpost: "forelder@eksempel.no",
      }),
    ),
    { referansedato: REF },
  );

  assert.equal(resultat.deltakere.length, 1);
  const barn = resultat.deltakere[0];
  assert.equal(barn.alder, 13);
  assert.equal(barn.erMindreaarig, true);
  assert.equal(barn.mottakerEpost, "forelder@eksempel.no");
  assert.equal(barn.kanSendes, true);
  assert.equal(resultat.antallMindreaarige, 1);
});

test("mindreårig uten foresattes e-post blokkeres — ikke stille aksept", () => {
  const resultat = parseVtgPamelding(
    csv(
      rad({
        navn: "Barn Utenverge",
        fodt: "03.12.2010", // 15 år
        epost: "barn@eksempel.no",
        foresatt: "Forelder Utenverge",
        fTelefon: "40000003",
        // F.e-post mangler bevisst.
      }),
    ),
    { referansedato: REF },
  );

  const d = resultat.deltakere[0];
  assert.equal(d.erMindreaarig, true);
  assert.equal(d.kanSendes, false, "skal ikke kunne sendes til uten foresattes adresse");
  const feil = resultat.avvik.filter((a) => a.alvor === "feil");
  assert.equal(feil.length, 1);
  assert.equal(feil[0].felt, "F.e-post");
});

test("18-åring regnes som myndig og får e-posten selv", () => {
  const resultat = parseVtgPamelding(
    csv(rad({ navn: "Nesten Voksen", fodt: "24.10.2007", epost: "voksen@eksempel.no" })),
    { referansedato: REF },
  );
  const d = resultat.deltakere[0];
  assert.equal(d.alder, 18);
  assert.equal(d.erMindreaarig, false);
  assert.equal(d.mottakerEpost, "voksen@eksempel.no");
});

test("alder regnes mot kursdatoen når den oppgis", () => {
  // Fyller 18 mellom påmelding og kurs → myndig på selve kurset.
  const fodt = "01.10.2008";
  const vedPamelding = parseVtgPamelding(
    csv(rad({ navn: "Fyller Atten", fodt, epost: "atten@eksempel.no" })),
    { referansedato: REF },
  );
  assert.equal(vedPamelding.deltakere[0].erMindreaarig, true, "17 år i juli");

  const vedKurs = parseVtgPamelding(
    csv(rad({ navn: "Fyller Atten", fodt, epost: "atten@eksempel.no" })),
    { referansedato: new Date(Date.UTC(2026, 10, 1)) }, // 01.11.2026
  );
  assert.equal(vedKurs.deltakere[0].erMindreaarig, false, "18 år i november");
});

test("toppdomene-tastefeil flagges selv om formatet er gyldig", () => {
  // «@gmail.co» er teknisk en gyldig adresse (.co finnes), så en ren
  // format-sjekk slipper den gjennom. E-posten kommer likevel aldri fram.
  const resultat = parseVtgPamelding(
    csv(rad({ navn: "Voksen Skrivefeil", fodt: "26.01.1987", epost: "kari@gmail.co" })),
    { referansedato: REF },
  );
  const advarsler = resultat.avvik.filter((a) => a.alvor === "advarsel");
  assert.ok(
    advarsler.some((a) => a.felt === "E-post" && a.melding.includes("gmail.com")),
    "skal foreslå gmail.com",
  );
  // Formatet er gyldig, så raden er teknisk sendbar — men brukeren er varslet.
  assert.equal(resultat.deltakere[0].kanSendes, true);
});

test("foresattes e-post som skiller ett tegn fra barnets flagges", () => {
  const resultat = parseVtgPamelding(
    csv(
      rad({
        navn: "Barn Nestenlik",
        fodt: "07.11.2009", // 16 år
        epost: "elisabeth@eksempel.no",
        foresatt: "Forelder Nestenlik",
        fEpost: "elisabwth@eksempel.no", // én bokstav feil
      }),
    ),
    { referansedato: REF },
  );
  assert.ok(
    resultat.avvik.some(
      (a) => a.felt === "F.e-post" && a.alvor === "advarsel" && a.melding.includes("1 tegn"),
    ),
  );
});

test("nesten like e-poster på tvers av rader flagges", () => {
  const resultat = parseVtgPamelding(
    csv(
      rad({ navn: "Forelder Ekte", fodt: "26.01.1987", epost: "kari.hansen@eksempel.no" }),
      rad({ navn: "Annen Person", fodt: "01.03.1988", epost: "kari.hansen@eksempel.n" }),
    ),
    { referansedato: REF },
  );
  assert.ok(
    resultat.avvik.some(
      (a) => a.alvor === "advarsel" && a.felt === "E-post" && a.melding.includes("tastefeil"),
    ),
  );
});

test("identisk e-post på flere rader er lovlig og gir ingen advarsel", () => {
  // Forelder melder på seg selv og barnet med samme adresse — helt normalt.
  const resultat = parseVtgPamelding(
    csv(
      rad({ navn: "Forelder Delt", fodt: "26.01.1987", epost: "familie@eksempel.no" }),
      rad({
        navn: "Barn Delt",
        fodt: "25.02.2009",
        epost: "familie@eksempel.no",
        foresatt: "Forelder Delt",
        fEpost: "familie@eksempel.no",
      }),
    ),
    { referansedato: REF },
  );
  assert.equal(
    resultat.avvik.filter((a) => a.alvor === "advarsel" && a.felt === "E-post").length,
    0,
  );
  assert.equal(resultat.deltakere.length, 2);
});

test("kommentar fra deltakeren løftes fram som info", () => {
  const resultat = parseVtgPamelding(
    csv(
      rad({
        navn: "Trenger Utstyr",
        fodt: "25.02.2009",
        epost: "ungdom@eksempel.no",
        foresatt: "Forelder Utstyr",
        fEpost: "forelder.utstyr@eksempel.no",
        kommentar: "Trenger å låne golfsett til kurset",
      }),
    ),
    { referansedato: REF },
  );
  const info = resultat.avvik.filter((a) => a.alvor === "info");
  assert.equal(info.length, 1);
  assert.equal(info[0].melding, "Trenger å låne golfsett til kurset");
  assert.equal(resultat.deltakere[0].kommentar, "Trenger å låne golfsett til kurset");
});

test("manglende postnummer gir advarsel, ikke feil", () => {
  const resultat = parseVtgPamelding(
    csv(
      rad({
        navn: "Uten Postnummer",
        fodt: "01.03.1988",
        epost: "voksen2@eksempel.no",
        postnrSted: "Y Gamle Fredrikstad",
      }),
    ),
    { referansedato: REF },
  );
  assert.equal(resultat.deltakere[0].postnr, null);
  assert.ok(
    resultat.avvik.some((a) => a.felt === "Postnr/sted" && a.alvor === "advarsel"),
  );
  assert.equal(resultat.deltakere[0].kanSendes, true, "postnummer stopper ikke utsending");
});

test("aktivitetsnavn og telefonnormalisering leses fra fila", () => {
  const resultat = parseVtgPamelding(
    csv(
      rad({
        navn: "Internasjonalt Nummer",
        fodt: "26.01.1987",
        epost: "voksen3@eksempel.no",
        telefon: "004795931799",
      }),
    ),
    { referansedato: REF },
  );
  assert.equal(resultat.aktivitet, "Veien til golf 27.06.2026");
  assert.equal(resultat.deltakere[0].telefon, "+4795931799");
});

test("tomme rader hoppes over uten støy", () => {
  const resultat = parseVtgPamelding(
    csv(rad({ navn: "Eneste Deltaker", fodt: "26.01.1987", epost: "en@eksempel.no" }), ";;;;;;;;;;;;;;;;"),
    { referansedato: REF },
  );
  assert.equal(resultat.deltakere.length, 1);
});

test("blandet liste: voksne og barn skilles riktig", () => {
  const resultat = parseVtgPamelding(
    csv(
      rad({ navn: "Voksen En", fodt: "26.01.1987", epost: "v1@eksempel.no" }),
      rad({ navn: "Voksen To", fodt: "01.03.2007", epost: "v2@eksempel.no" }),
      rad({
        navn: "Barn En",
        fodt: "13.11.2012",
        epost: "b1@eksempel.no",
        foresatt: "Forelder En",
        fEpost: "f1@eksempel.no",
      }),
      rad({
        navn: "Barn To",
        fodt: "15.07.2009",
        epost: "b2@eksempel.no",
        foresatt: "Forelder To",
        fEpost: "f2@eksempel.no",
      }),
    ),
    { referansedato: REF },
  );

  assert.equal(resultat.deltakere.length, 4);
  assert.equal(resultat.antallMindreaarige, 2);
  assert.deepEqual(
    resultat.deltakere.map((d) => d.mottakerEpost),
    ["v1@eksempel.no", "v2@eksempel.no", "f1@eksempel.no", "f2@eksempel.no"],
    "barn → foresatt, voksne → seg selv",
  );
  assert.equal(resultat.deltakere.every((d) => d.kanSendes), true);
});
