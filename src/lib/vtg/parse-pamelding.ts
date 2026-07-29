// Innlesing av påmeldingslister til «Veien til golf» (VTG).
//
// Listene leveres fra klubbens påmeldingssystem som semikolon-separert CSV med
// norske kolonnenavn og norske datoer (DD.MM.YYYY). Formatet er stabilt, og det
// samme gjelder svakhetene i det: feilskrevne e-poster, manglende postnummer,
// telefonnummer i blandet format, og barn som er oppført med foresattes
// kontaktinfo. Derfor er VALIDERINGEN hovedjobben her — en rad som importeres
// uten innsigelse, men med feil e-post, feiler stille: deltakeren møter ikke opp
// og ingen får vite hvorfor.
//
// Parseren skriver ikke til databasen og sender ingenting. Den returnerer
// deltakere + avvik, slik at importskjermen kan vise «3 rader trenger et blikk»
// FØR noe utsendelse settes i gang.

import Papa from "papaparse";

/** Alder der en deltaker regnes som myndig i denne sammenhengen. */
const MYNDIG_ALDER = 18;

export type AvvikAlvor = "feil" | "advarsel" | "info";

export type VtgAvvik = {
  /** 1-basert radnummer i CSV-en (uten header) — det brukeren ser i Excel. */
  rad: number;
  /** Deltakerens navn, for å kunne peke på riktig person i UI. */
  navn: string;
  felt: string;
  alvor: AvvikAlvor;
  /** Klarspråk, vises direkte til brukeren. */
  melding: string;
};

export type VtgDeltaker = {
  rad: number;
  navn: string;
  fodt: Date | null;
  alder: number | null;
  erMindreaarig: boolean;
  epost: string | null;
  telefon: string | null;
  adresse: string | null;
  postnr: string | null;
  poststed: string | null;
  foresattNavn: string | null;
  foresattTelefon: string | null;
  foresattEpost: string | null;
  /** Fritekst fra deltakeren — kan inneholde praktisk info treneren må se. */
  kommentar: string | null;
  /**
   * Hvem e-post faktisk skal til. For mindreårige er dette foresattes adresse,
   * aldri barnets — også når barnet har en e-post oppført (den er ofte
   * foresattes egen adresse gjenbrukt).
   */
  mottakerEpost: string | null;
  /** Null hvis raden kan sendes til; ellers grunnen. */
  kanSendes: boolean;
};

export type VtgPamelding = {
  /** Aktivitetsnavnet fra fila, f.eks. «Veien til golf 27.06.2026». */
  aktivitet: string | null;
  deltakere: VtgDeltaker[];
  avvik: VtgAvvik[];
  antallMindreaarige: number;
};

/** Kolonnenavn slik de faktisk står i eksporten (noen har innledende mellomrom). */
type RaaRad = Record<string, string | undefined>;

function tekst(v: string | undefined): string | null {
  const t = (v ?? "").trim();
  return t.length > 0 ? t : null;
}

/** «13.11.2012» → Date (UTC-midnatt, jf. dato-gotchaen om lokal tid). */
export function parseNorskDato(v: string | null): Date | null {
  if (!v) return null;
  const m = /^(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{4})$/.exec(v.trim());
  if (!m) return null;
  const [, d, mnd, aar] = m;
  const dag = Number(d);
  const maaned = Number(mnd);
  const år = Number(aar);
  if (maaned < 1 || maaned > 12 || dag < 1 || dag > 31) return null;
  const dato = new Date(Date.UTC(år, maaned - 1, dag));
  // Fanger 31.02 o.l. — Date ruller over til neste måned.
  if (dato.getUTCMonth() !== maaned - 1 || dato.getUTCDate() !== dag) return null;
  return dato;
}

/** Fylte år på referansedatoen. */
export function alderPa(fodt: Date, referanse: Date): number {
  let alder = referanse.getUTCFullYear() - fodt.getUTCFullYear();
  const harHattBursdag =
    referanse.getUTCMonth() > fodt.getUTCMonth() ||
    (referanse.getUTCMonth() === fodt.getUTCMonth() &&
      referanse.getUTCDate() >= fodt.getUTCDate());
  if (!harHattBursdag) alder -= 1;
  return alder;
}

/**
 * Norske numre kommer som 8 siffer, med 0047, med +47 og med mellomrom.
 * Normaliseres til +47XXXXXXXX så duplikatsjekk og utsending blir konsistent.
 * Ukjent format returneres renset, men uendret — vi kaster aldri data.
 */
export function normaliserTelefon(v: string | null): string | null {
  if (!v) return null;
  const rensket = v.replace(/[\s\-()]/g, "");
  if (/^\d{8}$/.test(rensket)) return `+47${rensket}`;
  if (/^0047\d{8}$/.test(rensket)) return `+47${rensket.slice(4)}`;
  if (/^\+47\d{8}$/.test(rensket)) return rensket;
  return rensket.length > 0 ? rensket : null;
}

/** «1679 Kråkerøy» → { postnr: "1679", poststed: "Kråkerøy" }. */
export function splittPostnrSted(v: string | null): {
  postnr: string | null;
  poststed: string | null;
} {
  if (!v) return { postnr: null, poststed: null };
  const m = /^(\d{4})\s+(.+)$/.exec(v.trim());
  if (m) return { postnr: m[1], poststed: m[2].trim() };
  return { postnr: null, poststed: v.trim() };
}

const EPOST_MONSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Domener som nesten alltid er en skrivefeil for en kjent leverandør.
 * Rene format-sjekker fanger ikke disse — «@gmail.co» er teknisk gyldig
 * (.co er Colombia), men er i praksis alltid ment som «.com».
 */
const DOMENE_FELLER: Record<string, string> = {
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.comm": "gmail.com",
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "hotmail.co": "hotmail.com",
  "hotmial.com": "hotmail.com",
  "outlook.co": "outlook.com",
  "icloud.co": "icloud.com",
  "yahoo.co": "yahoo.com",
  "online.no.": "online.no",
};

/** Levenshtein-avstand, kun brukt til å oppdage nesten-like e-poster. */
export function avstand(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 99;
  const forrige = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = forrige[0];
    forrige[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const midlertidig = forrige[j];
      forrige[j] = Math.min(
        forrige[j] + 1,
        forrige[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = midlertidig;
    }
  }
  return forrige[b.length];
}

function normaliserEpost(v: string | null): string | null {
  return v ? v.trim().toLowerCase() : null;
}

export type ParseOpsjoner = {
  /**
   * Dato alderen regnes mot. Oppgi kursdatoen når den er kjent — en deltaker
   * som fyller 18 mellom påmelding og kurs skal behandles som myndig på kurset.
   * Default: nå.
   */
  referansedato?: Date;
};

export function parseVtgPamelding(
  csv: string,
  opsjoner: ParseOpsjoner = {},
): VtgPamelding {
  const referanse = opsjoner.referansedato ?? new Date();

  const resultat = Papa.parse<RaaRad>(csv, {
    header: true,
    delimiter: ";",
    skipEmptyLines: true,
    // Eksporten har innledende mellomrom i minst ett kolonnenavn (« Faktura bet»).
    transformHeader: (h) => h.trim(),
  });

  const avvik: VtgAvvik[] = [];
  const deltakere: VtgDeltaker[] = [];
  let aktivitet: string | null = null;

  resultat.data.forEach((rad, i) => {
    const radnr = i + 1;
    const navn = tekst(rad["Navn"]);
    if (!navn) return; // helt tom rad — ignoreres uten støy

    aktivitet = aktivitet ?? tekst(rad["Aktivitet"]);

    const meld = (felt: string, alvor: AvvikAlvor, melding: string) =>
      avvik.push({ rad: radnr, navn, felt, alvor, melding });

    const fodt = parseNorskDato(tekst(rad["Født"]));
    if (!fodt) {
      meld("Født", "feil", "Mangler eller ugyldig fødselsdato — alder kan ikke avgjøres.");
    }
    const alder = fodt ? alderPa(fodt, referanse) : null;
    const erMindreaarig = alder !== null && alder < MYNDIG_ALDER;

    const epost = normaliserEpost(tekst(rad["E-post"]));
    const foresattEpost = normaliserEpost(tekst(rad["F.e-post"]));
    const foresattNavn = tekst(rad["Foresatt"]);
    const foresattTelefon = normaliserTelefon(tekst(rad["F.telefon"]));
    const telefon = normaliserTelefon(tekst(rad["Telefon"]));
    const { postnr, poststed } = splittPostnrSted(tekst(rad["Postnr/sted"]));
    const kommentar = tekst(rad["Kommentarer"]) ?? tekst(rad["Annen info"]);

    for (const [adresse, felt] of [
      [epost, "E-post"],
      [foresattEpost, "F.e-post"],
    ] as const) {
      if (!adresse) continue;
      if (!EPOST_MONSTER.test(adresse)) {
        meld(felt, "feil", `«${adresse}» ser ikke ut som en e-postadresse.`);
        continue;
      }
      const domene = adresse.split("@")[1] ?? "";
      const rettelse = DOMENE_FELLER[domene];
      if (rettelse) {
        meld(
          felt,
          "advarsel",
          `«${adresse}» er trolig skrivefeil for «${domene.replace(domene, rettelse)}». E-posten vil ikke komme fram.`,
        );
      }
    }

    // Deltakerens og foresattes adresse som er nesten like, er nesten alltid
    // samme adresse med en tastefeil i den ene.
    if (epost && foresattEpost && epost !== foresattEpost) {
      const d = avstand(epost, foresattEpost);
      if (d > 0 && d <= 2) {
        meld(
          "F.e-post",
          "advarsel",
          `Deltakerens og foresattes e-post skiller kun ${d} tegn («${epost}» / «${foresattEpost}») — sjekk hvilken som er riktig.`,
        );
      }
    }

    if (erMindreaarig) {
      if (!foresattNavn && !foresattEpost && !foresattTelefon) {
        meld(
          "Foresatt",
          "feil",
          `${navn} er ${alder} år, men har ingen foresatt oppført. Kan ikke kontaktes uten.`,
        );
      } else if (!foresattEpost) {
        meld(
          "F.e-post",
          "feil",
          `${navn} er ${alder} år — kursinformasjon skal til foresatt, men foresattes e-post mangler.`,
        );
      }
    } else if (!epost) {
      meld("E-post", "feil", "Mangler e-postadresse — kan ikke motta kursinformasjon.");
    }

    if (!postnr) {
      meld("Postnr/sted", "advarsel", "Mangler postnummer.");
    }
    if (!telefon && !foresattTelefon) {
      meld("Telefon", "advarsel", "Ingen telefonnummer oppgitt.");
    }
    if (kommentar) {
      meld("Kommentarer", "info", kommentar);
    }

    const mottakerEpost = erMindreaarig ? foresattEpost : epost;

    deltakere.push({
      rad: radnr,
      navn,
      fodt,
      alder,
      erMindreaarig,
      epost,
      telefon,
      adresse: tekst(rad["Adresse"]),
      postnr,
      poststed,
      foresattNavn,
      foresattTelefon,
      foresattEpost,
      kommentar,
      mottakerEpost,
      kanSendes: mottakerEpost !== null && EPOST_MONSTER.test(mottakerEpost),
    });
  });

  // Samme adresse på flere rader er lovlig (søsken, forelder som melder på
  // seg selv og barnet) — men nesten-like adresser på tvers av rader er en
  // sterk indikasjon på tastefeil i den ene.
  for (let i = 0; i < deltakere.length; i++) {
    for (let j = i + 1; j < deltakere.length; j++) {
      const a = deltakere[i].epost;
      const b = deltakere[j].epost;
      if (!a || !b || a === b) continue;
      const d = avstand(a, b);
      if (d > 0 && d <= 2) {
        avvik.push({
          rad: deltakere[j].rad,
          navn: deltakere[j].navn,
          felt: "E-post",
          alvor: "advarsel",
          melding: `«${b}» skiller kun ${d} tegn fra «${a}» på rad ${deltakere[i].rad} (${deltakere[i].navn}) — trolig tastefeil i den ene.`,
        });
      }
    }
  }

  return {
    aktivitet,
    deltakere,
    avvik,
    antallMindreaarige: deltakere.filter((d) => d.erMindreaarig).length,
  };
}
